"use client";

import { useState } from "react";
import type { Contact } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MessageCircle,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactTableProps {
  contacts: Contact[];
  admin?: boolean;
  onEdit?: (contact: Contact) => void;
  onDelete?: (id: string) => void;
}

function CellText({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      className={cn("block max-w-[140px] truncate", className)}
      title={title}
    >
      {children}
    </span>
  );
}

export function ContactTable({
  contacts,
  admin,
  onEdit,
  onDelete,
}: ContactTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
      <Table className="text-xs border-collapse [&_th]:border [&_td]:border [&_th]:border-border/60 [&_td]:border-border/40">
        <TableHeader className="sticky top-0 z-[1]">
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead className="w-8 text-center text-right font-semibold">
              #
            </TableHead>
            <TableHead className="min-w-[100px] text-right font-semibold">
              الاسم
            </TableHead>
            <TableHead className="min-w-[64px] text-right font-semibold">
              التصنيف
            </TableHead>
            <TableHead className="min-w-[96px] text-right font-semibold">
              الهاتف
            </TableHead>
            <TableHead className="min-w-[80px] text-right font-semibold hidden sm:table-cell">
              هاتف 2
            </TableHead>
            <TableHead className="min-w-[100px] text-right font-semibold hidden md:table-cell">
              البريد
            </TableHead>
            <TableHead className="min-w-[120px] text-right font-semibold hidden lg:table-cell">
              العنوان
            </TableHead>
            <TableHead className="min-w-[72px] text-right font-semibold hidden lg:table-cell">
              المدينة
            </TableHead>
            <TableHead className="min-w-[80px] text-right font-semibold hidden xl:table-cell">
              ملاحظات
            </TableHead>
            <TableHead className="w-[72px] text-center font-semibold">
              إجراء
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact, index) => {
            const phoneDigits = contact.phone.replace(/\D/g, "");

            return (
              <TableRow
                key={contact.id}
                className={cn(
                  "h-8",
                  index % 2 === 1 && "bg-slate-50/80"
                )}
              >
                <TableCell className="py-1 text-center text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="py-1 font-medium">
                  <CellText title={contact.name}>{contact.name}</CellText>
                </TableCell>
                <TableCell className="py-1">
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 text-[10px] font-normal"
                  >
                    {contact.category}
                  </Badge>
                </TableCell>
                <TableCell className="py-1">
                  <a
                    href={`tel:${contact.phone}`}
                    className="dir-ltr block truncate text-primary hover:underline"
                    title={contact.phone}
                  >
                    {contact.phone}
                  </a>
                </TableCell>
                <TableCell className="py-1 hidden sm:table-cell">
                  {contact.phone2 ? (
                    <a
                      href={`tel:${contact.phone2}`}
                      className="dir-ltr block truncate text-muted-foreground hover:underline"
                      title={contact.phone2}
                    >
                      {contact.phone2}
                    </a>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </TableCell>
                <TableCell className="py-1 hidden md:table-cell">
                  {contact.email ? (
                    <a
                      href={`mailto:${contact.email}`}
                      className="dir-ltr block truncate text-muted-foreground hover:underline"
                      title={contact.email}
                    >
                      {contact.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </TableCell>
                <TableCell className="py-1 hidden lg:table-cell">
                  <CellText title={contact.address}>
                    {contact.address || "—"}
                  </CellText>
                </TableCell>
                <TableCell className="py-1 hidden lg:table-cell">
                  <CellText title={contact.city}>
                    {contact.city || "—"}
                  </CellText>
                </TableCell>
                <TableCell className="py-1 hidden xl:table-cell">
                  <CellText title={contact.notes}>
                    {contact.notes || "—"}
                  </CellText>
                </TableCell>
                <TableCell className="py-1">
                  <div className="flex items-center justify-center gap-0.5">
                    {admin ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onEdit?.(contact)}
                          aria-label="تعديل"
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={async () => {
                            if (!confirm("هل تريد حذف هذا السجل؟")) return;
                            setDeletingId(contact.id);
                            onDelete?.(contact.id);
                          }}
                          disabled={deletingId === contact.id}
                          aria-label="حذف"
                        >
                          <Trash2 className="size-3 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <a
                          href={`tel:${contact.phone}`}
                          className="inline-flex size-6 items-center justify-center rounded-md hover:bg-muted"
                          aria-label="اتصال"
                        >
                          <Phone className="size-3" />
                        </a>
                        <a
                          href={`https://wa.me/${phoneDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex size-6 items-center justify-center rounded-md hover:bg-muted"
                          aria-label="واتساب"
                        >
                          <MessageCircle className="size-3 text-green-600" />
                        </a>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
