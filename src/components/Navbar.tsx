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
              className="h-8 sm:h-15 w-auto object-contain drop-shadow-md" 
            />
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/submit" className="bg-desert-orange/10 border border-desert-orange text-desert-orange text-xs sm:text-sm font-bold px-4 py-2 rounded-full hover:bg-desert-orange hover:text-white transition-all">
              + Submit Event
            </Link>
            
            {user ? (
              /* --- NEW: USER PROFILE DROPDOWN --- */
              <div className="relative group">
                
                {/* The Circular User Icon */}
                <button className="w-10 h-10 rounded-full bg-surface border-2 border-surface-border flex items-center justify-center text-foreground/70 hover:text-neon-cyan hover:border-neon-cyan transition-colors focus:outline-none shadow-sm cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </button>

                {/* The Hover Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-surface-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right translate-y-2 group-hover:translate-y-0">
                  <div className="p-2 flex flex-col gap-1">
                    
                    <Link href="/settings" className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors text-left">
                      Account Settings
                    </Link>
                    
                    {/* ONLY SHOW ADMIN LINK IF THEY ARE THE BOSS! */}
                    {user?.email === "gpmiranda@gmail.com" && (
                      <Link href="/admin" className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-desert-orange hover:bg-desert-orange/10 rounded-lg transition-colors text-left">
                        Admin Dashboard
                      </Link>
                    )}
                    
                    <div className="h-px bg-surface-border my-1"></div>
                    
                    <button onClick={handleLogout} className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left cursor-pointer">
                      Log Out
                    </button>
                    
                  </div>
                </div>

              </div>
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