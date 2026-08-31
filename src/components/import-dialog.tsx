"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Smartphone,
  Share2,
  Globe,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

interface ImportResponse {
  imported: number;
  skipped: number;
  total: number;
  message: string;
  error?: string;
}

export function ImportDialog({
  open,
  onOpenChange,
  onImported,
}: ImportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState("");
  const [nashawiUrl, setNashawiUrl] = useState("");
  const [supportsPicker, setSupportsPicker] = useState(false);

  const mobileRef = useRef<HTMLInputElement>(null);
  const facebookRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);
  const nashawiFileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setResult(null);
    setError("");
  }

  useEffect(() => {
    setSupportsPicker(
      typeof navigator !== "undefined" &&
        "contacts" in navigator &&
        "ContactsManager" in window
    );
  }, []);

  async function pickMobileContacts() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const nav = navigator as Navigator & {
        contacts?: {
          select: (
            props: string[],
            opts?: { multiple?: boolean }
          ) => Promise<
            Array<{
              name?: string[];
              tel?: string[];
              email?: string[];
            }>
          >;
        };
      };

      if (!nav.contacts) {
        setError("المتصفح لا يدعم الاختيار المباشر — استخدم ملف vCard");
        setLoading(false);
        return;
      }

      const picked = await nav.contacts.select(["name", "tel", "email"], {
        multiple: true,
      });

      const contacts = picked
        .map((c) => ({
          name: c.name?.[0] ?? "",
          phone: c.tel?.[0] ?? "",
          email: c.email?.[0],
        }))
        .filter((c) => c.name && c.phone);

      if (contacts.length === 0) {
        setError("لم تُختر أي جهات اتصال");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "mobile", contacts }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? "فشل الاستيراد");
        return;
      }

      setResult(data);
      onImported();
    } catch {
      setLoading(false);
      setError("تم إلغاء الاختيار أو فشل الوصول لجهات الاتصال");
    }
  }

  async function uploadFile(source: string, file: File) {
    setLoading(true);
    setError("");
    setResult(null);

    const form = new FormData();
    form.append("source", source);
    form.append("file", file);

    const res = await fetch("/api/admin/import", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "فشل الاستيراد");
      return;
    }

    setResult(data);
    onImported();
  }

  async function fetchFromNashawi() {
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/admin/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "nashawi",
        fetch: true,
        url: nashawiUrl.trim() || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "فشل الجلب من nashawi.xyz");
      return;
    }

    setResult(data);
    onImported();
  }

  function handleFileChange(
    source: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (file) uploadFile(source, file);
    e.target.value = "";
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            استيراد جهات الاتصال
          </DialogTitle>
          <DialogDescription>
            استيراد الأسماء والأرقام من الموبايل، فيسبوك، أو موقع nashawi.xyz
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="mobile" onValueChange={() => reset()}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mobile" className="gap-1 text-xs sm:text-sm">
              <Smartphone className="size-3.5" />
              موبايل
            </TabsTrigger>
            <TabsTrigger value="facebook" className="gap-1 text-xs sm:text-sm">
              <Share2 className="size-3.5" />
              فيسبوك
            </TabsTrigger>
            <TabsTrigger value="nashawi" className="gap-1 text-xs sm:text-sm">
              <Globe className="size-3.5" />
              nashawi.xyz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mobile" className="space-y-4 mt-4">
            <Alert>
              <AlertDescription className="text-sm space-y-2">
                <p className="font-medium">كيفية التصدير من الموبايل:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>
                    <strong>أندرويد:</strong> جهات الاتصال → الإعدادات →
                    استيراد/تصدير → تصدير إلى ملف .vcf
                  </li>
                  <li>
                    <strong>آيفون:</strong> iCloud.com → جهات الاتصال →
                    تصدير vCard
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
            <input
              ref={mobileRef}
              type="file"
              accept=".vcf,.vcard,text/vcard"
              className="hidden"
              onChange={(e) => handleFileChange("mobile", e)}
            />
            {supportsPicker && (
              <Button
                className="w-full"
                onClick={pickMobileContacts}
                disabled={loading}
              >
                <Smartphone className="size-4 ml-2" />
                اختيار من جهات اتصال الموبايل
              </Button>
            )}
            <Button
              className="w-full"
              variant={supportsPicker ? "outline" : "default"}
              onClick={() => mobileRef.current?.click()}
              disabled={loading}
            >
              <Upload className="size-4 ml-2" />
              رفع ملف vCard (.vcf)
            </Button>
          </TabsContent>

          <TabsContent value="facebook" className="space-y-4 mt-4">
            <Alert>
              <AlertDescription className="text-sm space-y-2">
                <p className="font-medium">كيفية التصدير من فيسبوك:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>
                    فيسبوك → الإعدادات → معلوماتك في فيسبوك → تنزيل معلوماتك
                  </li>
                  <li>اختر JSON أو CSV، ثم حمّل الملف</li>
                  <li>
                    أو ارفع أي ملف CSV يحتوي أعمدة: الاسم، الهاتف، البريد،
                    العنوان
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
            <input
              ref={facebookRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFileChange("facebook", e)}
            />
            <Button
              className="w-full"
              variant="outline"
              onClick={() => facebookRef.current?.click()}
              disabled={loading}
            >
              <Share2 className="size-4 ml-2" />
              رفع ملف CSV من فيسبوك
            </Button>
            <input
              ref={csvRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFileChange("csv", e)}
            />
            <Button
              className="w-full"
              variant="ghost"
              onClick={() => csvRef.current?.click()}
              disabled={loading}
            >
              <FileSpreadsheet className="size-4 ml-2" />
              رفع CSV عام
            </Button>
          </TabsContent>

          <TabsContent value="nashawi" className="space-y-4 mt-4">
            <Alert>
              <AlertDescription className="text-sm space-y-2">
                <p className="font-medium">استيراد من شجرة عائلة النشاوي:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>جلب تلقائي من nashawi.xyz (إن توفّر API)</li>
                  <li>أو رفع ملف JSON يحتوي قائمة الأعضاء</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="nashawi-url">رابط JSON (اختياري)</Label>
              <Input
                id="nashawi-url"
                dir="ltr"
                className="text-left"
                placeholder="https://nashawi.xyz/api/members.json"
                value={nashawiUrl}
                onChange={(e) => setNashawiUrl(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={fetchFromNashawi}
              disabled={loading}
            >
              <Globe className="size-4 ml-2" />
              جلب من nashawi.xyz
            </Button>

            <input
              ref={nashawiFileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => handleFileChange("nashawi", e)}
            />
            <Button
              className="w-full"
              variant="outline"
              onClick={() => nashawiFileRef.current?.click()}
              disabled={loading}
            >
              <Upload className="size-4 ml-2" />
              رفع ملف JSON
            </Button>
          </TabsContent>
        </Tabs>

        {loading && (
          <p className="text-center text-sm text-muted-foreground py-2">
            جاري الاستيراد...
          </p>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert>
            <CheckCircle2 className="size-4 text-green-600" />
            <AlertDescription>
              <p className="font-medium text-green-700">{result.message}</p>
              <p className="text-sm text-muted-foreground mt-1">
                المجموع: {result.total} | مستورد: {result.imported} | متخطى
                (مكرر): {result.skipped}
              </p>
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
