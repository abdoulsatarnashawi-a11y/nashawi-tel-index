import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type {
  AdminConfig,
  BackupFile,
  BackupLogEntry,
  Contact,
} from "./types";
import { getContacts, getAdminConfig, saveAdminConfig, saveContacts } from "./storage";
import {
  UPLOADS_DIR,
  deleteContactImageFiles,
  ensureUploadsDir,
  saveContactImage,
} from "./uploads";

const DATA_DIR =
  process.env.DATA_DIR ?? path.join(process.cwd(), "data");

const BACKUP_LOG_FILE = path.join(DATA_DIR, "backup-log.json");
const MAX_LOG_ENTRIES = 100;

async function readLog(): Promise<BackupLogEntry[]> {
  try {
    const raw = await fs.readFile(BACKUP_LOG_FILE, "utf-8");
    const data = JSON.parse(raw) as { entries: BackupLogEntry[] };
    return data.entries ?? [];
  } catch {
    return [];
  }
}

async function writeLog(entries: BackupLogEntry[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    BACKUP_LOG_FILE,
    JSON.stringify({ entries: entries.slice(0, MAX_LOG_ENTRIES) }, null, 2),
    "utf-8"
  );
}

export async function getBackupLog(): Promise<BackupLogEntry[]> {
  return readLog();
}

async function addLogEntry(
  entry: Omit<BackupLogEntry, "id" | "createdAt">
): Promise<BackupLogEntry> {
  const full: BackupLogEntry = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  const entries = await readLog();
  entries.unshift(full);
  await writeLog(entries);
  return full;
}

async function collectImages(): Promise<BackupFile["images"]> {
  const images: BackupFile["images"] = {};

  try {
    const files = await fs.readdir(UPLOADS_DIR);
    for (const file of files) {
      const match = file.match(/^([a-zA-Z0-9-]+)\.(jpg|jpeg|png|webp|gif)$/i);
      if (!match) continue;

      const contactId = match[1];
      const buffer = await fs.readFile(path.join(UPLOADS_DIR, file));
      const ext = path.extname(file).toLowerCase();
      const mime =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
              ? "image/gif"
              : "image/jpeg";

      images[contactId] = {
        mime,
        data: buffer.toString("base64"),
      };
    }
  } catch {
    // no uploads yet
  }

  return images;
}

export async function createBackup(): Promise<{
  backup: BackupFile;
  filename: string;
}> {
  const contacts = await getContacts();
  const admin = await getAdminConfig();
  const images = await collectImages();

  const backup: BackupFile = {
    version: 1,
    app: "nashawi-tel",
    createdAt: new Date().toISOString(),
    contacts,
    admin,
    images,
  };

  const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const filename = `nashawi-tel-backup-${date}.json`;

  await addLogEntry({
    action: "backup",
    contactCount: contacts.length,
    imageCount: Object.keys(images).length,
    status: "success",
    message: filename,
  });

  return { backup, filename };
}

function isValidBackup(data: unknown): data is BackupFile {
  if (!data || typeof data !== "object") return false;
  const b = data as BackupFile;
  return (
    b.version === 1 &&
    b.app === "nashawi-tel" &&
    Array.isArray(b.contacts) &&
    typeof b.createdAt === "string"
  );
}

async function clearAllUploads(): Promise<void> {
  try {
    await ensureUploadsDir();
    const files = await fs.readdir(UPLOADS_DIR);
    await Promise.all(
      files.map((file) => fs.unlink(path.join(UPLOADS_DIR, file)))
    );
  } catch {
    // ignore
  }
}

export async function restoreBackup(raw: string): Promise<{
  contactCount: number;
  imageCount: number;
}> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("ملف النسخة الاحتياطية غير صالح (JSON)");
  }

  if (!isValidBackup(parsed)) {
    throw new Error("صيغة النسخة الاحتياطية غير مدعومة");
  }

  const backup = parsed;
  const contacts: Contact[] = backup.contacts.map((c) => ({
    ...c,
    name: String(c.name ?? "").trim(),
    phone: String(c.phone ?? "").trim(),
    address: String(c.address ?? "").trim(),
  }));

  if (contacts.some((c) => !c.name || !c.phone || !c.address)) {
    throw new Error("بعض السجلات في النسخة ناقصة (الاسم/الهاتف/العنوان)");
  }

  await saveContacts(contacts);

  if (backup.admin?.passwordHash && backup.admin?.recoveryKeyHash) {
    await saveAdminConfig(backup.admin as AdminConfig);
  }

  await clearAllUploads();

  let imageCount = 0;
  for (const [contactId, image] of Object.entries(backup.images ?? {})) {
    if (!image?.data || !image?.mime) continue;
    try {
      const buffer = Buffer.from(image.data, "base64");
      const imagePath = await saveContactImage(contactId, buffer, image.mime);

      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        contact.image = imagePath;
      }
      imageCount++;
    } catch {
      await deleteContactImageFiles(contactId);
    }
  }

  if (imageCount > 0) {
    await saveContacts(contacts);
  }

  await addLogEntry({
    action: "restore",
    contactCount: contacts.length,
    imageCount,
    status: "success",
    message: `من نسخة ${backup.createdAt}`,
  });

  return { contactCount: contacts.length, imageCount };
}

export async function logBackupFailure(
  action: BackupLogEntry["action"],
  message: string
): Promise<void> {
  await addLogEntry({
    action,
    contactCount: 0,
    imageCount: 0,
    status: "failed",
    message,
  });
}
