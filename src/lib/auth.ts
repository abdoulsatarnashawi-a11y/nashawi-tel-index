import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AdminConfig } from "./types";

const COOKIE_NAME = "nashawi_admin_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function hashSecret(value: string): Promise<string> {
  return bcrypt.hash(value, 12);
}

export async function verifySecret(
  value: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(value, hash);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const { getAdminConfig } = await import("./storage");
  const config = await getAdminConfig();
  if (!config) return false;
  return verifySecret(password, config.passwordHash);
}

export async function verifyRecoveryKey(key: string): Promise<boolean> {
  const { getAdminConfig } = await import("./storage");
  const config = await getAdminConfig();
  if (!config) return false;
  return verifySecret(key, config.recoveryKeyHash);
}

export async function updateAdminCredentials(
  password: string,
  recoveryKey: string
): Promise<AdminConfig> {
  const { saveAdminConfig } = await import("./storage");
  const config: AdminConfig = {
    passwordHash: await hashSecret(password),
    recoveryKeyHash: await hashSecret(recoveryKey),
    updatedAt: new Date().toISOString(),
  };
  await saveAdminConfig(config);
  return config;
}

export async function createSession(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getJwtSecret());
  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) {
    throw new Error("Unauthorized");
  }
}
