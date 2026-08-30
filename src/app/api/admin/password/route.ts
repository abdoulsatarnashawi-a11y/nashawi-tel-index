import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generatePassword, generateRecoveryKey } from "@/lib/password";
import { updateAdminCredentials } from "@/lib/auth";

export async function POST() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const password = generatePassword();
  const recoveryKey = generateRecoveryKey();
  await updateAdminCredentials(password, recoveryKey);

  return NextResponse.json({
    password,
    recoveryKey,
    message: "تم تجديد كلمة المرور ومفتاح الاسترداد.",
  });
}
