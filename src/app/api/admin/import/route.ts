import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "@/lib/auth";
import { fetchNashawiMembers } from "@/lib/import/nashawi";
import {
  parseCsv,
  parseFacebookCsv,
  parseNashawiJson,
  parseVCard,
} from "@/lib/import/parsers";
import type { ImportSource, ParsedContactInput } from "@/lib/import/types";
import { addContactsBulk } from "@/lib/storage";
import type { Contact } from "@/lib/types";

function toContact(input: ParsedContactInput): Contact {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: input.name,
    phone: input.phone,
    phone2: input.phone2,
    email: input.email,
    address: input.address || "—",
    city: input.city,
    category: input.category || "أخرى",
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
}

export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  try {
    let source: ImportSource = "csv";
    let parsed: ParsedContactInput[] = [];
    let meta: Record<string, string> = {};

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      source = (form.get("source") as ImportSource) || "csv";
      const file = form.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 });
      }

      const text = await file.text();

      switch (source) {
        case "mobile":
          parsed = parseVCard(text);
          break;
        case "facebook":
          parsed = parseFacebookCsv(text);
          break;
        case "csv":
          parsed = parseCsv(text);
          break;
        case "nashawi":
          parsed = parseNashawiJson(JSON.parse(text));
          break;
        default:
          return NextResponse.json({ error: "مصدر غير مدعوم" }, { status: 400 });
      }

      meta = { filename: file.name };
    } else {
      const body = await request.json();
      source = body.source as ImportSource;

      if (source === "nashawi" && body.fetch === true) {
        const result = await fetchNashawiMembers(body.url);
        parsed = result.contacts;
        meta = { url: result.source };
      } else if (body.content) {
        switch (source) {
          case "mobile":
            parsed = parseVCard(body.content);
            break;
          case "facebook":
            parsed = parseFacebookCsv(body.content);
            break;
          case "csv":
            parsed = parseCsv(body.content);
            break;
          case "nashawi":
            parsed = parseNashawiJson(JSON.parse(body.content));
            break;
        }
      } else {
        return NextResponse.json({ error: "بيانات غير كافية" }, { status: 400 });
      }
    }

    if (parsed.length === 0) {
      return NextResponse.json(
        {
          error:
            "لم يُعثر على جهات اتصال صالحة. تأكد من صيغة الملف (اسم + هاتف على الأقل).",
        },
        { status: 400 }
      );
    }

    const contacts = parsed.map(toContact);
    const { imported, skipped } = await addContactsBulk(contacts);

    return NextResponse.json({
      imported: imported.length,
      skipped,
      total: parsed.length,
      errors: [],
      meta,
      message: `تم استيراد ${imported.length} جهة، وتخطي ${skipped} مكررة.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "فشل الاستيراد" },
      { status: 500 }
    );
  }
}
