import type { ParsedContactInput } from "./types";

function normalizePhone(value: string): string {
  return value.replace(/[^\d+]/g, "").trim();
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 6;
}

function pickField(
  row: Record<string, string>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const found = Object.entries(row).find(
      ([k]) => k.trim().toLowerCase() === key.toLowerCase()
    );
    if (found?.[1]?.trim()) return found[1].trim();
  }
  return undefined;
}

export function parseVCard(content: string): ParsedContactInput[] {
  const results: ParsedContactInput[] = [];
  const cards = content.split(/BEGIN:VCARD/i).slice(1);

  for (const card of cards) {
    const lines = card.split(/\r?\n/);
    let name = "";
    let phone = "";
    let phone2 = "";
    let email = "";
    let address = "";
    let city = "";
    let notes = "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line === "END:VCARD") continue;

      const [keyPart, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();
      const key = keyPart?.split(";")[0]?.toUpperCase() ?? "";

      if (key === "FN") name = value;
      if (key === "N" && !name) {
        const parts = value.split(";");
        name = [parts[1], parts[0]].filter(Boolean).join(" ").trim();
      }
      if (key === "TEL") {
        if (!phone) phone = value;
        else if (!phone2) phone2 = value;
      }
      if (key === "EMAIL") email = value;
      if (key === "ADR") {
        const parts = value.split(";");
        address = [parts[2], parts[3]].filter(Boolean).join("، ").trim();
        city = parts[3] || parts[4] || "";
      }
      if (key === "NOTE") notes = value;
    }

    if (name && isValidPhone(phone)) {
      results.push({
        name,
        phone: normalizePhone(phone),
        phone2: phone2 ? normalizePhone(phone2) : undefined,
        email: email || undefined,
        address: address || "—",
        city: city || undefined,
        category: "أخرى",
        notes: notes || undefined,
      });
    }
  }

  return results;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current.trim());
  return values;
}

export function parseCsv(content: string, defaultCategory = "أخرى"): ParsedContactInput[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]!).map((h) => h.toLowerCase());
  const rows: ParsedContactInput[] = [];

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? "";
    });

    const name =
      pickField(row, [
        "name",
        "full name",
        "fullname",
        "الاسم",
        "first name",
        "firstname",
        "contact name",
      ]) ??
      [row["first name"], row["last name"]].filter(Boolean).join(" ").trim();

    const phone =
      pickField(row, [
        "phone",
        "mobile",
        "tel",
        "telephone",
        "phone number",
        "الهاتف",
        "رقم الهاتف",
      ]) ?? "";

    if (!name || !isValidPhone(phone)) continue;

    rows.push({
      name,
      phone: normalizePhone(phone),
      phone2: pickField(row, ["phone 2", "phone2", "other phone", "هاتف 2"])
        ? normalizePhone(
            pickField(row, ["phone 2", "phone2", "other phone", "هاتف 2"])!
          )
        : undefined,
      email: pickField(row, ["email", "e-mail", "البريد", "البريد الإلكتروني"]),
      address:
        pickField(row, [
          "address",
          "street",
          "location",
          "العنوان",
          "عنوان",
        ]) || "—",
      city: pickField(row, ["city", "town", "المدينة", "مكان الولادة"]),
      category: pickField(row, ["category", "التصنيف"]) || defaultCategory,
      notes: pickField(row, ["notes", "note", "ملاحظات"]),
    });
  }

  return rows;
}

export function parseFacebookCsv(content: string): ParsedContactInput[] {
  return parseCsv(content, "أصدقاء");
}

interface NashawiMember {
  name?: string;
  full_name?: string;
  fullName?: string;
  phone?: string;
  mobile?: string;
  phone_number?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  birth_place?: string;
  birthPlace?: string;
  location?: string;
  profession?: string;
  notes?: string;
}

export function parseNashawiJson(data: unknown): ParsedContactInput[] {
  const list = Array.isArray(data)
    ? data
    : typeof data === "object" &&
        data !== null &&
        Array.isArray((data as { members?: unknown }).members)
      ? (data as { members: NashawiMember[] }).members
      : typeof data === "object" &&
          data !== null &&
          Array.isArray((data as { contacts?: unknown }).contacts)
        ? (data as { contacts: NashawiMember[] }).contacts
        : [];

  const results: ParsedContactInput[] = [];

  for (const item of list as NashawiMember[]) {
    const name = item.full_name || item.fullName || item.name || "";
    const phone =
      item.phone || item.mobile || item.phone_number || item.phoneNumber || "";

    if (!name.trim() || !isValidPhone(phone)) continue;

    results.push({
      name: name.trim(),
      phone: normalizePhone(phone),
      email: item.email?.trim() || undefined,
      address: item.address?.trim() || item.location?.trim() || "—",
      city: item.city?.trim() || item.birth_place?.trim() || item.birthPlace?.trim(),
      category: "عائلة",
      notes: item.profession
        ? `المهنة: ${item.profession}${item.notes ? ` — ${item.notes}` : ""}`
        : item.notes?.trim(),
    });
  }

  return results;
}

export function normalizePhoneForCompare(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}
