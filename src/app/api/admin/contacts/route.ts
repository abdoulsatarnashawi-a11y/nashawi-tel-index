import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "@/lib/auth";
import { addContact } from "@/lib/storage";
import { CATEGORIES } from "@/lib/types";

export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone, phone2, email, address, city, category, notes } = body;

  if (!name?.trim() || !phone?.trim() || !address?.trim()) {
    return NextResponse.json(
      { error: "الاسم والهاتف والعنوان مطلوبة" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const contact = await addContact({
    id: uuidv4(),
    name: name.trim(),
    phone: phone.trim(),
    phone2: phone2?.trim() || undefined,
    email: email?.trim() || undefined,
    address: address.trim(),
    city: city?.trim() || undefined,
    category: CATEGORIES.includes(category) ? category : "أخرى",
    notes: notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ contact }, { status: 201 });
}
