import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "دليل الهواتف والعناوين | نشاوي",
  description: "فهرس شامل للهواتف والعناوين — tel.nashawi.xyz",
  metadataBase: new URL("https://tel.nashawi.xyz"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${notoArabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-arabic)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
