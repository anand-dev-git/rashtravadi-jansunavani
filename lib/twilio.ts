import twilio from "twilio";
import { uploadPDFToCloud } from "./pdf-upload";

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface WhatsAppMessage {
  to: string;
  message: string;
  mediaUrl?: string;
  pdfBase64?: string;
  pdfFileName?: string;
}

export async function sendWhatsAppMessage({
  to,
  message,
  mediaUrl,
  pdfBase64,
  pdfFileName,
}: WhatsAppMessage): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    // Validate phone number format
    const cleanNumber = to.replace(/\D/g, "");
    if (cleanNumber.length < 10) {
      throw new Error("Invalid phone number format");
    }

    // Format phone number for WhatsApp (add country code if not present)
    const formattedNumber = cleanNumber.startsWith("91")
      ? `whatsapp:+${cleanNumber}`
      : `whatsapp:+91${cleanNumber}`;

    // Prepare message payload
    const messagePayload: any = {
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: formattedNumber,
      body: message,
    };

    // Add media if provided
    if (mediaUrl) {
      messagePayload.mediaUrl = [mediaUrl];
    } else if (pdfBase64 && pdfFileName) {
      // Try to upload PDF to cloud storage first
      try {
        const uploadResult = await uploadPDFToCloud(pdfBase64, pdfFileName);
        if (uploadResult.success && uploadResult.url) {
          messagePayload.mediaUrl = [uploadResult.url];
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

    // Send the message
    const result = await client.messages.create(messagePayload);

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error) {
    console.error("Twilio WhatsApp error:", error);
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
): Promise<{ success: boolean; messageId?: string; error?: string }> {
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
