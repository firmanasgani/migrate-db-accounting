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
}
