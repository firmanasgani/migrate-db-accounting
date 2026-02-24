import { Command } from "commander";
import { testSourceConnection } from "./config/source.db.config";
import { testDestinationConnection } from "./config/destination.db.config";
import {
  getSourceTablesWithDescription,
  getDestinationTablesWithDescription,
  saveTableStructureToFile,
  saveBothDatabasesStructure,
} from "./services/table.service";
import { migrateTable, migrateTables } from "./services/migration.service";
import {
  allTableMappings,
  generateMigrationPlan,
  validateMappings,
} from "./mappings";

const program = new Command();

program
  .name("migrate-db")
  .description("Database migration tool from vico_accounting to accounting_dev")
  .version("1.0.0");

// Test connection to source database
program
  .command("test-connection-source")
  .description("Test connection to source database")
  .action(async () => {
    console.log("=".repeat(50));
    console.log("Testing Source Database Connection");
    console.log("=".repeat(50));

    const isConnected = await testSourceConnection();

    console.log("=".repeat(50));
    if (isConnected) {
      console.log("✓ Connection test completed successfully!");
      process.exit(0);
    } else {
      console.log("✗ Connection test failed!");
      process.exit(1);
    }
  });

// Test connection to destination database
program
  .command("test-connection-destination")
  .description("Test connection to destination database")
  .action(async () => {
    console.log("=".repeat(50));
    console.log("Testing Destination Database Connection");
    console.log("=".repeat(50));

    const isConnected = await testDestinationConnection();

    console.log("=".repeat(50));
    if (isConnected) {
      console.log("✓ Connection test completed successfully!");
      process.exit(0);
    } else {
      console.log("✗ Connection test failed!");
      process.exit(1);
    }
  });

// Migrate command
program
  .command("migrate")
  .description("Run database migration for all mapped tables")
  .option(
    "--dry-run",
    "Run migration in dry-run mode (no actual changes)",
    false
  )
  .option("--batch-size <size>", "Number of rows to process per batch", "1000")
  .option(
    "--skip-if-exists",
    "Skip tables that already have data in destination",
    false
  )
  .option("-t, --table <name>", "Migrate specific table only")
  .action(async (options) => {
    try {
      console.log("\n" + "=".repeat(60));
      console.log("🚀 DATABASE MIGRATION");
      console.log("=".repeat(60));

      if (options.dryRun) {
        console.log("⚠️  DRY RUN MODE - No data will be inserted");
      }

      // Validate mappings first
      console.log("\n🔍 Validating table mappings...");
      const validation = validateMappings();

      if (!validation.valid) {
        console.error("\n✗ Mapping validation failed:");
        validation.errors.forEach((err) => console.error(`  - ${err}`));
        process.exit(1);
      }

      console.log("✓ All mappings are valid");

      // Get migration plan
      const plan = generateMigrationPlan();
      console.log(
        `\n📋 Migration plan: ${plan.executionOrder.length} table(s)`
      );
      console.log(`Execution order: ${plan.executionOrder.join(" → ")}`);

      // Filter for specific table if requested
      let tablesToMigrate = plan.tables;
      if (options.table) {
        const tableMapping = tablesToMigrate.find(
          (t) => t.sourceTable === options.table
        );
        if (!tableMapping) {
          console.error(`\n✗ Table mapping not found: ${options.table}`);
          console.log(
            `Available tables: ${plan.tables
              .map((t) => t.sourceTable)
              .join(", ")}`
          );
          process.exit(1);
        }
        tablesToMigrate = [tableMapping];
        console.log(`\n📌 Migrating single table: ${options.table}`);
      }

      // Run migration
      const migrationOptions = {
        dryRun: options.dryRun,
        batchSize: parseInt(options.batchSize, 10),
        skipIfExists: options.skipIfExists,
      };

      const results = await migrateTables(tablesToMigrate, migrationOptions);

      // Check for failures
      const hasFailures = results.some(
        (r) => r.failedRows > 0 || r.errors.length > 0
      );

      if (hasFailures) {
        console.log("\n⚠️  Migration completed with errors");
        process.exit(1);
      } else {
        console.log("\n✓ Migration completed successfully!");
        process.exit(0);
      }
    } catch (error: any) {
      console.error("\n✗ Migration failed:", error.message);
      console.error(error.stack);
      process.exit(1);
    }
  });

// List tables from source database
program
  .command("list-tables-source")
  .description("List all tables in source database and save to JSON file")
  .option("-o, --output <dir>", "Output directory", "output")
  .action(async (options) => {
    try {
      console.log("=".repeat(50));
      console.log("Listing Source Database Tables");
      console.log("=".repeat(50));

      const tables = await getSourceTablesWithDescription();
      console.log(`\n✓ Found ${tables.length} tables in source database\n`);

      // Display table names and column count
      tables.forEach((table, index) => {
        console.log(
          `${index + 1}. ${table.tableName} (${table.tableType}) - ${
            table.columns.length
          } columns, ${table.rowCount || 0} rows`
        );
      });

      // Save to file
      const filePath = await saveTableStructureToFile(
        tables,
        "source",
        options.output
      );
      console.log(`\n✓ Saved to: ${filePath}`);
      console.log("=".repeat(50));
      process.exit(0);
    } catch (error) {
      console.error("✗ Error listing tables:", error);
      process.exit(1);
    }
  });

// List tables from destination database
program
  .command("list-tables-destination")
  .description("List all tables in destination database and save to JSON file")
  .option("-o, --output <dir>", "Output directory", "output")
  .action(async (options) => {
    try {
      console.log("=".repeat(50));
      console.log("Listing Destination Database Tables");
      console.log("=".repeat(50));

      const tables = await getDestinationTablesWithDescription();
      console.log(
        `\n✓ Found ${tables.length} tables in destination database\n`
      );

      // Display table names and column count
      tables.forEach((table, index) => {
        console.log(
          `${index + 1}. ${table.tableName} (${table.tableType}) - ${
            table.columns.length
          } columns, ${table.rowCount || 0} rows`
        );
      });

      // Save to file
      const filePath = await saveTableStructureToFile(
        tables,
        "destination",
        options.output
      );
      console.log(`\n✓ Saved to: ${filePath}`);
      console.log("=".repeat(50));
      process.exit(0);
    } catch (error) {
      console.error("✗ Error listing tables:", error);
      process.exit(1);
    }
  });

// List tables from both databases
program
  .command("list-tables-both")
  .description("List all tables in both databases and save to JSON files")
  .option("-o, --output <dir>", "Output directory", "output")
  .action(async (options) => {
    try {
      console.log("=".repeat(50));
      console.log("Listing Tables from Both Databases");
      console.log("=".repeat(50));

      const { sourceFile, destinationFile } = await saveBothDatabasesStructure(
        options.output
      );

      console.log("\n✓ Files saved successfully:");
      console.log(`  - Source: ${sourceFile}`);
      console.log(`  - Destination: ${destinationFile}`);
      console.log("=".repeat(50));
      process.exit(0);
    } catch (error) {
      console.error("✗ Error listing tables:", error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
