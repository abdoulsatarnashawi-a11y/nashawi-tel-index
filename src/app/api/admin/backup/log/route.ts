import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getBackupLog } from "@/lib/backup";

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const entries = await getBackupLog();
  return NextResponse.json({ entries });
}
