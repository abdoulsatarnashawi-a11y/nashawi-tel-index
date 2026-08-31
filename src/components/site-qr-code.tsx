"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { Download, QrCode } from "lucide-react";

interface SiteQrCodeProps {
  compact?: boolean;
}

export function SiteQrCode({ compact }: SiteQrCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  function downloadQr() {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = "nashawi-tel-qrcode.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  }

  if (compact) {
    return (
      <div className="inline-flex flex-col items-center gap-2">
        <div ref={qrRef} className="rounded-lg bg-white p-2 shadow-sm">
          <QRCode value={SITE_URL} size={88} />
        </div>
        <p className="text-xs text-muted-foreground dir-ltr">{SITE_URL}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
      <div ref={qrRef} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-border">
        <QRCode value={SITE_URL} size={128} />
      </div>
      <div className="text-center sm:text-right space-y-2">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-foreground font-medium">
          <QrCode className="size-4" />
          <span>باركود الموقع</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          امسح الرمز للوصول إلى {SITE_NAME} على هاتفك
        </p>
        <p className="text-sm font-medium dir-ltr text-primary">{SITE_URL}</p>
        <Button variant="outline" size="sm" onClick={downloadQr}>
          <Download className="size-4 ml-1" />
          تحميل الباركود
        </Button>
      </div>
    </div>
  );
}
