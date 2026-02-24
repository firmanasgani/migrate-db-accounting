import { createSourceConnection } from "../config/source.db.config";
import { createDestinationConnection } from "../config/destination.db.config";
import { TableMapping } from "../mappings/types";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export interface MigrationResult {
  tableName: string;
  totalRows: number;
  migratedRows: number;
  failedRows: number;
  errors: string[];
  duration: number; // in milliseconds
}

export interface MigrationOptions {
  batchSize?: number;
  dryRun?: boolean;
  skipIfExists?: boolean;
}

/**
 * Migrate data from source table to destination table
 */
export async function migrateTable(
  mapping: TableMapping,
  options: MigrationOptions = {}
): Promise<MigrationResult> {
  const startTime = Date.now();
  const { batchSize = 1000, dryRun = false, skipIfExists = false } = options;

  const result: MigrationResult = {
    tableName: mapping.sourceTable,
    totalRows: 0,
    migratedRows: 0,
    failedRows: 0,
    errors: [],
    duration: 0,
  };

  const sourceConn = await createSourceConnection();
  const destConn = await createDestinationConnection();

  try {
    // Check if destination table has data
    if (skipIfExists) {
      const [countResult] = await destConn.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM ${mapping.destinationTable}`
      );
      if (countResult[0].count > 0) {
        console.log(
          `⏭️  Skipping ${mapping.sourceTable} - destination table already has data`
        );
        result.duration = Date.now() - startTime;
        return result;
      }
    }

    // Get total count from source
    const [countResult] = await sourceConn.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM ${mapping.sourceTable}`
    );
    result.totalRows = countResult[0].count;

    console.log(
      `📊 Migrating ${mapping.sourceTable}: ${result.totalRows} rows`
    );

    if (result.totalRows === 0) {
      console.log(`⚠️  No data to migrate from ${mapping.sourceTable}`);
      result.duration = Date.now() - startTime;
      return result;
    }

    // Select all data from source table
    console.log(
      `🔍 Fetching data from source table: ${mapping.sourceTable}...`
    );
    const [sourceRows] = await sourceConn.query<RowDataPacket[]>(
      `SELECT * FROM ${mapping.sourceTable}`
    );

    console.log(`✓ Fetched ${sourceRows.length} rows from source`);

    if (dryRun) {
      console.log(`🔍 DRY RUN MODE - No data will be inserted`);
      console.log(`Sample row:`, sourceRows[0]);
      result.migratedRows = sourceRows.length;
      result.duration = Date.now() - startTime;
      return result;
    }

    // Process in batches
    const batches = Math.ceil(sourceRows.length / batchSize);
    console.log(
      `📦 Processing ${batches} batch(es) of ${batchSize} rows each...`
    );

    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, sourceRows.length);
      const batch = sourceRows.slice(start, end);

      console.log(
        `  Batch ${i + 1}/${batches}: Inserting rows ${start + 1} to ${end}...`
      );

      try {
        // Build column names from mapping
        const destinationColumns = mapping.columns.map(
          (col) => col.destination
        );
        // Wrap column names with backticks to escape reserved keywords
        const columnNames = destinationColumns
          .map((col) => `\`${col}\``)
          .join(", ");
        const placeholders = destinationColumns.map(() => "?").join(", ");

        // Prepare insert query
        const insertQuery = `
          INSERT INTO ${mapping.destinationTable} (${columnNames})
          VALUES (${placeholders})
        `;

        // Insert each row in the batch
        for (const row of batch) {
          try {
            // Map values according to column mapping
            const values = mapping.columns.map((colMapping) => {
              // Check if source column is defined and exists in row
              if (colMapping.source && row.hasOwnProperty(colMapping.source)) {
                const value = row[colMapping.source];
                // Apply transformation if defined
                return colMapping.transform
                  ? colMapping.transform(value)
                  : value;
              } else {
                // Use default value if source column doesn't exist
                return colMapping.defaultValue !== undefined
                  ? colMapping.defaultValue
                  : null;
              }
            });

            await destConn.query(insertQuery, values);
            result.migratedRows++;
          } catch (error: any) {
            result.failedRows++;
            result.errors.push(`Row error: ${error.message}`);
            console.error(`    ✗ Failed to insert row:`, error.message);
          }
        }

        console.log(`  ✓ Batch ${i + 1}/${batches} completed`);
      } catch (error: any) {
        result.errors.push(`Batch ${i + 1} error: ${error.message}`);
        console.error(`  ✗ Batch ${i + 1} failed:`, error.message);
      }
    }

    console.log(
      `✓ Migration completed: ${result.migratedRows}/${result.totalRows} rows migrated`
    );

    // Run post-migration validation if provided
    if (mapping.postMigrationValidation) {
      console.log(`🔍 Running post-migration validation...`);
      try {
        const [validationResult] = await destConn.query<RowDataPacket[]>(
          mapping.postMigrationValidation
        );
        console.log(`✓ Validation result:`, validationResult[0]);
      } catch (error: any) {
        console.error(`⚠️  Validation failed:`, error.message);
      }
    }
  } catch (error: any) {
    result.errors.push(`Migration error: ${error.message}`);
    console.error(
      `✗ Migration failed for ${mapping.sourceTable}:`,
      error.message
    );
  } finally {
    await sourceConn.end();
    await destConn.end();
    result.duration = Date.now() - startTime;
  }

  return result;
}

/**
 * Migrate multiple tables in order
 */
export async function migrateTables(
  mappings: TableMapping[],
  options: MigrationOptions = {}
): Promise<MigrationResult[]> {
  const results: MigrationResult[] = [];

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 Starting migration of ${mappings.length} table(s)`);
  console.log(`${"=".repeat(60)}\n`);

  for (const mapping of mappings) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(
      `📋 Table: ${mapping.sourceTable} → ${mapping.destinationTable}`
    );
    if (mapping.dependencies && mapping.dependencies.length > 0) {
      console.log(`📌 Dependencies: ${mapping.dependencies.join(", ")}`);
    }
    console.log(`${"─".repeat(60)}\n`);

    const result = await migrateTable(mapping, options);
    results.push(result);

    // Summary for this table
    console.log(`\n📊 Summary for ${mapping.sourceTable}:`);
    console.log(`   Total rows: ${result.totalRows}`);
    console.log(`   Migrated: ${result.migratedRows}`);
    console.log(`   Failed: ${result.failedRows}`);
    console.log(`   Duration: ${(result.duration / 1000).toFixed(2)}s`);
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.length}`);
    }
  }

  // Overall summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 MIGRATION SUMMARY`);
  console.log(`${"=".repeat(60)}`);

  const totalRows = results.reduce((sum, r) => sum + r.totalRows, 0);
  const totalMigrated = results.reduce((sum, r) => sum + r.migratedRows, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failedRows, 0);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

  console.log(`Total tables: ${mappings.length}`);
  console.log(`Total rows: ${totalRows}`);
  console.log(`Migrated: ${totalMigrated}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Total duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`${"=".repeat(60)}\n`);

  return results;
}
