import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import TopNavbar from "@/components/TopNavbar";
import BottomNavigationBar from "@/components/BottomNavigationBar";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      <body className={`${poppins.variable} antialiased bg-washi text-sumi`}>
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
