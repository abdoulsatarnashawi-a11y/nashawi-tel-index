"use client";

import { useMemo, useState } from "react";
import type { Contact } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ContactCard } from "@/components/contact-card";
import { Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface DirectoryClientProps {
  initialContacts: Contact[];
}

export function DirectoryClient({ initialContacts }: DirectoryClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialContacts.filter((c) => {
      const matchesCategory = !category || c.category === category;
      if (!q) return matchesCategory;
      const haystack = [
        c.name,
        c.phone,
        c.phone2,
        c.email,
        c.address,
        c.city,
        c.category,
        c.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesCategory && haystack.includes(q);
    });
  }, [initialContacts, search, category]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of initialContacts) {
      counts[c.category] = (counts[c.category] ?? 0) + 1;
    }
    return counts;
  }, [initialContacts]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 py-4">
        <h2 className="text-2xl font-bold">ابحث في الدليل</h2>
        <p className="text-muted-foreground">
          {initialContacts.length} جهة اتصال مسجّلة
        </p>
      </div>

      <div className="relative max-w-xl mx-auto">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          placeholder="ابحث بالاسم، الهاتف، العنوان..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10 h-12 text-base"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Badge
          variant={category === null ? "default" : "outline"}
          className="cursor-pointer px-3 py-1"
          onClick={() => setCategory(null)}
        >
          الكل ({initialContacts.length})
        </Badge>
        {CATEGORIES.filter((cat) => categoryCounts[cat]).map((cat) => (
          <Badge
            key={cat}
            variant={category === cat ? "default" : "outline"}
            className="cursor-pointer px-3 py-1"
            onClick={() => setCategory(cat === category ? null : cat)}
          >
            {cat} ({categoryCounts[cat]})
          </Badge>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Users className="size-12 mx-auto text-muted-foreground/50" />
          <p className="text-lg font-medium">لا توجد نتائج</p>
          <p className="text-muted-foreground text-sm">
            جرّب كلمات بحث مختلفة أو غيّر التصنيف
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {filtered.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  );
}
