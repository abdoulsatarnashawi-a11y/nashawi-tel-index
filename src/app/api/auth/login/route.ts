import { NextResponse } from "next/server";
import {
  createSession,
  isAuthenticated,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { isAdminConfigured } from "@/lib/storage";

export async function POST(request: Request) {
  const configured = await isAdminConfigured();
  if (!configured) {
    return NextResponse.json(
      { error: "لم يتم إعداد النظام بعد" },
      { status: 400 }
    );
  }

  const { password } = await request.json();
  if (!password) {
    return NextResponse.json(
      { error: "كلمة المرور مطلوبة" },
      { status: 400 }
    );
  }

  const valid = await verifyPassword(password);
  if (!valid) {
    return NextResponse.json(
      { error: "كلمة المرور غير صحيحة" },
      { status: 401 }
    );
  }

  const token = await createSession();
  await setSessionCookie(token);

  return NextResponse.json({ success: true });
}

export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({ authenticated: authed });
}
