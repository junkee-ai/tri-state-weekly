import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const outfit = Outfit({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Tri-State Weekly",
  description: "The social pulse of Fort Mohave, Bullhead City, Laughlin, and Needles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} bg-background text-foreground antialiased`}>
        
        {/* --- GLOBAL SMART NAVIGATION BAR --- */}
        <Navbar />

        {/* The actual page content loads here */}
        {children}

      </body>
    </html>
  );
}