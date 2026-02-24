import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

export interface DestinationDbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export const destinationDbConfig: DestinationDbConfig = {
  host: process.env.DEST_DB_HOST || "localhost",
  port: parseInt(process.env.DEST_DB_PORT || "3306", 10),
  user: process.env.DEST_DB_USER || "root",
  password: process.env.DEST_DB_PASSWORD || "",
  database: process.env.DEST_DB_NAME || "accounting_dev",
};

export async function createDestinationConnection() {
  try {
    const connection = await mysql.createConnection(destinationDbConfig);
    return connection;
  } catch (error) {
    console.error("Failed to create destination database connection:", error);
    throw error;
  }
}

export async function testDestinationConnection(): Promise<boolean> {
  let connection;
  try {
    console.log("Testing destination database connection...");
    console.log("Config:", {
      host: destinationDbConfig.host,
      port: destinationDbConfig.port,
      user: destinationDbConfig.user,
      database: destinationDbConfig.database,
    });

    connection = await createDestinationConnection();

    const [rows] = await connection.query("SELECT 1 + 1 AS result");
    console.log("✓ Destination database connection successful!");
    console.log("Test query result:", rows);

    return true;
  } catch (error) {
    console.error("✗ Destination database connection failed:", error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
