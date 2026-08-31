"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/components/link-button";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { ContactCard, CONTACT_GRID_CLASS } from "@/components/contact-card";
import { cn } from "@/lib/utils";
import {
  ContactForm,
  type ContactFormData,
  type ContactFormSaveOptions,
} from "@/components/contact-form";
import { CredentialDisplay } from "@/components/credential-display";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  LogOut,
  KeyRound,
  Home,
  Search,
  RefreshCw,
  Upload,
} from "lucide-react";
import { ImportDialog } from "@/components/import-dialog";
import { ImportBanner } from "@/components/import-banner";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteQrCode } from "@/components/site-qr-code";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [credentials, setCredentials] = useState<{
    password: string;
    recoveryKey: string;
    message: string;
  } | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const loadContacts = useCallback(async () => {
    const res = await fetch("/api/contacts");
    if (res.ok) {
      const data = await res.json();
      setContacts(data.contacts);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const authRes = await fetch("/api/auth/login");
      const auth = await authRes.json();
      if (!auth.authenticated) {
        router.replace("/admin/login");
        return;
      }
      await loadContacts();
      setLoading(false);
    }
    init();
  }, [router, loadContacts]);

  const filtered = contacts.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [c.name, c.phone, c.address, c.city, c.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  async function handleSave(
    data: ContactFormData,
    options?: ContactFormSaveOptions
  ) {
    const url = editing
      ? `/api/admin/contacts/${editing.id}`
      : "/api/admin/contacts";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error ?? "فشل الحفظ");

    const contactId = editing?.id ?? result.contact.id;

    if (options?.removeImage) {
      const deleteRes = await fetch(`/api/admin/contacts/${contactId}/image`, {
        method: "DELETE",
      });
      if (!deleteRes.ok) {
        const deleteResult = await deleteRes.json();
        throw new Error(deleteResult.error ?? "فشل حذف الصورة");
      }
    } else if (options?.imageFile) {
      const formData = new FormData();
      formData.append("image", options.imageFile);
      const uploadRes = await fetch(`/api/admin/contacts/${contactId}/image`, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        const uploadResult = await uploadRes.json();
        throw new Error(uploadResult.error ?? "فشل رفع الصورة");
      }
    }

    await loadContacts();
    setEditing(null);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    if (res.ok) await loadContacts();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function handleRegeneratePassword() {
    if (
      !confirm(
        "سيتم إنشاء كلمة مرور ومفتاح استرداد جديدين. هل أنت متأكد؟"
      )
    )
      return;

    setRegenerating(true);
    const res = await fetch("/api/admin/password", { method: "POST" });
    const data = await res.json();
    setRegenerating(false);

    if (res.ok) {
      setCredentials(data);
      setPasswordDialog(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">لوحة الإدارة</h1>
            <p className="text-sm text-muted-foreground">
              إدارة جهات الاتصال والعناوين
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ThemeToggle />
            <LinkButton href="/" variant="outline" size="sm">
              <Home className="size-4 ml-1" />
              الدليل
            </LinkButton>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegeneratePassword}
              disabled={regenerating}
            >
              <RefreshCw className="size-4 ml-1" />
              تجديد كلمة المرور
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-4 ml-1" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <ImportBanner onImport={() => setImportOpen(true)} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="size-4 ml-1" />
              استيراد
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4 ml-1" />
              إضافة جهة اتصال
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {filtered.length} من {contacts.length} سجل
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>لا توجد جهات اتصال. أضف أول سجل.</p>
          </div>
        ) : (
          <div className={cn(CONTACT_GRID_CLASS)}>
            {filtered.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                admin
                onEdit={(c) => {
                  setEditing(c);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <div className="rounded-lg border bg-card p-6">
          <SiteQrCode />
        </div>
      </main>

      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={loadContacts}
      />

      <ContactForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        contact={editing}
        onSave={handleSave}
      />

      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-5" />
              كلمة المرور الجديدة
            </DialogTitle>
            <DialogDescription>
              انسخ البيانات واحفظها قبل إغلاق هذه النافذة
            </DialogDescription>
          </DialogHeader>
          {credentials && (
            <CredentialDisplay
              password={credentials.password}
              recoveryKey={credentials.recoveryKey}
              message={credentials.message}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
