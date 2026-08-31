"use client";

import type { Contact } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  StickyNote,
} from "lucide-react";

interface ContactDetailsDialogProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="break-words">{children}</div>
      </div>
    </div>
  );
}

export function ContactDetailsDialog({
  contact,
  open,
  onOpenChange,
}: ContactDetailsDialogProps) {
  if (!contact) return null;

  const phoneDigits = contact.phone.replace(/\D/g, "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{contact.name}</DialogTitle>
          <Badge variant="secondary" className="w-fit">
            {contact.category}
          </Badge>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <DetailRow icon={Phone} label="الهاتف">
            <a
              href={`tel:${contact.phone}`}
              className="text-primary hover:underline dir-ltr inline-block"
            >
              {contact.phone}
            </a>
          </DetailRow>

          {contact.phone2 && (
            <DetailRow icon={Phone} label="هاتف إضافي">
              <a
                href={`tel:${contact.phone2}`}
                className="text-primary hover:underline dir-ltr inline-block"
              >
                {contact.phone2}
              </a>
            </DetailRow>
          )}

          {contact.email && (
            <DetailRow icon={Mail} label="البريد الإلكتروني">
              <a
                href={`mailto:${contact.email}`}
                className="text-primary hover:underline dir-ltr inline-block"
              >
                {contact.email}
              </a>
            </DetailRow>
          )}

          <DetailRow icon={MapPin} label="العنوان">
            <span>{contact.address || "—"}</span>
          </DetailRow>

          {contact.city && (
            <DetailRow icon={MapPin} label="المدينة">
              <span>{contact.city}</span>
            </DetailRow>
          )}

          {contact.notes && (
            <DetailRow icon={StickyNote} label="ملاحظات">
              <p className="text-muted-foreground bg-muted/50 rounded-md p-2 text-sm">
                {contact.notes}
              </p>
            </DetailRow>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <LinkButton href={`tel:${contact.phone}`} className="flex-1">
            <Phone className="size-4 ml-1" />
            اتصال
          </LinkButton>
          <LinkButton
            href={`https://wa.me/${phoneDigits}`}
            variant="outline"
            className="flex-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="size-4 ml-1" />
            واتساب
          </LinkButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
