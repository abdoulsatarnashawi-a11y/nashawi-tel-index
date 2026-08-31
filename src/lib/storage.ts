import { promises as fs } from "fs";
import path from "path";
import type { AdminConfig, Contact, ContactsData } from "./types";
import { deleteContactImageFiles } from "./uploads";

const DATA_DIR =
  process.env.DATA_DIR ?? path.join(process.cwd(), "data");

const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json");
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getContacts(): Promise<Contact[]> {
  const data = await readJson<ContactsData>(CONTACTS_FILE, { contacts: [] });
  return data.contacts.sort((a, b) => a.name.localeCompare(b.name, "ar"));
}

export async function saveContacts(contacts: Contact[]): Promise<void> {
  await writeJson<ContactsData>(CONTACTS_FILE, { contacts });
}

export async function getContactById(id: string): Promise<Contact | null> {
  const contacts = await getContacts();
  return contacts.find((c) => c.id === id) ?? null;
}

export async function addContact(contact: Contact): Promise<Contact> {
  const contacts = await getContacts();
  contacts.push(contact);
  await saveContacts(contacts);
  return contact;
}

export async function updateContact(contact: Contact): Promise<Contact> {
  const contacts = await getContacts();
  const index = contacts.findIndex((c) => c.id === contact.id);
  if (index === -1) throw new Error("Contact not found");
  contacts[index] = contact;
  await saveContacts(contacts);
  return contact;
}

export async function deleteContact(id: string): Promise<void> {
  const contacts = await getContacts();
  await saveContacts(contacts.filter((c) => c.id !== id));
  await deleteContactImageFiles(id);
}

export async function addContactsBulk(
  newContacts: Contact[]
): Promise<{ imported: Contact[]; skipped: number }> {
  const existing = await getContacts();
  const existingPhones = new Set(
    existing.map((c) => c.phone.replace(/\D/g, "").slice(-9))
  );

  const imported: Contact[] = [];
  let skipped = 0;

  for (const contact of newContacts) {
    const key = contact.phone.replace(/\D/g, "").slice(-9);
    if (existingPhones.has(key)) {
      skipped++;
      continue;
    }
    existingPhones.add(key);
    existing.push(contact);
    imported.push(contact);
  }

  await saveContacts(existing);
  return { imported, skipped };
}

export async function getAdminConfig(): Promise<AdminConfig | null> {
  return readJson<AdminConfig | null>(ADMIN_FILE, null);
}

export async function saveAdminConfig(config: AdminConfig): Promise<void> {
  await writeJson(ADMIN_FILE, config);
}

export async function isAdminConfigured(): Promise<boolean> {
  const config = await getAdminConfig();
  return config !== null && !!config.passwordHash;
}
