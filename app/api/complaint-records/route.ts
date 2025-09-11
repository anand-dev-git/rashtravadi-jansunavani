import { NextResponse } from "next/server";
import { ensureComplaintRecordsTable, query } from "@/lib/db";

// GET /api/complaint-records - list all
export async function GET() {
  await ensureComplaintRecordsTable();
  const [rows] = await query(
    "SELECT * FROM complaint_records ORDER BY createdDate DESC"
  );
  return NextResponse.json(rows);
}

// POST /api/complaint-records - create
export async function POST(request: Request) {
  await ensureComplaintRecordsTable();
  const body = await request.json();

  const fields = [
    "ticketNumber",
    "address",
    "constituency",
    "language",
    "createdDate",
    "age",
    "gender",
    "problem",
    "pdf_link",
    "name",
    "memberName",
    "phoneNumber",
    "status",
    "remarks",
    "memberPhone",
    "complaintSource",
    "problem_des",
  ] as const;

  const values = fields.map((f) => body[f as (typeof fields)[number]] ?? null);

  const placeholders = fields.map(() => "?").join(",");
  const sql = `INSERT INTO complaint_records (${fields.join(
    ","
  )}) VALUES (${placeholders})`;

  try {
    await query(sql, values);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 400 }
    );
  }
}
