/**
 * Table Mapping Type Definitions
 *
 * This file contains all type definitions for table mappings
 */

export interface ColumnMapping {
  source?: string;
  destination: string;
  transform?: (value: any) => any;
  defaultValue?: any;
  required?: boolean;
  comment?: string;
}

export interface TableMapping {
  sourceTable: string;
  destinationTable: string;
  columns: ColumnMapping[];
  dependencies?: string[]; // Tables that must be migrated first
  postMigrationValidation?: string; // SQL query to validate migration
  batchSize?: number; // Number of rows to migrate per batch
  skipIfExists?: boolean; // Skip migration if destination table has data
}

export interface MigrationPlan {
  tables: TableMapping[];
  executionOrder: string[]; // Order of table migration based on dependencies
}
