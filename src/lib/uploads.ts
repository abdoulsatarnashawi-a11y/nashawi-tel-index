import { promises as fs } from "fs";
import path from "path";

const DATA_DIR =
  process.env.DATA_DIR ?? path.join(process.cwd(), "data");

export const UPLOADS_DIR = path.join(DATA_DIR, "uploads", "contacts");

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export function isAllowedImageType(mime: string): boolean {
  return mime in MIME_TO_EXT;
}

export function getExtensionForMime(mime: string): string {
  return MIME_TO_EXT[mime] ?? ".jpg";
}

export async function ensureUploadsDir(): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export function contactImagePublicPath(
  contactId: string,
  ext: string
): string {
  return `/api/uploads/contacts/${contactId}${ext}`;
}

export async function saveContactImage(
  contactId: string,
  buffer: Buffer,
  mime: string
): Promise<string> {
  await ensureUploadsDir();
  await deleteContactImageFiles(contactId);

  const ext = getExtensionForMime(mime);
  const filename = `${contactId}${ext}`;
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);

  return contactImagePublicPath(contactId, ext);
}

export async function deleteContactImageFiles(
  contactId: string
): Promise<void> {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    await Promise.all(
      files
        .filter((file) => file.startsWith(`${contactId}.`))
        .map((file) => fs.unlink(path.join(UPLOADS_DIR, file)))
    );
  } catch {
    // uploads directory may not exist yet
  }
}

export async function readContactImage(
  filename: string
): Promise<{ buffer: Buffer; mime: string } | null> {
  const safeName = path.basename(filename);
  if (!/^[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(safeName)) {
    return null;
  }

  const filePath = path.join(UPLOADS_DIR, safeName);
  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    const mime =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".gif"
            ? "image/gif"
            : "image/jpeg";
    return { buffer, mime };
  } catch {
    return null;
  }
}
