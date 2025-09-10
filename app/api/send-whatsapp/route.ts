import { NextRequest, NextResponse } from "next/server";
import { sendRegistrationWhatsApp } from "@/lib/whatstool";
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

    // Check if WhatsTool is configured (API key is hardcoded in the service)
    // No need to check environment variable as it's handled in the service

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
