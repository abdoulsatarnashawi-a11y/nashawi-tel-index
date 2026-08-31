import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deleteContact, getContactById, updateContact } from "@/lib/storage";
import { CATEGORIES } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getContactById(id);
  if (!existing) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  const body = await request.json();
  const { name, phone, phone2, email, address, city, category, notes } = body;

  if (!name?.trim() || !phone?.trim() || !address?.trim()) {
    return NextResponse.json(
      { error: "الاسم والهاتف والعنوان مطلوبة" },
      { status: 400 }
    );
  }

  const contact = await updateContact({
    ...existing,
    name: name.trim(),
    phone: phone.trim(),
    phone2: phone2?.trim() || undefined,
    email: email?.trim() || undefined,
    address: address.trim(),
    city: city?.trim() || undefined,
    category: CATEGORIES.includes(category) ? category : "أخرى",
    notes: notes?.trim() || undefined,
    image: existing.image,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ contact });
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getContactById(id);
  if (!existing) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  await deleteContact(id);
  return NextResponse.json({ success: true });
}
