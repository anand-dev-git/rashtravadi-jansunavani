import { GET } from "@/app/api/ticket-number/route";
import { NextResponse } from "next/server";

// Mock database
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}));

const { query } = require("@/lib/db");

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    }),
  },
}));

describe("/api/ticket-number", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns first ticket number when no existing tickets", async () => {
    query.mockResolvedValue([[], {}]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JDW000001AP");
  });

  it("returns next ticket number when existing tickets exist", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JDW000003AP" },
        { ticketNumber: "JDW000002AP" },
        { ticketNumber: "JDW000001AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JDW000004AP");
  });

  it("handles tickets with gaps in numbering", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JDW000005AP" },
        { ticketNumber: "JDW000003AP" },
        { ticketNumber: "JDW000001AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JDW000006AP");
  });

  it("ignores invalid ticket formats", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JDW000002AP" },
        { ticketNumber: "INVALID123" },
        { ticketNumber: "JDW123456789AP" }, // Too long
        { ticketNumber: "JDW000AP" }, // Too short
        { ticketNumber: "JDW000001AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JDW000003AP");
  });

  it("ignores tickets with numbers >= 100000", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JDW100001AP" }, // Should be ignored
        { ticketNumber: "JDW100000AP" }, // Should be ignored
        { ticketNumber: "JDW000999AP" },
        { ticketNumber: "JDW000001AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JDW001000AP");
  });

  it("handles database errors", async () => {
    query.mockRejectedValue(new Error("Database connection failed"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to generate ticket number");
  });

  it("handles empty result set", async () => {
    query.mockResolvedValue([[], {}]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JDW000001AP");
  });

  it("handles tickets with zero padding correctly", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JDW000100AP" },
        { ticketNumber: "JDW000010AP" },
        { ticketNumber: "JDW000001AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JDW000101AP");
  });

  it("handles mixed valid and invalid tickets", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JDW000003AP" },
        { ticketNumber: "INVALID" },
        { ticketNumber: "JDW000002AP" },
        { ticketNumber: "JDW123456789AP" }, // Too long
        { ticketNumber: "JDW000001AP" },
        { ticketNumber: "NOTJDW000001AP" }, // Wrong prefix
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JDW000004AP");
  });

  it("correctly finds highest ticket number when unordered", async () => {
    // Test the actual bug fix - when tickets are not in perfect order
    query.mockResolvedValue([
      [
        { ticketNumber: "JDW000002AP" },
        { ticketNumber: "JDW000005AP" },
        { ticketNumber: "JDW000001AP" },
        { ticketNumber: "JDW000003AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JDW000006AP");
  });

  it("handles single existing ticket correctly", async () => {
    query.mockResolvedValue([[{ ticketNumber: "JDW000001AP" }], {}]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JDW000002AP");
  });

  it("handles high ticket numbers correctly", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JDW001317AP" },
        { ticketNumber: "JDW001316AP" },
        { ticketNumber: "JDW001315AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JDW001318AP");
  });
});
