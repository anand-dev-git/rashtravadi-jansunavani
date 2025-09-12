import { POST, GET } from "@/app/api/upload-pdf/route";

// Mock S3 service
jest.mock("@/lib/s3", () => ({
  uploadPDFToS3: jest.fn(),
  testS3Connection: jest.fn(),
}));

// Mock PDF generator
jest.mock("@/lib/pdf-generator", () => ({
  generateTicketPDFBase64: jest.fn(),
}));

const { uploadPDFToS3, testS3Connection } = require("@/lib/s3");
const { generateTicketPDFBase64 } = require("@/lib/pdf-generator");

describe("/api/upload-pdf", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("successfully uploads PDF to S3", async () => {
      const mockTicketData = {
        ticketNumber: "JDW000001AP",
        name: "Test User",
        address: "Test Address",
      };
      const mockTicketNumber = "JDW000001AP";
      const mockPdfBase64 = "mock-pdf-base64";
      const mockS3Url =
        "https://s3.amazonaws.com/jd-complaint-tickets/CRM_Tickets/ticket_JDW000001AP_registration.pdf";

      // Mock PDF generation
      generateTicketPDFBase64.mockResolvedValue(mockPdfBase64);

      // Mock S3 connection test
      testS3Connection.mockResolvedValue(true);

      // Mock S3 upload
      uploadPDFToS3.mockResolvedValue({
        success: true,
        url: mockS3Url,
        key: "CRM_Tickets/ticket_JDW000001AP_registration.pdf",
      });

      const request = {
        json: () =>
          Promise.resolve({
            ticketData: mockTicketData,
            ticketNumber: mockTicketNumber,
          }),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.pdfUrl).toBe(mockS3Url);
      expect(data.s3Key).toBe(
        "CRM_Tickets/ticket_JDW000001AP_registration.pdf"
      );
      expect(generateTicketPDFBase64).toHaveBeenCalledWith(
        mockTicketData,
        false
      );
      expect(uploadPDFToS3).toHaveBeenCalledWith(
        expect.any(Buffer),
        mockTicketNumber
      );
    });

    it("returns error when ticketData is missing", async () => {
      const request = {
        json: () =>
          Promise.resolve({
            ticketNumber: "JDW000001AP",
          }),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("ticketData and ticketNumber are required");
    });

    it("returns error when S3 connection fails", async () => {
      const mockTicketData = {
        ticketNumber: "JDW000001AP",
        name: "Test User",
      };

      // Mock S3 connection test to fail
      testS3Connection.mockResolvedValue(false);

      const request = {
        json: () =>
          Promise.resolve({
            ticketData: mockTicketData,
            ticketNumber: "JDW000001AP",
          }),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(
        "S3 connection failed. Please check AWS credentials."
      );
    });

    it("returns error when S3 upload fails", async () => {
      const mockTicketData = {
        ticketNumber: "JDW000001AP",
        name: "Test User",
      };
      const mockPdfBase64 = "mock-pdf-base64";

      // Mock PDF generation
      generateTicketPDFBase64.mockResolvedValue(mockPdfBase64);

      // Mock S3 connection test
      testS3Connection.mockResolvedValue(true);

      // Mock S3 upload to fail
      uploadPDFToS3.mockResolvedValue({
        success: false,
        error: "S3 upload failed",
      });

      const request = {
        json: () =>
          Promise.resolve({
            ticketData: mockTicketData,
            ticketNumber: "JDW000001AP",
          }),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("PDF upload failed: S3 upload failed");
    });

    it("handles PDF generation errors", async () => {
      const mockTicketData = {
        ticketNumber: "JDW000001AP",
        name: "Test User",
      };

      // Mock PDF generation to fail
      generateTicketPDFBase64.mockRejectedValue(
        new Error("PDF generation failed")
      );

      const request = {
        json: () =>
          Promise.resolve({
            ticketData: mockTicketData,
            ticketNumber: "JDW000001AP",
          }),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("GET", () => {
    it("returns success when S3 connection is working", async () => {
      testS3Connection.mockResolvedValue(true);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("S3 connection successful");
      expect(data.bucket).toBe("jd-complaint-tickets");
      expect(data.folder).toBe("CRM_Tickets/");
    });

    it("returns error when S3 connection fails", async () => {
      testS3Connection.mockResolvedValue(false);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("S3 connection failed");
    });

    it("handles S3 connection test errors", async () => {
      testS3Connection.mockRejectedValue(new Error("Connection test failed"));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("S3 test failed");
    });
  });
});
