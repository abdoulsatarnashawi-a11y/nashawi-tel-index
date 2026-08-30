"use client";

import { useState } from "react";
import type { Contact } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  Mail,
  Pencil,
  Trash2,
  MessageCircle,
} from "lucide-react";

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
  const phoneDigits = contact.phone.replace(/\D/g, "");

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg">{contact.name}</h3>
            <Badge variant="secondary" className="mt-1">
              {contact.category}
            </Badge>
          </div>
          {admin && (
            <div className="flex gap-1 opacity-80 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit?.(contact)}
                aria-label="تعديل"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={async () => {
                  if (!confirm("هل تريد حذف هذا السجل؟")) return;
                  setDeleting(true);
                  onDelete?.(contact.id);
                }}
                disabled={deleting}
                aria-label="حذف"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-2 text-primary hover:underline dir-ltr justify-end"
          >
            <Phone className="size-4 shrink-0" />
            {contact.phone}
          </a>

          {contact.phone2 && (
            <a
              href={`tel:${contact.phone2}`}
              className="flex items-center gap-2 text-muted-foreground hover:underline dir-ltr justify-end"
            >
              <Phone className="size-4 shrink-0" />
              {contact.phone2}
            </a>
          )}

          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 text-muted-foreground hover:underline dir-ltr justify-end"
            >
              <Mail className="size-4 shrink-0" />
              {contact.email}
            </a>
          )}

          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="size-4 shrink-0 mt-0.5" />
            <span>
              {contact.address}
              {contact.city ? ` — ${contact.city}` : ""}
            </span>
          </div>

          {contact.notes && (
            <p className="text-muted-foreground text-xs bg-muted/50 rounded-md p-2">
              {contact.notes}
            </p>
          )}
        </div>

        {!admin && (
          <div className="flex gap-2 pt-1">
            <LinkButton href={`tel:${contact.phone}`} size="sm" className="flex-1">
              اتصال
            </LinkButton>
            <LinkButton
              href={`https://wa.me/${phoneDigits}`}
              size="sm"
              variant="outline"
              className="flex-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-4 ml-1" />
              واتساب
            </LinkButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
