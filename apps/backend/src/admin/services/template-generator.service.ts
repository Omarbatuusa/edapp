import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as ExcelJS from 'exceljs';

interface TemplateConfig {
  sheetName: string;
  columns: Array<{
    header: string;
    key: string;
    width: number;
    required?: boolean;
    validValues?: string[];
    description?: string;
  }>;
  instructions: string[];
  dictLookups?: Array<{
    columnKey: string;
    tableName: string;
    labelColumn?: string;
  }>;
}

@Injectable()
export class TemplateGeneratorService {
  private readonly templates = new Map<string, TemplateConfig>();

  constructor(private readonly dataSource: DataSource) {
    this.registerDefaultTemplates();
  }

  registerTemplate(type: string, config: TemplateConfig): void {
    this.templates.set(type, config);
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.templates.keys());
  }

  async generateTemplate(type: string): Promise<Buffer> {
    const config = this.templates.get(type);
    if (!config) {
      throw new BadRequestException(`No template registered for type: ${type}. Available: ${this.getRegisteredTypes().join(', ')}`);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'EdApp';
    workbook.created = new Date();

    // ── Data sheet ──
    const dataSheet = workbook.addWorksheet(config.sheetName);

    // Header row styling
    dataSheet.columns = config.columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width,
    }));

    const headerRow = dataSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A73E8' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 30;

    // Mark required columns with red asterisk in comment
    for (let i = 0; i < config.columns.length; i++) {
      const col = config.columns[i];
      const cell = headerRow.getCell(i + 1);
      if (col.required) {
        cell.value = `${col.header} *`;
      }
      if (col.description) {
        cell.note = col.description;
      }
    }

    // Freeze header row
    dataSheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Load valid values from dict tables
    for (const col of config.columns) {
      if (col.validValues && col.validValues.length > 0) {
        // Static valid values — add data validation
        const colIndex = config.columns.indexOf(col) + 1;
        const colLetter = this.getColumnLetter(colIndex);

        for (let row = 2; row <= 1001; row++) {
          dataSheet.getCell(`${colLetter}${row}`).dataValidation = {
            type: 'list',
            allowBlank: !col.required,
            formulae: [`"${col.validValues.join(',')}"`],
            showErrorMessage: true,
            errorTitle: 'Invalid Value',
            error: `Please select from: ${col.validValues.join(', ')}`,
          };
        }
      }
    }

    // Load dict table lookups
    if (config.dictLookups) {
      for (const lookup of config.dictLookups) {
        try {
          const labelCol = lookup.labelColumn || 'label';
          const rows = await this.dataSource.query(
            `SELECT ${labelCol} FROM ${lookup.tableName} WHERE is_active = true ORDER BY sort_order, ${labelCol}`,
          );
          const values = rows.map((r: any) => r[labelCol]);

          if (values.length > 0) {
            const col = config.columns.find(c => c.key === lookup.columnKey);
            if (col) {
              col.validValues = values;
              const colIndex = config.columns.indexOf(col) + 1;
              const colLetter = this.getColumnLetter(colIndex);

              for (let row = 2; row <= 1001; row++) {
                dataSheet.getCell(`${colLetter}${row}`).dataValidation = {
                  type: 'list',
                  allowBlank: !col.required,
                  formulae: [`"${values.join(',')}"`],
                  showErrorMessage: true,
                  errorTitle: 'Invalid Value',
                  error: `Please select a valid option`,
                };
              }
            }
          }
        } catch (err) {
          console.warn(`[TEMPLATE] Failed to load dict values for ${lookup.tableName}:`, err);
        }
      }
    }

    // ── Instructions sheet ──
    const instrSheet = workbook.addWorksheet('Instructions');
    instrSheet.getColumn(1).width = 80;

    instrSheet.getCell('A1').value = `EdApp Import Template — ${config.sheetName}`;
    instrSheet.getCell('A1').font = { bold: true, size: 14 };
    instrSheet.getCell('A2').value = `Version: 1.0 | Generated: ${new Date().toISOString().split('T')[0]}`;
    instrSheet.getCell('A2').font = { italic: true, color: { argb: 'FF888888' } };

    let row = 4;
    instrSheet.getCell(`A${row}`).value = 'Instructions:';
    instrSheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    row++;

    for (const instruction of config.instructions) {
      instrSheet.getCell(`A${row}`).value = instruction;
      row++;
    }

    row += 2;
    instrSheet.getCell(`A${row}`).value = 'Column Descriptions:';
    instrSheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    row++;

    for (const col of config.columns) {
      const req = col.required ? ' (REQUIRED)' : ' (optional)';
      instrSheet.getCell(`A${row}`).value = `• ${col.header}${req}${col.description ? ': ' + col.description : ''}`;
      row++;
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private getColumnLetter(colNum: number): string {
    let letter = '';
    while (colNum > 0) {
      const mod = (colNum - 1) % 26;
      letter = String.fromCharCode(65 + mod) + letter;
      colNum = Math.floor((colNum - mod) / 26);
    }
    return letter;
  }

  private registerDefaultTemplates(): void {
    // ── Brand template ──
    this.registerTemplate('brand', {
      sheetName: 'Brands',
      columns: [
        { header: 'Brand Name', key: 'brand_name', width: 30, required: true, description: 'Official brand name' },
        { header: 'Brand Slug', key: 'brand_slug', width: 25, required: true, description: 'URL-friendly identifier (lowercase, no spaces, e.g. "allied-schools")' },
        { header: 'Description', key: 'description', width: 40, description: 'Short brand description' },
        { header: 'Contact Email', key: 'contact_email', width: 30, description: 'Primary contact email' },
        { header: 'Contact Phone', key: 'contact_phone', width: 20, description: 'Primary contact number' },
        { header: 'Website URL', key: 'website_url', width: 35, description: 'Brand website URL' },
      ],
      instructions: [
        '1. Fill in brand details in the "Brands" sheet.',
        '2. Columns marked with * are required.',
        '3. Brand Slug must be unique, lowercase, and use hyphens instead of spaces.',
        '4. Upload the completed file via the Import button in EdApp admin.',
      ],
    });

    // ── Branch/Tenant template ──
    this.registerTemplate('branch', {
      sheetName: 'Branches',
      columns: [
        { header: 'School Name', key: 'tenant_name', width: 35, required: true },
        { header: 'Tenant Slug', key: 'tenant_slug', width: 25, required: true, description: 'URL-friendly identifier' },
        { header: 'Is Main Branch', key: 'is_main_branch', width: 15, validValues: ['Yes', 'No'], description: 'Yes for main campus' },
        { header: 'Province', key: 'province', width: 20 },
        { header: 'City', key: 'city', width: 20 },
        { header: 'Address', key: 'physical_address', width: 40 },
        { header: 'Phone', key: 'contact_phone', width: 20 },
        { header: 'Email', key: 'contact_email', width: 30 },
        { header: 'EMIS Number', key: 'emis_number', width: 15, description: 'Dept of Education EMIS number' },
      ],
      instructions: [
        '1. Fill in school/branch details in the "Branches" sheet.',
        '2. Each row creates one tenant/branch.',
        '3. Tenant Slug must be unique, lowercase, hyphens only.',
        '4. Set "Is Main Branch" to Yes for the primary campus.',
      ],
    });

    // ── Subject template ──
    this.registerTemplate('subject', {
      sheetName: 'Subjects',
      columns: [
        { header: 'Subject Code', key: 'subject_code', width: 15, required: true, description: 'Unique code (e.g. MATH, ENG-HL)' },
        { header: 'Subject Name', key: 'subject_name', width: 35, required: true },
        { header: 'Category', key: 'category', width: 25, description: 'e.g. Languages, Mathematics, Sciences' },
        { header: 'Type', key: 'type', width: 20, description: 'Academic, Practical, Vocational, etc.', validValues: ['Academic', 'Practical', 'Vocational', 'Sport', 'Cultural', 'Extracurricular'] },
        { header: 'Language Level', key: 'language_level', width: 15, validValues: ['HL', 'FAL', 'SAL', 'N/A'] },
      ],
      dictLookups: [
        { columnKey: 'category', tableName: 'dict_subject_categories' },
      ],
      instructions: [
        '1. Fill in subjects in the "Subjects" sheet.',
        '2. Subject Code must be unique across the system.',
        '3. Category and Type can be selected from dropdown lists.',
        '4. Language Level only applies to language subjects.',
      ],
    });

    // ── Staff template ──
    this.registerTemplate('staff', {
      sheetName: 'Staff',
      columns: [
        { header: 'Email', key: 'email', width: 30, required: true },
        { header: 'First Name', key: 'first_name', width: 20, required: true },
        { header: 'Last Name', key: 'last_name', width: 20, required: true },
        { header: 'Title', key: 'title', width: 10, validValues: ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Rev'] },
        { header: 'ID Number', key: 'id_number', width: 20 },
        { header: 'Phone', key: 'phone', width: 20 },
        { header: 'Role', key: 'role', width: 25, required: true, description: 'e.g. TEACHER, HOD, ADMIN_OFFICER', validValues: ['TEACHER', 'CLASS_TEACHER', 'HOD', 'DEPUTY_PRINCIPAL', 'PRINCIPAL', 'ADMIN_OFFICER', 'FINANCE_OFFICER', 'RECEPTIONIST', 'COUNSELLOR', 'LIBRARIAN', 'IT_ADMIN'] },
        { header: 'Department', key: 'department', width: 25 },
        { header: 'Start Date', key: 'employment_start_date', width: 15, description: 'YYYY-MM-DD' },
      ],
      instructions: [
        '1. Fill in staff details in the "Staff" sheet.',
        '2. Email must be unique — it creates both a user account and staff profile.',
        '3. A temporary password will be generated for new users.',
        '4. Role determines the system permissions assigned.',
        '5. Start Date format: YYYY-MM-DD (e.g. 2025-01-15).',
      ],
    });

    // ── Phase template ──
    this.registerTemplate('phase', {
      sheetName: 'Phases',
      columns: [
        { header: 'Phase Code', key: 'code', width: 15, required: true, description: 'Unique code (e.g. FP, IP, SP)' },
        { header: 'Phase Name', key: 'label', width: 35, required: true, description: 'e.g. Foundation Phase' },
        { header: 'Sort Order', key: 'sort_order', width: 12, description: 'Display order (number)' },
      ],
      instructions: [
        '1. Fill in phase details.',
        '2. Phase Code must be unique.',
        '3. Sort Order determines display sequence.',
      ],
    });

    // ── Grade template ──
    this.registerTemplate('grade', {
      sheetName: 'Grades',
      columns: [
        { header: 'Grade Code', key: 'code', width: 15, required: true, description: 'e.g. GR01, GR12' },
        { header: 'Grade Name', key: 'label', width: 30, required: true, description: 'e.g. Grade 1, Grade 12' },
        { header: 'Sort Order', key: 'sort_order', width: 12 },
      ],
      instructions: [
        '1. Fill in grade details.',
        '2. Grade Code must be unique.',
      ],
    });

    // ── Class template ──
    this.registerTemplate('class', {
      sheetName: 'Classes',
      columns: [
        { header: 'Class Name', key: 'class_name', width: 20, required: true, description: 'e.g. 10A, 7B' },
        { header: 'Grade Code', key: 'grade_code', width: 15, required: true, description: 'Must match existing grade' },
        { header: 'Class Gender', key: 'class_gender', width: 15, validValues: ['Mixed', 'Male', 'Female'] },
        { header: 'Max Capacity', key: 'max_capacity', width: 15, description: 'Maximum learners' },
        { header: 'Teacher Email', key: 'teacher_email', width: 30, description: 'Class teacher email (optional)' },
      ],
      instructions: [
        '1. Fill in class details.',
        '2. Grade Code must match an existing grade linked to this tenant.',
        '3. Teacher Email is optional — links the class to an existing staff member.',
      ],
    });

    // ── Subject Offering template ──
    this.registerTemplate('subject_offering', {
      sheetName: 'Subject Offerings',
      columns: [
        { header: 'Subject Code', key: 'subject_code', width: 15, required: true },
        { header: 'Grade Code', key: 'grade_code', width: 15, required: true },
        { header: 'Stream Code', key: 'stream_code', width: 15, description: 'Optional subject stream' },
        { header: 'Is Compulsory', key: 'is_compulsory', width: 15, validValues: ['Yes', 'No'] },
        { header: 'Periods Per Week', key: 'periods_per_week', width: 18, description: 'Number of periods' },
      ],
      instructions: [
        '1. Links subjects to grades (what is taught in each grade).',
        '2. Subject Code and Grade Code must match existing records.',
        '3. Stream Code is optional for tracking different academic streams.',
      ],
    });

    // ── Subject Stream template ──
    this.registerTemplate('subject_stream', {
      sheetName: 'Subject Streams',
      columns: [
        { header: 'Stream Code', key: 'stream_code', width: 15, required: true },
        { header: 'Stream Name', key: 'stream_name', width: 30, required: true },
        { header: 'Description', key: 'description', width: 45 },
      ],
      instructions: [
        '1. Define academic streams (e.g. Sciences, Commerce, Humanities).',
        '2. Stream Code must be unique.',
      ],
    });
  }
}
