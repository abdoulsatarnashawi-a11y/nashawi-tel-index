"use client";

import { Smartphone, Share2, Globe, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ImportBannerProps {
  onImport: () => void;
}

export function ImportBanner({ onImport }: ImportBannerProps) {
  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold">استيراد الأسماء والأرقام</h2>
            <p className="text-sm text-muted-foreground">
              من الموبايل، فيسبوك، أو موقع nashawi.xyz
            </p>
          </div>
          <Button onClick={onImport}>
            <Upload className="size-4 ml-1" />
            بدء الاستيراد
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Smartphone className="size-4" />
            موبايل (.vcf)
          </span>
          <span className="flex items-center gap-1.5">
            <Share2 className="size-4" />
            فيسبوك (.csv)
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="size-4" />
            nashawi.xyz (.json)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
