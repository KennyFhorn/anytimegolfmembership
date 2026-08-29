import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { getCurrentProfile } from "@/lib/auth";
import { isDemoMode } from "@/lib/data";
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
  title: "Anytime Golf Member App",
  description: "League night management for Anytime Golf's Trackman simulator studio.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Fetched once here so the nav is a single persistent instance across the
  // whole app — it never remounts (and never changes shape) as you navigate,
  // unlike having each route group render its own copy.
  const profile = await getCurrentProfile();
  const demo = isDemoMode();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader profile={profile} isDemoMode={demo} />
        {children}
      </body>
    </html>
  );
}
