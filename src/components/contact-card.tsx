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
      <Card className="group gap-0 py-0 hover:shadow-sm transition-shadow overflow-hidden">
        <CardContent className="p-2 space-y-1">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="rounded-full hover:opacity-90 transition-opacity"
              aria-label={`عرض تفاصيل ${contact.name}`}
            >
              <ContactAvatar contact={contact} size="sm" />
            </button>
          </div>

          <div className="flex items-start justify-between gap-1">
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="font-medium text-xs leading-tight line-clamp-2 flex-1 text-right hover:text-primary transition-colors"
              title={contact.name}
            >
              {contact.name}
            </button>
            {admin && (
              <div className="flex shrink-0 opacity-70 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-5"
                  onClick={() => onEdit?.(contact)}
                  aria-label="تعديل"
                >
                  <Pencil className="size-2.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-5"
                  onClick={async () => {
                    if (!confirm("هل تريد حذف هذا السجل؟")) return;
                    setDeleting(true);
                    onDelete?.(contact.id);
                  }}
                  disabled={deleting}
                  aria-label="حذف"
                >
                  <Trash2 className="size-2.5 text-destructive" />
                </Button>
              </div>
            )}
          </div>

          <Badge
            variant="secondary"
            className="h-4 px-1 text-[9px] font-normal max-w-full truncate"
          >
            {contact.category}
          </Badge>

          <a
            href={`tel:${contact.phone}`}
            className="block text-[10px] text-primary hover:underline dir-ltr truncate"
            title={contact.phone}
          >
            {contact.phone}
          </a>

          <div className="flex gap-0.5 pt-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-5 shrink-0"
              onClick={() => setDetailsOpen(true)}
              aria-label="عرض التفاصيل"
              title="عرض التفاصيل"
            >
              <Info className="size-2.5" />
            </Button>
            {!admin && (
              <>
                <a
                  href={`tel:${contact.phone}`}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center rounded h-5",
                    "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                  aria-label="اتصال"
                >
                  <Phone className="size-2.5" />
                </a>
                <a
                  href={`https://wa.me/${phoneDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex flex-1 items-center justify-center rounded h-5",
                    "bg-green-500/10 text-green-700 hover:bg-green-500/20",
                    "dark:text-green-400"
                  )}
                  aria-label="واتساب"
                >
                  <MessageCircle className="size-2.5" />
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
  "grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
