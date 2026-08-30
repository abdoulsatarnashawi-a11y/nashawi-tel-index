"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/components/link-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CredentialDisplay } from "@/components/credential-display";
import { Shield, ArrowRight } from "lucide-react";

export default function AdminSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [credentials, setCredentials] = useState<{
    password: string;
    recoveryKey: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    async function check() {
      const res = await fetch("/api/admin/setup");
      const data = await res.json();
      if (data.configured) {
        router.replace("/admin/login");
        return;
      }
      setChecking(false);
    }
    check();
  }, [router]);

  async function handleSetup() {
    setLoading(true);
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setCredentials(data);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (credentials) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-700">
              تم الإعداد بنجاح
            </CardTitle>
            <CardDescription>
              انسخ كلمة المرور ومفتاح الاسترداد واحفظهما
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CredentialDisplay
              password={credentials.password}
              recoveryKey={credentials.recoveryKey}
              message={credentials.message}
            />
            <Button className="w-full" onClick={() => router.push("/admin")}>
              الانتقال للوحة الإدارة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="size-6" />
          </div>
          <CardTitle className="text-2xl">إعداد النظام</CardTitle>
          <CardDescription>
            مرحباً! هذا أول تشغيل للنظام. سيتم إنشاء كلمة مرور ديناميكية
            ومفتاح استرداد يمكنك نسخهما.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={handleSetup} disabled={loading}>
            {loading ? "جاري الإنشاء..." : "إنشاء كلمة المرور والمفتاح"}
          </Button>
          <LinkButton href="/" variant="ghost" className="w-full gap-2">
            <ArrowRight className="size-4" />
            العودة للدليل
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  );
}
