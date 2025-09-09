import { NextRequest, NextResponse } from "next/server";
import { sendRegistrationWhatsApp } from "@/lib/twilio";
import { generateTicketPDFBase64 } from "@/lib/pdf-generator";

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, ticketNumber, ticketData } = await request.json();

    // Validate required fields
    if (!phoneNumber || !ticketNumber || !ticketData) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: phoneNumber, ticketNumber, ticketData",
        },
        { status: 400 }
      );
    }

    // Check if Twilio is configured
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_WHATSAPP_NUMBER
    ) {
      return NextResponse.json(
        {
          error:
            "Twilio not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER environment variables.",
        },
        { status: 500 }
      );
    }

    // Generate PDF as base64
    const pdfBase64 = await generateTicketPDFBase64(ticketData, false);

    // Send WhatsApp message with PDF
    const result = await sendRegistrationWhatsApp(
      phoneNumber,
      ticketNumber,
      pdfBase64
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: "WhatsApp message sent successfully",
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send WhatsApp message" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("WhatsApp API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
