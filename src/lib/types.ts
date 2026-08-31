export interface Contact {
  id: string;
  name: string;
  phone: string;
  phone2?: string;
  email?: string;
  address: string;
  city?: string;
  category: string;
  notes?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminConfig {
  passwordHash: string;
  recoveryKeyHash: string;
  updatedAt: string;
}

export interface ContactsData {
  contacts: Contact[];
}

export const CATEGORIES = [
  "عائلة",
  "أقارب",
  "أصدقاء",
  "عمل",
  "خدمات",
  "طوارئ",
  "أخرى",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type BackupAction = "backup" | "restore";

export interface BackupLogEntry {
  id: string;
  action: BackupAction;
  createdAt: string;
  contactCount: number;
  imageCount: number;
  status: "success" | "failed";
  message?: string;
}

export interface BackupFile {
  version: 1;
  app: "nashawi-tel";
  createdAt: string;
  contacts: Contact[];
  admin: AdminConfig | null;
  images: Record<string, { mime: string; data: string }>;
}
