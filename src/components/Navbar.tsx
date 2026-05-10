"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src="/logo.png" 
              alt="Tri-State Weekly" 
              className="h-15 sm:h-12 w-auto object-contain drop-shadow-md" 
            />
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/submit" className="bg-desert-orange/10 border border-desert-orange text-desert-orange text-xs sm:text-sm font-bold px-4 py-2 rounded-full hover:bg-desert-orange hover:text-white transition-all">
              + Submit Event
            </Link>
            
            {user ? (
              <button 
                onClick={handleLogout} 
                className="bg-surface border border-surface-border text-foreground/70 hover:border-red-500 hover:text-red-500 text-xs sm:text-sm font-bold px-4 py-2 rounded-full transition-colors cursor-pointer"
              >
                Log Out
              </button>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)} 
                className="bg-neon-cyan/10 border border-neon-cyan text-neon-cyan text-xs sm:text-sm font-bold px-4 py-2 rounded-full hover:bg-neon-cyan hover:text-black transition-all cursor-pointer shadow-[0_0_10px_rgba(0,243,255,0.2)]"
              >
                Login
              </button>
            )}
          </div>

        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}