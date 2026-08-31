import { NextResponse } from "next/server";
import { readContactImage } from "@/lib/uploads";

type RouteContext = { params: Promise<{ filename: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;
  const file = await readContactImage(filename);

  if (!file) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.mime,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
