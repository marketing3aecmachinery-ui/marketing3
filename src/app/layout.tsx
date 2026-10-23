import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/data/DataProvider";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AEC Machinery Marketing Dashboard",
  description: "Marketing dashboard for AEC Machinery (M) Sdn Bhd",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AuthGate>
          <DataProvider>
            <AppShell>{children}</AppShell>
          </DataProvider>
        </AuthGate>
      </body>
    </html>
  );
}
