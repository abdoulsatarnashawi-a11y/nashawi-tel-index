import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createBackup, logBackupFailure } from "@/lib/backup";

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { backup, filename } = await createBackup();
    const body = JSON.stringify(backup, null, 2);

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "فشل إنشاء النسخة الاحتياطية";
    await logBackupFailure("backup", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
