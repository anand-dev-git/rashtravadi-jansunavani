import { NextResponse } from "next/server";
import { ensureComplaintRecordsTable, query } from "@/lib/db";

type RouteContext = { params: Promise<{ ticketNumber: string }> };

// GET /api/complaint-records/:ticketNumber
export async function GET(_req: Request, ctx: RouteContext) {
  const { ticketNumber } = await ctx.params;
  await ensureComplaintRecordsTable();
  const [rows] = await query(
    "SELECT * FROM complaint_records WHERE ticketNumber = ? LIMIT 1",
    [ticketNumber]
  );
  if (!rows || (rows as any[]).length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json((rows as any[])[0]);
}

// PUT /api/complaint-records/:ticketNumber - update allowed fields only
export async function PUT(request: Request, ctx: RouteContext) {
  const { ticketNumber } = await ctx.params;
  await ensureComplaintRecordsTable();
  const body = await request.json();

  const allowed = ["status", "remarks", "dbEmp", "complaintSource"] as const;
  const updates = allowed
    .filter((k) => body[k] !== undefined)
    .map((k) => `${k} = ?`);
  const values = allowed
    .filter((k) => body[k] !== undefined)
    .map((k) => body[k]);

  if (updates.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No updatable fields provided" },
      { status: 400 }
    );
  }

  const sql = `UPDATE complaint_records SET ${updates.join(
    ", "
  )} WHERE ticketNumber = ?`;
  try {
    await query(sql, [...values, ticketNumber]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 400 }
    );
  }
}

// DELETE /api/complaint-records/:ticketNumber
export async function DELETE(_req: Request, ctx: RouteContext) {
  const { ticketNumber } = await ctx.params;
  await ensureComplaintRecordsTable();
  try {
    await query("DELETE FROM complaint_records WHERE ticketNumber = ?", [
      ticketNumber,
    ]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 400 }
    );
  }
}
