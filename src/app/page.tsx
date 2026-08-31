import { Phone, Settings } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { DirectoryClient } from "@/components/directory-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteQrCode } from "@/components/site-qr-code";
import { getContacts } from "@/lib/storage";

export default async function HomePage() {
  const contacts = await getContacts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Phone className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">دليل الهواتف والعناوين</h1>
              <p className="text-sm text-muted-foreground">tel.nashawi.xyz</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LinkButton href="/admin/login" variant="outline" size="sm">
              <Settings className="size-4 ml-1" />
              الإدارة
            </LinkButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <DirectoryClient initialContacts={contacts} />
      </main>

      <footer className="border-t mt-auto py-8">
        <div className="container mx-auto px-4 space-y-6">
          <SiteQrCode />
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} نشاوي — دليل الهواتف والعناوين
          </p>
        </div>
      </footer>
    </div>
  );
}
