"use client";

import { useEffect, useState } from "react";
import type { Contact } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  onSave: (data: ContactFormData) => Promise<void>;
}

export interface ContactFormData {
  name: string;
  phone: string;
  phone2: string;
  email: string;
  address: string;
  city: string;
  category: string;
  notes: string;
}

const emptyForm: ContactFormData = {
  name: "",
  phone: "",
  phone2: "",
  email: "",
  address: "",
  city: "",
  category: "عائلة",
  notes: "",
};

export function ContactForm({
  open,
  onOpenChange,
  contact,
  onSave,
}: ContactFormProps) {
  const [form, setForm] = useState<ContactFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && contact) {
      setForm({
        name: contact.name,
        phone: contact.phone,
        phone2: contact.phone2 ?? "",
        email: contact.email ?? "",
        address: contact.address,
        city: contact.city ?? "",
        category: contact.category,
        notes: contact.notes ?? "",
      });
    } else if (open && !contact) {
      setForm(emptyForm);
    }
  }, [open, contact]);

  function handleOpenChange(next: boolean) {
    if (next && contact) {
      setForm({
        name: contact.name,
        phone: contact.phone,
        phone2: contact.phone2 ?? "",
        email: contact.email ?? "",
        address: contact.address,
        city: contact.city ?? "",
        category: contact.category,
        notes: contact.notes ?? "",
      });
    } else if (next) {
      setForm(emptyForm);
    }
    setError("");
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onOpenChange(false);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contact ? "تعديل جهة اتصال" : "إضافة جهة اتصال"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">الهاتف *</Label>
              <Input
                id="phone"
                type="tel"
                dir="ltr"
                className="text-left"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone2">هاتف إضافي</Label>
              <Input
                id="phone2"
                type="tel"
                dir="ltr"
                className="text-left"
                value={form.phone2}
                onChange={(e) => setForm({ ...form, phone2: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              dir="ltr"
              className="text-left"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">العنوان *</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">المدينة</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Select
                value={form.category}
                onValueChange={(v) => v && setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "جاري الحفظ..." : contact ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
