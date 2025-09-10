import { GET, POST } from "@/app/api/complaint-records/route";
import { NextRequest } from "next/server";

// Mock database
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
  ensureComplaintRecordsTable: jest.fn(),
}));

const { query, ensureComplaintRecordsTable } = require("@/lib/db");

describe("/api/complaint-records", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("returns all complaint records", async () => {
      const mockRecords = [
        {
          id: 1,
          ticketNumber: "JD000001AP",
          name: "Test User",
          status: "Under Review",
        },
        {
          id: 2,
          ticketNumber: "JD000002AP",
          name: "Another User",
          status: "Closed",
        },
      ];

      query.mockResolvedValue([mockRecords, {}]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockRecords);
    });

    it("handles database errors", async () => {
      query.mockRejectedValue(new Error("Database error"));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("POST", () => {
    it("creates a new complaint record", async () => {
      ensureComplaintRecordsTable.mockResolvedValue(undefined);
      query.mockResolvedValue([{ insertId: 1 }, {}]);

      const request = new NextRequest(
        "http://localhost:3000/api/complaint-records",
        {
          method: "POST",
          body: JSON.stringify({
            ticketNumber: "JD000001AP",
            name: "Test User",
            address: "Test Address",
            constituency: "hadapasar",
            language: "english",
            createdDate: "2024-01-01 10:00:00",
            age: "26-35",
            gender: "male",
            problem: "Water Supply",
            pdf_link: "",
            phoneNumber: "9108455178",
            status: null,
            remarks: null,
            memberName: null,
            memberPhone: null,
            complaintSource: "Web",
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.ok).toBe(true);
    });

    it("handles missing required fields", async () => {
      ensureComplaintRecordsTable.mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost:3000/api/complaint-records",
        {
          method: "POST",
          body: JSON.stringify({
            ticketNumber: "JD000001AP",
            // Missing other required fields
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.ok).toBe(false);
    });

    it("handles database errors", async () => {
      ensureComplaintRecordsTable.mockResolvedValue(undefined);
      query.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/complaint-records",
        {
          method: "POST",
          body: JSON.stringify({
            ticketNumber: "JD000001AP",
            name: "Test User",
            address: "Test Address",
            constituency: "hadapasar",
            language: "english",
            createdDate: "2024-01-01 10:00:00",
            age: "26-35",
            gender: "male",
            problem: "Water Supply",
            pdf_link: "",
            phoneNumber: "9108455178",
            status: null,
            remarks: null,
            memberName: null,
            memberPhone: null,
            complaintSource: "Web",
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toBe("Database error");
    });
  });
});
