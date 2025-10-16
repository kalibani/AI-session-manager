import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Toaster } from "@/components/ui/sonner";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { SettingsToggle } from "@/components/SettingsToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Session Manager",
  description:
    "Manage your AI conversation sessions with persistent storage and streaming responses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <div className="min-h-screen flex flex-col">
              <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                  <h1 className="text-xl font-bold">AI Session Manager</h1>
                  <div className="flex items-center gap-2">
                    <SettingsToggle />
                    <DarkModeToggle />
                  </div>
                </div>
              </header>
              <main className="flex-1 container mx-auto px-4 py-8">
                {children}
              </main>
              <footer className="border-t py-4 text-center text-sm text-muted-foreground">
                <p>Kautzar Alibani all rights reserved</p>
              </footer>
            </div>
            <Toaster />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
