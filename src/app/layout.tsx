import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import TopNavbar from "@/components/TopNavbar";
import BottomNavigationBar from "@/components/BottomNavigationBar";

const notoSans = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Bogorsneakers - Japanese Minimal Store",
  description: "Bogorsneakers with a Japanese minimal style shopping experience.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSans.variable} ${zenKaku.variable} antialiased bg-washi text-sumi`}>
        {/* Desktop top navbar — hidden on mobile */}
        <TopNavbar />

        {/* Main content — padding-bottom on mobile for bottom nav, padding-top on desktop for top nav */}
        <main className="min-h-screen pb-20 md:pb-0 md:pt-21">
          {children}
        </main>

        {/* Mobile bottom navigation — hidden on desktop */}
        <BottomNavigationBar />
      </body>
    </html>
  );
}
