"use client";

import { useState } from "react";
import type { Contact } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactDetailsDialog } from "@/components/contact-details-dialog";
import { ContactAvatar } from "@/components/contact-avatar";
import {
  Info,
  MessageCircle,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactCardProps {
  contact: Contact;
  admin?: boolean;
  onEdit?: (contact: Contact) => void;
  onDelete?: (id: string) => void;
}

export function ContactCard({
  contact,
  admin,
  onEdit,
  onDelete,
}: ContactCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const phoneDigits = contact.phone.replace(/\D/g, "");

  return (
    <>
      <Card className="group relative gap-0 py-0 hover:shadow-sm transition-shadow h-full min-w-0">
        {admin && (
          <div className="absolute top-0.5 left-0.5 z-10 flex opacity-80 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-4"
              onClick={() => onEdit?.(contact)}
              aria-label="تعديل"
            >
              <Pencil className="size-2" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-4"
              onClick={async () => {
                if (!confirm("هل تريد حذف هذا السجل؟")) return;
                setDeleting(true);
                onDelete?.(contact.id);
              }}
              disabled={deleting}
              aria-label="حذف"
            >
              <Trash2 className="size-2 text-destructive" />
            </Button>
          </div>
        )}

        <CardContent className="flex flex-col items-center p-1.5 gap-0.5 text-center min-w-0">
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="rounded-full hover:opacity-90 transition-opacity shrink-0"
            aria-label={`عرض تفاصيل ${contact.name}`}
          >
            <ContactAvatar contact={contact} size="xs" />
          </button>

          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="w-full font-medium text-[10px] leading-tight line-clamp-2 hover:text-primary transition-colors px-0.5"
            title={contact.name}
          >
            {contact.name}
          </button>

          <Badge
            variant="secondary"
            className="h-3.5 px-1 text-[8px] font-normal max-w-full truncate"
          >
            {contact.category}
          </Badge>

          <a
            href={`tel:${contact.phone}`}
            className="w-full text-[9px] text-primary hover:underline dir-ltr truncate px-0.5"
            title={contact.phone}
          >
            {contact.phone}
          </a>

          <div className="flex w-full gap-0.5 pt-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-4 shrink-0"
              onClick={() => setDetailsOpen(true)}
              aria-label="عرض التفاصيل"
              title="عرض التفاصيل"
            >
              <Info className="size-2" />
            </Button>
            {!admin && (
              <>
                <a
                  href={`tel:${contact.phone}`}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center rounded h-4",
                    "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                  aria-label="اتصال"
                >
                  <Phone className="size-2" />
                </a>
                <a
                  href={`https://wa.me/${phoneDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex flex-1 items-center justify-center rounded h-4",
                    "bg-green-500/10 text-green-700 hover:bg-green-500/20",
                    "dark:text-green-400"
                  )}
                  aria-label="واتساب"
                >
                  <MessageCircle className="size-2" />
                </a>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <ContactDetailsDialog
        contact={contact}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
}

export const CONTACT_GRID_CLASS =
  "grid gap-1.5 grid-cols-[repeat(auto-fill,minmax(88px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(96px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(100px,1fr))]";
