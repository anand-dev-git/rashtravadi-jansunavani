import { NextRequest, NextResponse } from "next/server";
import {
  sendWhatsAppMessage,
  sendTestMessage,
  testWhatsToolConnection,
} from "@/lib/whatstool";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, message, testMode = false } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    let result;

    if (testMode) {
      // Test mode - send a test message
      result = await sendTestMessage(phoneNumber);
    } else {
      // Regular message sending
      result = await sendWhatsAppMessage({
        to: phoneNumber,
        message: message || "Test message from Rashtrawadi Jansunavani System",
      });
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("WhatsTool API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Test connection endpoint
export async function GET() {
  try {
    const result = await testWhatsToolConnection();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "WhatsTool API connection successful",
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("WhatsTool connection test error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Connection test failed",
      },
      { status: 500 }
    );
  }
}
