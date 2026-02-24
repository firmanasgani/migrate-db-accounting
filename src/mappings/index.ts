/**
 * Table Mappings Index
 *
 * This file exports all table mappings and provides utilities
 * for working with migration configurations
 */

export * from "../interfaces/mapping.interface";

import { assetsCategoryMapping } from "./assets_category.mapping";
import { TableMapping } from "../interfaces/mapping.interface";
import { assetsImageMapping } from "./assets_image.mapping";
import { assetsLocationMapping } from "./assets_location.mapping";
import { entityMapping } from "./entity.mapping";
import { bankMapping } from "./bank.mapping";
import { rolesMapping } from "./roles.mapping";
import { userTypeMapping } from "./user_type.mapping";
import { usersMapping } from "./users.mapping";
import { settingsMapping } from "./settings.mapping";
import { bankAccountsMapping } from "./bank_accounts.mapping";
import { coaMapping } from "./coa.mapping";
import { coaBankAccountMapping } from "./coa_bank_accounts.mapping";
import { coaMovementsMapping } from "./coa_movements.mapping";
import { userRoleMapping } from "./user_role.mapping";
import { journalMapping } from "./journals.mapping";
import { reportHeadersMapping } from "./report_headers.mapping";
import { reportContentMapping } from "./report_content.mapping";
import { journalDetailsMapping } from "./journal_details.mapping";
import { messageMapping } from "./message.mapping";
import { assetsMapping } from "./assets.mapping";
import { logsMapping } from "./logs.mapping";

export interface MigrationPlan {
  tables: TableMapping[];
  executionOrder: string[]; // Order of table migration based on dependencies
}

/**
 * All table mappings
 * Add new table mappings here as they are created
 */
export const allTableMappings: TableMapping[] = [
  entityMapping,
  assetsCategoryMapping,
  assetsLocationMapping,
  bankMapping,
  rolesMapping,
  userTypeMapping,
  settingsMapping,
  usersMapping,
  bankAccountsMapping,
  coaMapping,
  assetsMapping,
  assetsImageMapping,
  coaBankAccountMapping,
  coaMovementsMapping,
  userRoleMapping,
  journalMapping,
  reportHeadersMapping,
  reportContentMapping,
  journalDetailsMapping,
  logsMapping,
  messageMapping,
];

/**
 * Get table mapping by source table name
 */
export function getTableMapping(
  sourceTableName: string
): TableMapping | undefined {
  return allTableMappings.find((m) => m.sourceTable === sourceTableName);
}

/**
 * Generate migration execution order based on dependencies
 * Uses topological sort to ensure dependencies are migrated first
 */
export function generateMigrationPlan(): MigrationPlan {
  const visited = new Set<string>();
  const executionOrder: string[] = [];

  function visit(tableName: string, mapping: TableMapping) {
    if (visited.has(tableName)) {
      return;
    }

    visited.add(tableName);

    // Visit dependencies first
    if (mapping.dependencies) {
      for (const dep of mapping.dependencies) {
        const depMapping = getTableMapping(dep);
        if (depMapping) {
          visit(dep, depMapping);
        }
      }
    }

    executionOrder.push(tableName);
  }

  // Visit all tables
  for (const mapping of allTableMappings) {
    visit(mapping.sourceTable, mapping);
  }

  return {
    tables: allTableMappings,
    executionOrder,
  };
}

/**
 * Validate all table mappings
 * Checks for circular dependencies and missing dependencies
 */
export function validateMappings(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for circular dependencies
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function detectCycle(tableName: string, mapping: TableMapping): boolean {
    if (visiting.has(tableName)) {
      errors.push(`Circular dependency detected involving table: ${tableName}`);
      return true;
    }

    if (visited.has(tableName)) {
      return false;
    }

    visiting.add(tableName);

    if (mapping.dependencies) {
      for (const dep of mapping.dependencies) {
        const depMapping = getTableMapping(dep);
        if (!depMapping) {
          errors.push(
            `Missing dependency mapping for table: ${dep} (required by ${tableName})`
          );
        } else if (detectCycle(dep, depMapping)) {
          return true;
        }
      }
    }

    visiting.delete(tableName);
    visited.add(tableName);
    return false;
  }

  for (const mapping of allTableMappings) {
    detectCycle(mapping.sourceTable, mapping);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
