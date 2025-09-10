import { POST } from "@/app/api/login/route";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

// Mock database
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}));

const { query } = require("@/lib/db");

describe("/api/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 for missing username", async () => {
    const request = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({ password: "testpass" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Username and password are required");
  });

  it("returns 400 for missing password", async () => {
    const request = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "testuser" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Username and password are required");
  });

  it("returns 401 for invalid credentials", async () => {
    query.mockResolvedValue([[], {}]);

    const request = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", password: "wrongpass" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid credentials");
  });

  it("returns 401 for incorrect password", async () => {
    const mockUser = {
      id: 1,
      username: "testuser",
      password_hash: "hashedpassword",
    };

    query.mockResolvedValue([[mockUser], {}]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const request = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", password: "wrongpass" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid credentials");
  });

  it("returns 200 and token for valid credentials", async () => {
    const mockUser = {
      id: 1,
      username: "testuser",
      password_hash: "hashedpassword",
    };

    query.mockResolvedValue([[mockUser], {}]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const request = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", password: "testpass" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.username).toBe("testuser");
  });

  it("handles database errors", async () => {
    query.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", password: "testpass" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
