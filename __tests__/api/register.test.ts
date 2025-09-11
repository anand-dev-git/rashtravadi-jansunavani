import { POST } from "@/app/api/register/route";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

// Mock database
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
  pool: {
    query: jest.fn(),
  },
}));

const { query } = require("@/lib/db");

// Mock NextRequest
jest.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string, public init?: RequestInit) {}
    async json() {
      return JSON.parse((this.init?.body as string) || "{}");
    }
  },
  NextResponse: {
    json: (data: any, init?: any) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    }),
  },
}));

describe("/api/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 for missing username", async () => {
    const request = new NextRequest("http://localhost:3000/api/register", {
      method: "POST",
      body: JSON.stringify({ password: "testpass" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Username and password are required");
  });

  it("returns 400 for missing password", async () => {
    const request = new NextRequest("http://localhost:3000/api/register", {
      method: "POST",
      body: JSON.stringify({ username: "testuser" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Username and password are required");
  });

  it("returns 400 for short password", async () => {
    const request = new NextRequest("http://localhost:3000/api/register", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", password: "123" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Password must be at least 6 characters long");
  });

  it("returns 409 for existing username", async () => {
    query.mockResolvedValue([[{ id: 1 }], {}]);

    const request = new NextRequest("http://localhost:3000/api/register", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", password: "testpass" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Username already exists");
  });

  it("returns 201 for successful registration", async () => {
    query
      .mockResolvedValueOnce([[], {}]) // Check existing user
      .mockResolvedValueOnce([{ insertId: 1 }, {}]); // Insert new user
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");

    const request = new NextRequest("http://localhost:3000/api/register", {
      method: "POST",
      body: JSON.stringify({
        username: "testuser",
        password: "testpass",
        email: "test@example.com",
        full_name: "Test User",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("User registered successfully");
    expect(data.userId).toBe(1);
  });

  it("handles database errors", async () => {
    query.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/register", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", password: "testpass" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
