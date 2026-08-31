"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { BackupLogEntry } from "@/lib/types";
import {
  ArchiveRestore,
  Database,
  Download,
  History,
  Loader2,
} from "lucide-react";

interface BackupPanelProps {
  onRestored?: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ar", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function actionLabel(action: BackupLogEntry["action"]): string {
  return action === "backup" ? "نسخ احتياطي" : "استرجاع";
}

export function BackupPanel({ onRestored }: BackupPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [logs, setLogs] = useState<BackupLogEntry[]>([]);
  const [loadingLog, setLoadingLog] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadLog = useCallback(async () => {
    setLoadingLog(true);
    const res = await fetch("/api/admin/backup/log");
    if (res.ok) {
      const data = await res.json();
      setLogs(data.entries ?? []);
    }
    setLoadingLog(false);
  }, []);

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  async function handleBackup() {
    setBackingUp(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "فشل إنشاء النسخة الاحتياطية");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "nashawi-tel-backup.json";

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      setMessage("تم تنزيل النسخة الاحتياطية بنجاح");
      await loadLog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setBackingUp(false);
    }
  }

  async function handleRestore(file: File) {
    if (
      !confirm(
        "تحذير: سيتم استبدال جميع جهات الاتصال والصور الحالية بالنسخة الاحتياطية. هل تريد المتابعة؟"
      )
    ) {
      return;
    }

    setRestoring(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("backup", file);

      const res = await fetch("/api/admin/restore", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "فشل الاسترجاع");

      setMessage(data.message ?? "تم الاسترجاع بنجاح");
      onRestored?.();
      await loadLog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
      await loadLog();
    } finally {
      setRestoring(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Database className="size-5 text-primary" />
        <div>
          <h2 className="font-semibold text-sm">النسخ الاحتياطي والاسترجاع</h2>
          <p className="text-xs text-muted-foreground">
            احفظ نسخة من جهات الاتصال والصور وإعدادات الإدارة
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackup}
          disabled={backingUp || restoring}
        >
          {backingUp ? (
            <Loader2 className="size-4 ml-1 animate-spin" />
          ) : (
            <Download className="size-4 ml-1" />
          )}
          إنشاء نسخة احتياطية
        </Button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleRestore(file);
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={backingUp || restoring}
        >
          {restoring ? (
            <Loader2 className="size-4 ml-1 animate-spin" />
          ) : (
            <ArchiveRestore className="size-4 ml-1" />
          )}
          استرجاع نسخة
        </Button>
      </div>

      {message && (
        <p className="text-xs text-green-700 dark:text-green-400">{message}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <History className="size-3.5" />
          سجل العمليات
        </div>

        {loadingLog ? (
          <p className="text-xs text-muted-foreground">جاري التحميل...</p>
        ) : logs.length === 0 ? (
          <p className="text-xs text-muted-foreground">لا توجد عمليات بعد</p>
        ) : (
          <div className="max-h-48 overflow-y-auto rounded-md border text-xs">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="p-2 text-right font-medium">التاريخ</th>
                  <th className="p-2 text-right font-medium">العملية</th>
                  <th className="p-2 text-right font-medium">السجلات</th>
                  <th className="p-2 text-right font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((entry) => (
                  <tr key={entry.id} className="border-t">
                    <td className="p-2 whitespace-nowrap">
                      {formatDate(entry.createdAt)}
                    </td>
                    <td className="p-2">{actionLabel(entry.action)}</td>
                    <td className="p-2">
                      {entry.contactCount}
                      {entry.imageCount > 0 && (
                        <span className="text-muted-foreground">
                          {" "}
                          (+{entry.imageCount} صورة)
                        </span>
                      )}
                    </td>
                    <td className="p-2">
                      <span
                        className={
                          entry.status === "success"
                            ? "text-green-700 dark:text-green-400"
                            : "text-destructive"
                        }
                      >
                        {entry.status === "success" ? "نجاح" : "فشل"}
                      </span>
                      {entry.message && (
                        <p
                          className="text-[10px] text-muted-foreground truncate max-w-[120px]"
                          title={entry.message}
                        >
                          {entry.message}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
