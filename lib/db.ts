import mysql from "mysql2/promise";

// Fill these in via environment variables or hard-code for local testing
// Example env vars to set in .env.local:
// MYSQL_HOST=localhost
// MYSQL_PORT=3306
// MYSQL_USER=root
// MYSQL_PASSWORD=your_password
// MYSQL_DATABASE=rashtrawadi

const {
  MYSQL_HOST = "db-agent-crm.c7a8sksgmigz.ap-south-1.rds.amazonaws.com",
  MYSQL_PORT = "3306",
  MYSQL_USER = "dbmaster",
  MYSQL_PASSWORD = "yJk9qZPCoh8EQQ*cDV95FFArJC#t",
  MYSQL_DATABASE = "agentcrmdb",
} = process.env;

export const pool = mysql.createPool({
  host: MYSQL_HOST || "<MYSQL_HOST>",
  port: Number(MYSQL_PORT || 3306),
  user: MYSQL_USER || "<MYSQL_USER>",
  password: MYSQL_PASSWORD || "<MYSQL_PASSWORD>",
  database: MYSQL_DATABASE || "<MYSQL_DATABASE>",
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
      age INT,
      gender VARCHAR(32),
      problem VARCHAR(255),
      pdf_link TEXT,
      name VARCHAR(255),
      memberName VARCHAR(255),
      phoneNumber VARCHAR(64),
      status VARCHAR(64),
      remarks TEXT,
      memberPhone VARCHAR(64)
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
