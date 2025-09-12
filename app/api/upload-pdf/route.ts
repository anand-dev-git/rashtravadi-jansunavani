import { NextResponse } from "next/server";
import { uploadPDFToS3, testS3Connection } from "@/lib/s3";
import { generateTicketPDFBase64 } from "@/lib/pdf-generator";

export async function POST(request: Request) {
  try {
    const { ticketData, ticketNumber } = await request.json();

    // Validate required fields
    if (!ticketData || !ticketNumber) {
      return NextResponse.json(
        { error: "ticketData and ticketNumber are required" },
        { status: 400 }
      );
    }

    // Test S3 connection first
    const isConnected = await testS3Connection();
    if (!isConnected) {
      return NextResponse.json(
        { error: "S3 connection failed. Please check AWS credentials." },
        { status: 500 }
      );
    }

    // Generate PDF as base64
    const pdfBase64 = await generateTicketPDFBase64(ticketData, false);

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    // Upload to S3
    const uploadResult = await uploadPDFToS3(pdfBuffer, ticketNumber);

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: `PDF upload failed: ${uploadResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pdfUrl: uploadResult.url,
      s3Key: uploadResult.key,
      message: "PDF uploaded successfully to S3",
    });
  } catch (error) {
    console.error("PDF upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Test endpoint to check S3 connection
export async function GET() {
  try {
    const isConnected = await testS3Connection();

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: "S3 connection successful",
        bucket: "jd-complaint-tickets",
        folder: "CRM_Tickets/",
      });
    } else {
      return NextResponse.json(
        { error: "S3 connection failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("S3 test error:", error);
    return NextResponse.json({ error: "S3 test failed" }, { status: 500 });
  }
}
