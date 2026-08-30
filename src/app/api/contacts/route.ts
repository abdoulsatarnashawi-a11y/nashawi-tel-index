import { NextResponse } from "next/server";
import { getContacts } from "@/lib/storage";

export async function GET() {
  const contacts = await getContacts();
  return NextResponse.json({ contacts });
}
