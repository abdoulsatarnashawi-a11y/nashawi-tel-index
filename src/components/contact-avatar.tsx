"use client";

import type { Contact } from "@/lib/types";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0]}${parts[1][0]}`;
}

const sizeClasses = {
  sm: "size-10 text-[10px]",
  md: "size-16 text-sm",
  lg: "size-24 text-xl",
};

interface ContactAvatarProps {
  contact: Pick<Contact, "name" | "image">;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function ContactAvatar({
  contact,
  size = "sm",
  className,
}: ContactAvatarProps) {
  const sizeClass = sizeClasses[size];

  if (contact.image) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border",
          sizeClass,
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={contact.image}
          alt={contact.name}
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold ring-1 ring-border",
        sizeClass,
        className
      )}
      aria-hidden
    >
      {getInitials(contact.name) || <User className="size-4" />}
    </div>
  );
}
