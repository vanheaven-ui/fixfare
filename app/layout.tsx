import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { AuthProvider } from '@/lib/auth';  // Phase 5

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FixFare - Transparent Repair Quotes",
  description: "Fair prices for car & moto repairs in Uganda.",
  keywords: ["auto repair", "uganda", "quotes", "mechanics"],
  openGraph: {
    title: "FixFare",
    description: "Transparent repair pricing.",
    url: process.env.NEXTAUTH_URL || "https://fixfare.app",
    siteName: "FixFare",
    images: [{ url: "/og-image.png" }], // Add to public/ later
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
