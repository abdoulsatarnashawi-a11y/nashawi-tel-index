"use client";

import { useState } from "react";
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
import { CredentialDisplay } from "@/components/credential-display";
import { KeyRound, ArrowRight } from "lucide-react";

export default function AdminRecoverPage() {
  const router = useRouter();
  const [recoveryKey, setRecoveryKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{
    password: string;
    recoveryKey: string;
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recoveryKey }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "فشل الاسترداد");
      return;
    }

    setCredentials(data);
  }

  if (credentials) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-700">
              تم الاسترداد بنجاح
            </CardTitle>
            <CardDescription>
              تم إنشاء كلمة مرور ومفتاح استرداد جديدين
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-amber-500 text-white">
            <KeyRound className="size-6" />
          </div>
          <CardTitle className="text-2xl">استرداد كلمة المرور</CardTitle>
          <CardDescription>
            أدخل مفتاح الاسترداد الذي حفظته عند الإعداد. سيتم إنشاء كلمة مرور
            جديدة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recoveryKey">مفتاح الاسترداد</Label>
              <Input
                id="recoveryKey"
                dir="ltr"
                className="text-left font-mono tracking-wider"
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
                placeholder="XXXXXXXX..."
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري الاسترداد..." : "استرداد وإنشاء كلمة مرور جديدة"}
            </Button>
          </form>

          <div className="mt-6 border-t pt-4">
            <LinkButton href="/admin/login" variant="ghost" className="w-full gap-2">
              <ArrowRight className="size-4" />
              العودة لتسجيل الدخول
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
