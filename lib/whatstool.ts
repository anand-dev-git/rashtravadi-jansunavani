import { uploadPDFToCloud } from "./pdf-upload";

// WhatsTool Business API configuration
const WHATSTOOL_API_URL =
  process.env.WHATSTOOL_API_URL ||
  "https://api.whatstool.business/developers/v2/messages/917888566904";
const WHATSTOOL_API_KEY =
  process.env.WHATSTOOL_API_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJidXNpbmVzc0lkIjoiNjhiOTkyZmQ4ZTM3MTIwNDRjZGY5YzhkIiwia2V5VmVyc2lvbiI6Ind0Yl9kY2E2NjdiNmY0NDgiLCJkb21haW4iOiJhcHAud2hhdHN0b29sLmJ1c2luZXNzIiwiZW1haWwiOiJzdWplZXQud2hhdHN0b29sK2Rlc2lnbmJveGVkQGdtYWlsLmNvbSIsIndoYXRzYXBwIjoiOTE5MTk5ODgxMTUzMTciLCJvd25lcm5hbWUiOiJTdWplZXQgV1QgREIiLCJvd25lcklkIjoiNjhiOTkyZmRjMDkxNjk3MDk5ZTllNmEyIiwiZXh0Q2hhbm5lbElkIjoiOTE3ODg4NTY2OTA0IiwiYml6bmFtZSI6IiIsInYiOiIyIiwiaWF0IjoxNzU3MzgxMjUwfQ.I_3ct0wQYVUHqVFm75aTrMHuxibDAkUxGkEf7KKm5aE";

export interface WhatsAppMessage {
  to: string;
  message: string;
  mediaUrl?: string;
  pdfBase64?: string;
  pdfFileName?: string;
}

export interface WhatsToolResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  data?: any;
}

export async function sendWhatsAppMessage({
  to,
  message,
  mediaUrl,
  pdfBase64,
  pdfFileName,
}: WhatsAppMessage): Promise<WhatsToolResponse> {
  try {
    // Validate phone number format
    const cleanNumber = to.replace(/\D/g, "");
    if (cleanNumber.length < 10) {
      throw new Error("Invalid phone number format");
    }

    // Format phone number for WhatsApp (ensure it starts with country code)
    const formattedNumber = cleanNumber.startsWith("91")
      ? `91${cleanNumber.substring(2)}`
      : `91${cleanNumber}`;

    // Prepare message payload for WhatsTool API
    const messagePayload: any = {
      to: formattedNumber,
      type: "text",
      text: {
        body: message,
      },
    };

    // Add media if provided
    if (mediaUrl) {
      messagePayload.type = "document";
      messagePayload.document = {
        link: mediaUrl,
        filename: pdfFileName || "document.pdf",
      };
    } else if (pdfBase64 && pdfFileName) {
      // Try to upload PDF to cloud storage first
      try {
        const uploadResult = await uploadPDFToCloud(pdfBase64, pdfFileName);
        if (uploadResult.success && uploadResult.url) {
          messagePayload.type = "document";
          messagePayload.document = {
            link: uploadResult.url,
            filename: pdfFileName,
          };
          console.log("PDF uploaded successfully:", uploadResult.url);
        } else {
          console.log(
            "PDF upload failed, sending text-only message:",
            uploadResult.error
          );
        }
      } catch (error) {
        console.log("PDF upload error, sending text-only message:", error);
      }
    }

    // Send the message via WhatsTool API
    const response = await fetch(WHATSTOOL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": WHATSTOOL_API_KEY,
      },
      body: JSON.stringify(messagePayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        `WhatsTool API error: ${response.status} - ${
          responseData.message || "Unknown error"
        }`
      );
    }

    return {
      success: true,
      messageId: responseData.id || responseData.messageId,
      data: responseData,
    };
  } catch (error) {
    console.error("WhatsTool WhatsApp error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function sendRegistrationWhatsApp(
  phoneNumber: string,
  ticketNumber: string,
  pdfBase64: string
): Promise<WhatsToolResponse> {
  const message = `🎉 *Registration Successful!*

Your complaint has been registered successfully.

📋 *Ticket Details:*
• Ticket Number: ${ticketNumber}
• Status: Under Review
• Registration Date: ${new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  })}

📄 *PDF Download:*
Your registration details have been automatically downloaded as a PDF. Please check your downloads folder.

💡 *Note:* The PDF may also be attached to this message if upload was successful.

Thank you for using Rashtrawadi Jansunavani System!`;

  return sendWhatsAppMessage({
    to: phoneNumber,
    message,
    pdfBase64,
    pdfFileName: `ticket_${ticketNumber}_registration.pdf`,
  });
}

// Test function to verify WhatsTool API connection
export async function testWhatsToolConnection(): Promise<WhatsToolResponse> {
  try {
    // Test by sending a simple message to verify the API works
    const testPayload = {
      to: "919108455178", // Test number
      type: "text",
      text: {
        body: "🧪 Connection test from Rashtrawadi Jansunavani System",
      },
    };

    const response = await fetch(WHATSTOOL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": WHATSTOOL_API_KEY,
      },
      body: JSON.stringify(testPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `API test failed: ${response.status} - ${
          data.message || "Unknown error"
        }`
      );
    }

    return {
      success: true,
      data: data,
      messageId: data.id || "test-connection",
    };
  } catch (error) {
    console.error("WhatsTool connection test error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection test failed",
    };
  }
}

// Send a simple text message for testing
export async function sendTestMessage(
  phoneNumber: string
): Promise<WhatsToolResponse> {
  const testMessage = `🧪 *WhatsTool API Test*

This is a test message from Rashtrawadi Jansunavani System.

✅ If you receive this message, the WhatsTool integration is working correctly!

Time: ${new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  })}`;

  return sendWhatsAppMessage({
    to: phoneNumber,
    message: testMessage,
  });
}
