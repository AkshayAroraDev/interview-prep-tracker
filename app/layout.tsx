import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { AppShell } from "@/components/layout/app-shell";
import { storageService } from "@/lib/storage-service";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TrackerProvider } from "@/components/providers/tracker-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interview Prep Tracker",
  description:
    "Track interview preparation across technologies, sections, and topics.",
};

const themeInitScript = storageService.getThemeInitScript();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="h-full overflow-hidden bg-background text-foreground">
        <ThemeProvider>
          <TrackerProvider>
            <TooltipProvider>
              <AppShell>{children}</AppShell>
            </TooltipProvider>
          </TrackerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
