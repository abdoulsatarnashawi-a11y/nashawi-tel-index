"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/components/link-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, KeyRound, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const [authRes, setupRes] = await Promise.all([
        fetch("/api/auth/login"),
        fetch("/api/admin/setup"),
      ]);
      const auth = await authRes.json();
      const setup = await setupRes.json();

      if (!setup.configured) {
        router.replace("/admin/setup");
        return;
      }
      if (auth.authenticated) {
        router.replace("/admin");
        return;
      }
      setChecking(false);
    }
    check();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "فشل تسجيل الدخول");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Lock className="size-6" />
          </div>
          <CardTitle className="text-2xl">دخول المدير</CardTitle>
          <CardDescription>أدخل كلمة مرور الإدارة للمتابعة</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                dir="ltr"
                className="text-left font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري الدخول..." : "دخول"}
            </Button>
          </form>

          <div className="mt-6 space-y-3 border-t pt-4">
            <LinkButton href="/admin/recover" variant="outline" className="w-full gap-2">
              <KeyRound className="size-4" />
              استرداد كلمة المرور
            </LinkButton>
            <LinkButton href="/" variant="ghost" className="w-full gap-2">
              <ArrowRight className="size-4" />
              العودة للدليل
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
