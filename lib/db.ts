import mysql from "mysql2/promise";
import { config, validateConfig } from "./config";

// Validate configuration on startup
validateConfig();

export const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function ensureComplaintRecordsTable(): Promise<void> {
  const createSql = `
    CREATE TABLE IF NOT EXISTS complaint_records (
      ticketNumber VARCHAR(64) PRIMARY KEY,
      address TEXT,
      constituency VARCHAR(255),
      language VARCHAR(64),
      createdDate DATETIME,
      age VARCHAR(10),
      gender VARCHAR(32),
      problem VARCHAR(255),
      pdf_link TEXT,
      name VARCHAR(255),
      memberName VARCHAR(255),
      dbEmployeeName VARCHAR(255),
      phoneNumber VARCHAR(64),
      status VARCHAR(64),
      remarks TEXT,
      memberPhone VARCHAR(64),
      complaintSource VARCHAR(64) DEFAULT 'Web',
      problem_des VARCHAR(150)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await pool.query(createSql);
}

export async function query<T = any>(
  sql: string,
  params: any[] = []
): Promise<[T[], any]> {
  const [rows, fields] = await pool.query(sql, params);
  return [rows as T[], fields];
}
