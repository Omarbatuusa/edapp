import { IsString, IsOptional, IsUUID } from 'class-validator';

export class ValidateImportDto {
  @IsUUID()
  auditId: string;
}

export class ExecuteImportDto {
  @IsUUID()
  auditId: string;
}

export interface ImportRowError {
  row_index: number;
  field: string;
  error: string;
  severity: 'error' | 'warning';
}

export interface ImportValidationResult {
  auditId: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: ImportRowError[];
  preview: Record<string, any>[];
}

export interface ImportExecutionResult {
  auditId: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportRowError[];
  summary: Record<string, any>;
}
