"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CopyButton } from "@/components/copy-button";
import { KeyRound, ShieldAlert } from "lucide-react";

interface CredentialDisplayProps {
  password: string;
  recoveryKey: string;
  message?: string;
}

export function CredentialDisplay({
  password,
  recoveryKey,
  message,
}: CredentialDisplayProps) {
  return (
    <div className="space-y-4">
      {message && (
        <Alert>
          <ShieldAlert className="size-4" />
          <AlertTitle>مهم</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">كلمة مرور المدير</p>
            <p className="font-mono text-lg font-semibold tracking-wide dir-ltr text-left">
              {password}
            </p>
          </div>
          <CopyButton value={password} label="نسخ كلمة المرور" />
        </div>

        <div className="border-t pt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <KeyRound className="size-3.5" />
              مفتاح الاسترداد
            </p>
            <p className="font-mono text-sm font-medium tracking-wider dir-ltr text-left break-all">
              {recoveryKey}
            </p>
          </div>
          <CopyButton value={recoveryKey} label="نسخ المفتاح" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        احفظ هذه البيانات في مكان آمن. لن تُعرض مرة أخرى بعد مغادرة هذه الصفحة.
      </p>
    </div>
  );
}
