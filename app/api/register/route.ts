import { NextRequest, NextResponse } from "next/server";
import { pool, query } from "@/lib/db";
import bcrypt from "bcryptjs";

// Ensure user_credentials table exists
async function ensureUserCredentialsTable(): Promise<void> {
  const createSql = `
    CREATE TABLE IF NOT EXISTS user_credentials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      full_name VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await pool.query(createSql);
}

export async function POST(request: NextRequest) {
  try {
    // Ensure the user_credentials table exists
    await ensureUserCredentialsTable();

    const { username, password, email, full_name } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const [existingUsers] = await query<{ id: number }>(
      "SELECT id FROM user_credentials WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await query(
      "INSERT INTO user_credentials (username, password_hash, email, full_name) VALUES (?, ?, ?, ?)",
      [username, password_hash, email || null, full_name || null]
    );

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      userId: (result as any).insertId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
