import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // Next.js super-fast routing

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
        
        {/* --- GLOBAL NAVIGATION BAR --- */}
        <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-surface-border">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* Logo / Home Link */}
            <Link href="/" className="flex items-center gap-3 font-extrabold text-xl tracking-tight hover:opacity-80 transition-opacity">
              <img 
                src="/logo.png" 
                alt="Tri-State Weekly Icon" 
                className="w-10 h-10 object-contain drop-shadow-lg" 
              />
              <div className="hidden sm:block">
                <span className="text-desert-orange">Tri-State</span> <span className="text-desert-pink">Weekly</span>
              </div>
            </Link>

            {/* Desktop & Mobile Links */}
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-neon-cyan transition-colors hidden md:block">
                Discover
              </Link>
              
              <Link href="/submit" className="bg-desert-orange/10 border border-desert-orange text-desert-orange text-sm font-bold px-4 py-2 rounded-full hover:bg-desert-orange hover:text-white transition-all">
                + Submit Event
              </Link>
            </div>

          </div>
        </nav>

        {/* The actual page content loads here */}
        {children}

      </body>
    </html>
  );
}