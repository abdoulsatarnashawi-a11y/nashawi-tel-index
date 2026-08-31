"use client";

import { useEffect, useState } from "react";
import type { Contact } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContactAvatar } from "@/components/contact-avatar";
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
import { ImagePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  onSave: (
    data: ContactFormData,
    options?: ContactFormSaveOptions
  ) => Promise<void>;
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

export interface ContactFormSaveOptions {
  imageFile?: File | null;
  removeImage?: boolean;
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

const fieldClass = "h-8 text-sm";
const labelClass = "text-xs text-muted-foreground";

export function ContactForm({
  open,
  onOpenChange,
  contact,
  onSave,
}: ContactFormProps) {
  const [form, setForm] = useState<ContactFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  function resetImageState(nextContact?: Contact | null) {
    setImageFile(null);
    setRemoveImage(false);
    setImagePreview(nextContact?.image ?? null);
  }

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
      resetImageState(contact);
    } else if (open && !contact) {
      setForm(emptyForm);
      resetImageState(null);
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
      resetImageState(contact);
    } else if (next) {
      setForm(emptyForm);
      resetImageState(null);
    }
    setError("");
    onOpenChange(next);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setRemoveImage(true);
    setImagePreview(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(form, { imageFile, removeImage });
      onOpenChange(false);
      setForm(emptyForm);
      resetImageState(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  }

  const previewContact = {
    name: form.name || "جهة اتصال",
    image: removeImage ? undefined : imagePreview ?? undefined,
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[min(100%-1rem,340px)] gap-2 p-3 max-h-[88vh] overflow-y-auto">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-sm">
            {contact ? "تعديل جهة اتصال" : "إضافة جهة اتصال"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-2">
            <ContactAvatar contact={previewContact} size="md" className="shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap gap-1">
                <Label
                  htmlFor="image"
                  className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border bg-background px-2 text-xs hover:bg-muted"
                >
                  <ImagePlus className="size-3" />
                  {imagePreview ? "تغيير" : "صورة"}
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {(imagePreview || contact?.image) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                JPG/PNG — حتى 2MB
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="name" className={labelClass}>
              الاسم *
            </Label>
            <Input
              id="name"
              className={fieldClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="phone" className={labelClass}>
                الهاتف *
              </Label>
              <Input
                id="phone"
                type="tel"
                dir="ltr"
                className={cn(fieldClass, "text-left")}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone2" className={labelClass}>
                هاتف 2
              </Label>
              <Input
                id="phone2"
                type="tel"
                dir="ltr"
                className={cn(fieldClass, "text-left")}
                value={form.phone2}
                onChange={(e) => setForm({ ...form, phone2: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className={labelClass}>
              البريد
            </Label>
            <Input
              id="email"
              type="email"
              dir="ltr"
              className={cn(fieldClass, "text-left")}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="address" className={labelClass}>
              العنوان *
            </Label>
            <Input
              id="address"
              className={fieldClass}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="city" className={labelClass}>
                المدينة
              </Label>
              <Input
                id="city"
                className={fieldClass}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className={labelClass}>التصنيف</Label>
              <Select
                value={form.category}
                onValueChange={(v) => v && setForm({ ...form, category: v })}
              >
                <SelectTrigger className={fieldClass}>
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

          <div className="space-y-1">
            <Label htmlFor="notes" className={labelClass}>
              ملاحظات
            </Label>
            <Textarea
              id="notes"
              rows={2}
              className="min-h-[52px] text-sm resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}

          <DialogFooter className="gap-2 pt-1 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "جاري الحفظ..." : contact ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
