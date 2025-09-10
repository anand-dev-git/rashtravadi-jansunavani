import {
  sendWhatsAppMessage,
  sendRegistrationWhatsApp,
  testWhatsToolConnection,
  sendTestMessage,
} from "@/lib/whatstool";

// Mock fetch
global.fetch = jest.fn();

// Mock PDF upload function
const mockUploadPDFToCloud = jest.fn().mockResolvedValue({
  success: true,
  url: "https://example.com/test.pdf",
});

describe("WhatsTool Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 200,
          message: "Success",
          id: "test-message-id",
          data: {
            success: true,
            input_whatsapp: "919108455178",
            original_whatsapp: "919108455178",
            wamid: "test-message-id",
          },
        }),
    });
  });

  describe("sendWhatsAppMessage", () => {
    it("sends text message successfully", async () => {
      const result = await sendWhatsAppMessage({
        to: "919108455178",
        message: "Test message",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("test-message-id");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.whatstool.business/developers/v2/messages/917888566904",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-api-key": expect.any(String),
          },
          body: expect.stringContaining("Test message"),
        })
      );
    });

    it("sends document message with media URL", async () => {
      const result = await sendWhatsAppMessage({
        to: "919108455178",
        message: "Test message",
        mediaUrl: "https://example.com/test.pdf",
      });

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"type":"document"'),
        })
      );
    });

    it("handles API errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            message: "API Error",
          }),
      });

      const result = await sendWhatsAppMessage({
        to: "919108455178",
        message: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("API Error");
    });

    it("validates phone number format", async () => {
      const result = await sendWhatsAppMessage({
        to: "123",
        message: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid phone number format");
    });

    it("formats phone number correctly", async () => {
      await sendWhatsAppMessage({
        to: "9108455178",
        message: "Test message",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"to":"9108455178"'),
        })
      );
    });
  });

  describe("sendRegistrationWhatsApp", () => {
    it("sends registration message with PDF", async () => {
      const result = await sendRegistrationWhatsApp(
        "919108455178",
        "JD000001AP",
        "base64-pdf-data"
      );

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe("testWhatsToolConnection", () => {
    it("tests API connection successfully", async () => {
      const result = await testWhatsToolConnection();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("handles connection test errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await testWhatsToolConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });
  });

  describe("sendTestMessage", () => {
    it("sends test message successfully", async () => {
      const result = await sendTestMessage("919108455178");

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
