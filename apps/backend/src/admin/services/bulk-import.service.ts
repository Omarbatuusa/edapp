import { Injectable, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { ImportAudit, ImportStatus } from '../entities/import-audit.entity';
import { ImportRowError, ImportValidationResult, ImportExecutionResult } from '../dto/bulk-import.dto';
import { BrandImportStrategy } from './import-strategies/brand-import.strategy';
import { StaffImportStrategy } from './import-strategies/staff-import.strategy';

/**
 * Strategy interface — each entity type implements this to handle its own import logic.
 */
export interface ImportStrategy {
  /** Map of Excel column headers → entity field names */
  getColumnMap(): Record<string, string>;

  /** Required columns that must be present in the Excel file */
  getRequiredColumns(): string[];

  /** Validate a single parsed row. Returns errors (empty = valid). */
  validateRow(
    row: Record<string, any>,
    rowIndex: number,
    tenantId: string | null,
    manager: EntityManager,
  ): Promise<ImportRowError[]>;

  /** Save a single validated row. Called inside a transaction. */
  executeRow(
    row: Record<string, any>,
    tenantId: string | null,
    userId: string,
    manager: EntityManager,
  ): Promise<void>;
}

@Injectable()
export class BulkImportService implements OnModuleInit {
  private readonly strategies = new Map<string, ImportStrategy>();

  constructor(
    @InjectRepository(ImportAudit)
    private readonly auditRepo: Repository<ImportAudit>,
  ) {}

  onModuleInit() {
    this.registerStrategy('brand', new BrandImportStrategy());
    this.registerStrategy('staff', new StaffImportStrategy());
  }

  /** Register an import strategy for a given type */
  registerStrategy(importType: string, strategy: ImportStrategy): void {
    this.strategies.set(importType, strategy);
  }

  /** Get registered strategy or throw */
  getStrategy(importType: string): ImportStrategy {
    const strategy = this.strategies.get(importType);
    if (!strategy) {
      throw new BadRequestException(`No import strategy registered for type: ${importType}`);
    }
    return strategy;
  }

  /** List registered import types */
  getRegisteredTypes(): string[] {
    return Array.from(this.strategies.keys());
  }

  /** Create audit record for a new import */
  async createAudit(
    importType: string,
    originalFilename: string,
    userId: string,
    tenantId: string | null,
  ): Promise<ImportAudit> {
    const audit = this.auditRepo.create({
      import_type: importType,
      original_filename: originalFilename,
      user_id: userId,
      tenant_id: tenantId,
      status: ImportStatus.PENDING,
    } as any);
    return this.auditRepo.save(audit) as any as Promise<ImportAudit>;
  }

  /** Parse Excel buffer into rows using the strategy's column map */
  async parseExcel(
    buffer: Buffer | ArrayBuffer,
    strategy: ImportStrategy,
  ): Promise<Record<string, any>[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.worksheets.find(
      ws => ws.name !== 'Instructions' && ws.name !== 'Valid Values',
    ) || workbook.worksheets[0];

    if (!worksheet || worksheet.rowCount < 2) {
      throw new BadRequestException('Excel file is empty or has no data rows');
    }

    const columnMap = strategy.getColumnMap();
    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];

    headerRow.eachCell((cell, colNumber) => {
      const headerText = String(cell.value || '').trim();
      headers[colNumber] = headerText;
    });

    // Map headers to field names
    const colToField: Record<number, string> = {};
    for (const [colNum, header] of Object.entries(headers)) {
      const field = columnMap[header] || columnMap[header.toLowerCase()];
      if (field) {
        colToField[Number(colNum)] = field;
      }
    }

    // Check required columns
    const requiredCols = strategy.getRequiredColumns();
    const mappedFields = Object.values(colToField);
    const missing = requiredCols.filter(r => !mappedFields.includes(r));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing required columns: ${missing.join(', ')}. Found: ${headers.filter(Boolean).join(', ')}`,
      );
    }

    // Parse data rows
    const rows: Record<string, any>[] = [];
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const record: Record<string, any> = {};
      let hasData = false;

      for (const [colNum, field] of Object.entries(colToField)) {
        const cell = row.getCell(Number(colNum));
        let value = cell.value;

        // Handle ExcelJS rich text
        if (value && typeof value === 'object' && 'richText' in value) {
          value = (value as any).richText.map((rt: any) => rt.text).join('');
        }
        // Handle ExcelJS formula results
        if (value && typeof value === 'object' && 'result' in value) {
          value = (value as any).result;
        }

        record[field] = value != null ? String(value).trim() : '';
        if (record[field]) hasData = true;
      }

      if (hasData) {
        rows.push(record);
      }
    }

    return rows;
  }

  /** Validate all rows and return preview */
  async validate(
    auditId: string,
    buffer: Buffer,
    tenantId: string | null,
    manager: EntityManager,
  ): Promise<ImportValidationResult> {
    const audit = await this.auditRepo.findOne({ where: { id: auditId } });
    if (!audit) throw new NotFoundException('Import audit not found');

    const strategy = this.getStrategy(audit.import_type);

    await this.auditRepo.update(auditId, { status: ImportStatus.VALIDATING });

    const rows = await this.parseExcel(buffer, strategy);
    const allErrors: ImportRowError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rowErrors = await strategy.validateRow(rows[i], i + 2, tenantId, manager);
      allErrors.push(...rowErrors);
    }

    const errorRowIndices = new Set(allErrors.filter(e => e.severity === 'error').map(e => e.row_index));

    await this.auditRepo.update(auditId, {
      status: ImportStatus.PREVIEWING,
      total_rows: rows.length,
      error_count: errorRowIndices.size,
      errors: allErrors,
    } as any);

    return {
      auditId,
      totalRows: rows.length,
      validRows: rows.length - errorRowIndices.size,
      errorRows: errorRowIndices.size,
      errors: allErrors,
      preview: rows.slice(0, 20), // First 20 rows for preview
    };
  }

  /** Execute import — save all valid rows */
  async execute(
    auditId: string,
    buffer: Buffer,
    tenantId: string | null,
    userId: string,
    manager: EntityManager,
  ): Promise<ImportExecutionResult> {
    const audit = await this.auditRepo.findOne({ where: { id: auditId } });
    if (!audit) throw new NotFoundException('Import audit not found');

    const strategy = this.getStrategy(audit.import_type);

    await this.auditRepo.update(auditId, { status: ImportStatus.IMPORTING });

    const rows = await this.parseExcel(buffer, strategy);
    const allErrors: ImportRowError[] = [];
    let successCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowIndex = i + 2; // Excel row number (1-based header + 1)

      // Validate first
      const rowErrors = await strategy.validateRow(rows[i], rowIndex, tenantId, manager);
      const hasBlockingError = rowErrors.some(e => e.severity === 'error');

      if (hasBlockingError) {
        allErrors.push(...rowErrors);
        continue;
      }

      // Execute row
      try {
        await strategy.executeRow(rows[i], tenantId, userId, manager);
        successCount++;
      } catch (err: any) {
        allErrors.push({
          row_index: rowIndex,
          field: '_system',
          error: err.message || 'Unknown error',
          severity: 'error',
        });
      }
    }

    const errorCount = rows.length - successCount;

    await this.auditRepo.update(auditId, {
      status: ImportStatus.COMPLETE,
      total_rows: rows.length,
      success_count: successCount,
      error_count: errorCount,
      errors: allErrors,
      completed_at: new Date(),
      result_summary: {
        totalRows: rows.length,
        successCount,
        errorCount,
        importType: audit.import_type,
      },
    } as any);

    return {
      auditId,
      totalRows: rows.length,
      successCount,
      errorCount,
      errors: allErrors,
      summary: { importType: audit.import_type },
    };
  }

  /** Get audit by ID */
  async getAudit(auditId: string): Promise<ImportAudit> {
    const audit = await this.auditRepo.findOne({ where: { id: auditId } });
    if (!audit) throw new NotFoundException('Import audit not found');
    return audit;
  }

  /** List audits for a tenant */
  async listAudits(tenantId: string | null, limit = 50): Promise<ImportAudit[]> {
    return this.auditRepo.find({
      where: tenantId ? { tenant_id: tenantId } : {},
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
