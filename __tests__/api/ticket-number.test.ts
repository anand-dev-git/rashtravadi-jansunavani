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
    expect(data.ticketNumber).toBe("JD000001AP");
  });

  it("returns next ticket number when existing tickets exist", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JD000003AP" },
        { ticketNumber: "JD000002AP" },
        { ticketNumber: "JD000001AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JD000004AP");
  });

  it("handles tickets with gaps in numbering", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JD000005AP" },
        { ticketNumber: "JD000003AP" },
        { ticketNumber: "JD000001AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JD000006AP");
  });

  it("ignores invalid ticket formats", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JD000002AP" },
        { ticketNumber: "INVALID123" },
        { ticketNumber: "JD123456789AP" }, // Too long
        { ticketNumber: "JD000AP" }, // Too short
        { ticketNumber: "JD000001AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JD000003AP");
  });

  it("ignores tickets with numbers >= 100000", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JD100001AP" }, // Should be ignored
        { ticketNumber: "JD100000AP" }, // Should be ignored
        { ticketNumber: "JD000999AP" },
        { ticketNumber: "JD000001AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JD001000AP");
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
    expect(data.ticketNumber).toBe("JD000001AP");
  });

  it("handles tickets with zero padding correctly", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JD000100AP" },
        { ticketNumber: "JD000010AP" },
        { ticketNumber: "JD000001AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JD000101AP");
  });

  it("handles mixed valid and invalid tickets", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JD000003AP" },
        { ticketNumber: "INVALID" },
        { ticketNumber: "JD000002AP" },
        { ticketNumber: "JD123456789AP" }, // Too long
        { ticketNumber: "JD000001AP" },
        { ticketNumber: "NOTJD000001AP" }, // Wrong prefix
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JD000004AP");
  });

  it("correctly finds highest ticket number when unordered", async () => {
    // Test the actual bug fix - when tickets are not in perfect order
    query.mockResolvedValue([
      [
        { ticketNumber: "JD000002AP" },
        { ticketNumber: "JD000005AP" },
        { ticketNumber: "JD000001AP" },
        { ticketNumber: "JD000003AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JD000006AP");
  });

  it("handles single existing ticket correctly", async () => {
    query.mockResolvedValue([[{ ticketNumber: "JD000001AP" }], {}]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JD000002AP");
  });

  it("handles high ticket numbers correctly", async () => {
    query.mockResolvedValue([
      [
        { ticketNumber: "JD001317AP" },
        { ticketNumber: "JD001316AP" },
        { ticketNumber: "JD001315AP" },
      ],
      {},
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticketNumber).toBe("JD001318AP");
  });
});
