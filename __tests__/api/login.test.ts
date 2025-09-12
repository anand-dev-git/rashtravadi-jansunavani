import { POST } from "@/app/api/login/route";
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
    const request = {
      json: () => Promise.resolve({ password: "testpass" }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Username and password are required");
  });

  it("returns 400 for missing password", async () => {
    const request = {
      json: () => Promise.resolve({ username: "testuser" }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Username and password are required");
  });

  it("returns 401 for invalid credentials", async () => {
    query.mockResolvedValue([[], {}]);

    const request = {
      json: () =>
        Promise.resolve({ username: "testuser", password: "wrongpass" }),
    } as any;

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

    const request = {
      json: () =>
        Promise.resolve({ username: "testuser", password: "wrongpass" }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid credentials");
  });

  it("returns 200 and token for valid credentials", async () => {
    const mockUser = {
      username: "testuser",
      password: "testpass", // API does simple string comparison, not bcrypt
    };

    query.mockResolvedValue([[mockUser], {}]);

    const request = {
      json: () =>
        Promise.resolve({ username: "testuser", password: "testpass" }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.user.username).toBe("testuser");
  });

  it("handles database errors", async () => {
    query.mockRejectedValue(new Error("Database error"));

    const request = {
      json: () =>
        Promise.resolve({ username: "testuser", password: "testpass" }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
