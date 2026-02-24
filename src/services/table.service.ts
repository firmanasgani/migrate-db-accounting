import { createSourceConnection } from "../config/source.db.config";
import { createDestinationConnection } from "../config/destination.db.config";
import { RowDataPacket } from "mysql2/promise";
import fs from "fs/promises";
import path from "path";

interface ColumnDescription {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
}

interface TableWithDescription {
  tableName: string;
  tableType: string;
  engine?: string;
  rowCount?: number;
  columns: ColumnDescription[];
}

interface DatabaseStructureInfo {
  database: string;
  totalTables: number;
  tables: TableWithDescription[];
  timestamp: string;
}

export async function getSourceTablesWithDescription(): Promise<
  TableWithDescription[]
> {
  const connection = await createSourceConnection();
  try {
    // Get all tables
    const [tables] = await connection.query<RowDataPacket[]>(
      `SELECT 
        TABLE_NAME as tableName,
        TABLE_TYPE as tableType,
        ENGINE as engine,
        TABLE_ROWS as rowCount
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME`
    );

    const tablesWithDescription: TableWithDescription[] = [];

    // Describe each table
    for (const table of tables) {
      console.log(`  Describing table: ${table.tableName}...`);

      const [columns] = await connection.query<RowDataPacket[]>(
        `DESCRIBE \`${table.tableName}\``
      );

      tablesWithDescription.push({
        tableName: table.tableName,
        tableType: table.tableType,
        engine: table.engine,
        rowCount: table.rowCount,
        columns: columns.map((col) => ({
          Field: col.Field,
          Type: col.Type,
          Null: col.Null,
          Key: col.Key,
          Default: col.Default,
          Extra: col.Extra,
        })),
      });
    }

    return tablesWithDescription;
  } finally {
    await connection.end();
  }
}

export async function getDestinationTablesWithDescription(): Promise<
  TableWithDescription[]
> {
  const connection = await createDestinationConnection();
  try {
    // Get all tables
    const [tables] = await connection.query<RowDataPacket[]>(
      `SELECT 
        TABLE_NAME as tableName,
        TABLE_TYPE as tableType,
        ENGINE as engine,
        TABLE_ROWS as rowCount
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME`
    );

    const tablesWithDescription: TableWithDescription[] = [];

    // Describe each table
    for (const table of tables) {
      console.log(`  Describing table: ${table.tableName}...`);

      const [columns] = await connection.query<RowDataPacket[]>(
        `DESCRIBE \`${table.tableName}\``
      );

      tablesWithDescription.push({
        tableName: table.tableName,
        tableType: table.tableType,
        engine: table.engine,
        rowCount: table.rowCount,
        columns: columns.map((col) => ({
          Field: col.Field,
          Type: col.Type,
          Null: col.Null,
          Key: col.Key,
          Default: col.Default,
          Extra: col.Extra,
        })),
      });
    }

    return tablesWithDescription;
  } finally {
    await connection.end();
  }
}

export async function saveTableStructureToFile(
  tables: TableWithDescription[],
  database: string,
  outputDir: string = "output"
): Promise<string> {
  // Create output directory if it doesn't exist
  const outputPath = path.resolve(process.cwd(), outputDir);
  await fs.mkdir(outputPath, { recursive: true });

  const data: DatabaseStructureInfo = {
    database,
    totalTables: tables.length,
    tables,
    timestamp: new Date().toISOString(),
  };

  const fileName = `${database}_structure_${Date.now()}.json`;
  const filePath = path.join(outputPath, fileName);

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

  return filePath;
}

export async function saveBothDatabasesStructure(
  outputDir: string = "output"
): Promise<{
  sourceFile: string;
  destinationFile: string;
}> {
  console.log("Fetching tables from source database...");
  const sourceTables = await getSourceTablesWithDescription();
  console.log(`✓ Found ${sourceTables.length} tables in source database`);

  console.log("\nFetching tables from destination database...");
  const destinationTables = await getDestinationTablesWithDescription();
  console.log(
    `✓ Found ${destinationTables.length} tables in destination database`
  );

  console.log("\nSaving to files...");
  const sourceFile = await saveTableStructureToFile(
    sourceTables,
    "source",
    outputDir
  );
  const destinationFile = await saveTableStructureToFile(
    destinationTables,
    "destination",
    outputDir
  );

  return { sourceFile, destinationFile };
}
