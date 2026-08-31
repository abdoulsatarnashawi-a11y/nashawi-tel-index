export type ImportSource = "mobile" | "facebook" | "nashawi" | "csv";

export interface ParsedContactInput {
  name: string;
  phone: string;
  phone2?: string;
  email?: string;
  address: string;
  city?: string;
  category: string;
  notes?: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  total: number;
}
