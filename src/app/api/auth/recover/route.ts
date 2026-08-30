import { NextResponse } from "next/server";
import {
  createSession,
  setSessionCookie,
  updateAdminCredentials,
  verifyRecoveryKey,
} from "@/lib/auth";
import { generatePassword, generateRecoveryKey } from "@/lib/password";
import { isAdminConfigured } from "@/lib/storage";

export async function POST(request: Request) {
  const configured = await isAdminConfigured();
  if (!configured) {
    return NextResponse.json(
      { error: "لم يتم إعداد النظام بعد" },
      { status: 400 }
    );
  }

  const { recoveryKey } = await request.json();
  if (!recoveryKey?.trim()) {
    return NextResponse.json(
      { error: "مفتاح الاسترداد مطلوب" },
      { status: 400 }
    );
  }

  const valid = await verifyRecoveryKey(recoveryKey.trim());
  if (!valid) {
    return NextResponse.json(
      { error: "مفتاح الاسترداد غير صحيح" },
      { status: 401 }
    );
  }

  const newPassword = generatePassword();
  const newRecoveryKey = generateRecoveryKey();
  await updateAdminCredentials(newPassword, newRecoveryKey);

  const token = await createSession();
  await setSessionCookie(token);

  return NextResponse.json({
    password: newPassword,
    recoveryKey: newRecoveryKey,
    message: "تم إنشاء كلمة مرور جديدة. احفظها ومفتاح الاسترداد في مكان آمن.",
  });
}
