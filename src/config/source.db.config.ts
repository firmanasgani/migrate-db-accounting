import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export interface SourceDbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export const sourceDbConfig: SourceDbConfig = {
  host: process.env.SOURCE_DB_HOST || "localhost",
  port: parseInt(process.env.SOURCE_DB_PORT || "3306", 10),
  user: process.env.SOURCE_DB_USER || "root",
  password: process.env.SOURCE_DB_PASSWORD || "",
  database: process.env.SOURCE_DB_NAME || "vico_accounting",
};

export async function createSourceConnection() {
  try {
    const connection = await mysql.createConnection(sourceDbConfig);
    return connection;
  } catch (error) {
    console.error("Failed to create source database connection:", error);
    throw error;
  }
}

export async function testSourceConnection(): Promise<boolean> {
  let connection;
  try {
    console.log("Testing source database connection...");
    console.log("Config:", {
      host: sourceDbConfig.host,
      port: sourceDbConfig.port,
      user: sourceDbConfig.user,
      database: sourceDbConfig.database,
    });

    connection = await createSourceConnection();

    // Test query
    const [rows] = await connection.query("SELECT 1 + 1 AS result");
    console.log("✓ Source database connection successful!");
    console.log("Test query result:", rows);

    return true;
  } catch (error) {
    console.error("✗ Source database connection failed:", error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
