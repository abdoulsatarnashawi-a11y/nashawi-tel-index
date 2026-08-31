import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { logBackupFailure, restoreBackup } from "@/lib/backup";

export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("backup");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "لم يتم إرسال ملف النسخة الاحتياطية" },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "حجم الملف كبير جداً (الحد الأقصى 50MB)" },
        { status: 400 }
      );
    }

    const raw = await file.text();
    const result = await restoreBackup(raw);

    return NextResponse.json({
      success: true,
      message: `تم استرجاع ${result.contactCount} سجل و${result.imageCount} صورة`,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "فشل استرجاع النسخة الاحتياطية";
    await logBackupFailure("restore", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
