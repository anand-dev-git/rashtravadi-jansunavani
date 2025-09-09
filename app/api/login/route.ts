import { NextRequest, NextResponse } from "next/server";
import { pool, query } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Note: The user_credentials table already exists with structure:
// username (varchar(45), PRIMARY KEY)
// password (varchar(45))

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Query the database for the user
    const [users] = await query<{
      username: string;
      password: string;
    }>("SELECT username, password FROM user_credentials WHERE username = ?", [
      username,
    ]);

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = users[0];

    // For now, we'll do a simple string comparison since the existing passwords are not hashed
    // In production, you should hash the passwords in the database
    if (password !== user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.username, // Using username as userId since there's no id field
        username: user.username,
        role: "user", // Default role since there's no role field
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Return success response with user data (excluding password)
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        username: user.username,
        role: "user",
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add a GET method to check if user is authenticated
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;

    // Query user details
    const [users] = await query<{
      username: string;
    }>("SELECT username FROM user_credentials WHERE username = ?", [
      decoded.userId,
    ]);

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        username: users[0].username,
        role: "user",
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
