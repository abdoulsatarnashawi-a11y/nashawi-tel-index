import { NextResponse } from "next/server";
import {
  createSession,
  requireAuth,
  setSessionCookie,
  updateAdminCredentials,
} from "@/lib/auth";
import { generatePassword, generateRecoveryKey } from "@/lib/password";
import { isAdminConfigured } from "@/lib/storage";

export async function GET() {
  const configured = await isAdminConfigured();
  return NextResponse.json({ configured });
}

export async function POST(request: Request) {
  const configured = await isAdminConfigured();

  if (configured) {
    try {
      await requireAuth();
    } catch {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
  }

  const body = await request.json();
  const regenerate = body.regenerate === true;

  if (configured && !regenerate) {
    return NextResponse.json(
      { error: "النظام مُعدّ مسبقاً. استخدم تجديد كلمة المرور." },
      { status: 400 }
    );
  }

  const password = generatePassword();
  const recoveryKey = generateRecoveryKey();
  await updateAdminCredentials(password, recoveryKey);

  const token = await createSession();
  await setSessionCookie(token);

  return NextResponse.json({
    password,
    recoveryKey,
    message: configured
      ? "تم تجديد كلمة المرور ومفتاح الاسترداد."
      : "تم إعداد النظام بنجاح. احفظ البيانات التالية.",
  });
}
