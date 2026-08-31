import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getContactById, updateContact } from "@/lib/storage";
import {
  MAX_IMAGE_BYTES,
  deleteContactImageFiles,
  isAllowedImageType,
  saveContactImage,
} from "@/lib/uploads";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
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

  const formData = await request.formData();
  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "لم يتم إرسال صورة" }, { status: 400 });
  }

  if (!isAllowedImageType(file.type)) {
    return NextResponse.json(
      { error: "نوع الصورة غير مدعوم (JPG, PNG, WEBP, GIF)" },
      { status: 400 }
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "حجم الصورة يجب أن يكون أقل من 2 ميجابايت" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const imagePath = await saveContactImage(id, buffer, file.type);

  const contact = await updateContact({
    ...existing,
    image: imagePath,
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

  await deleteContactImageFiles(id);

  const contact = await updateContact({
    ...existing,
    image: undefined,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ contact });
}
