import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Get all tickets that match the JD format and find the highest number
    const [result] = await query<{ ticketNumber: string }>(
      `SELECT ticketNumber 
       FROM complaint_records 
       WHERE ticketNumber LIKE 'JD%' 
       AND LENGTH(ticketNumber) = 10
       ORDER BY ticketNumber DESC 
       LIMIT 10`
    );

    let nextNumber = 1;

    // Look through the results to find the highest valid JD000001AP format ticket
    for (const row of result) {
      const ticket = row.ticketNumber;
      const match = ticket.match(/^JD(\d{6})AP$/);
      if (match) {
        const ticketNumber = parseInt(match[1], 10);
        // Only consider reasonable numbers (less than 1000 to avoid garbage data)
        if (ticketNumber > 0 && ticketNumber < 1000) {
          nextNumber = ticketNumber + 1;
          break; // Found the highest valid ticket, use it
        }
      }
    }

    // Format the number with leading zeros (6 digits)
    const formattedNumber = nextNumber.toString().padStart(6, "0");
    const ticketNumber = `JD${formattedNumber}AP`;

    return NextResponse.json({ ticketNumber });
  } catch (error) {
    console.error("Error generating ticket number:", error);
    return NextResponse.json(
      { error: "Failed to generate ticket number" },
      { status: 500 }
    );
  }
}
