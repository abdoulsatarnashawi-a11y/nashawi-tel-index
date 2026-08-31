import { parseNashawiJson } from "./parsers";
import type { ParsedContactInput } from "./types";

const DEFAULT_URLS = [
  process.env.NASHAWI_MEMBERS_JSON_URL,
  "https://nashawi.xyz/data/members.json",
  "https://nashawi.xyz/api/members.json",
  "https://nashawi.xyz/api/public/members",
].filter(Boolean) as string[];

export async function fetchNashawiMembers(
  customUrl?: string
): Promise<{ contacts: ParsedContactInput[]; source: string }> {
  const urls = customUrl ? [customUrl] : DEFAULT_URLS;
  const errors: string[] = [];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        errors.push(`${url}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const contacts = parseNashawiJson(data);

      if (contacts.length > 0) {
        return { contacts, source: url };
      }

      errors.push(`${url}: لا توجد جهات بيانات صالحة`);
    } catch (err) {
      errors.push(
        `${url}: ${err instanceof Error ? err.message : "خطأ في الاتصال"}`
      );
    }
  }

  throw new Error(
    errors.length > 0
      ? `تعذّر جلب البيانات من nashawi.xyz. ${errors.join(" | ")}`
      : "تعذّر جلب البيانات من nashawi.xyz"
  );
}
