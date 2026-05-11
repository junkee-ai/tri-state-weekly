"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // NEW: State trackers for our mobile-friendly dropdowns
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
          
          {/* --- LEFT SIDE: LOGO & NAV DROPDOWN --- */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsNavMenuOpen(!isNavMenuOpen);
                setIsUserMenuOpen(false); // Close the other menu if it's open
              }} 
              className="flex items-center hover:opacity-80 transition-opacity gap-2 cursor-pointer outline-none"
            >
              <img src="/logo.png" alt="Tri-State Weekly" className="h-8 sm:h-10 w-auto object-contain drop-shadow-md" />
              {/* Little down arrow so people know it's a menu */}
              <svg className={`w-4 h-4 text-foreground/50 transition-transform duration-200 ${isNavMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {/* Nav Dropdown Menu */}
            {isNavMenuOpen && (
              <div className="absolute left-0 mt-3 w-56 bg-surface border border-surface-border rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 flex flex-col gap-1">
                  <Link href="/" onClick={() => setIsNavMenuOpen(false)} className="px-4 py-3 text-sm font-bold text-foreground/90 hover:text-desert-orange hover:bg-desert-orange/10 rounded-lg transition-colors text-left flex items-center gap-2">
                    🎉 Local Events
                  </Link>
                  <Link href="/deals" onClick={() => setIsNavMenuOpen(false)} className="px-4 py-3 text-sm font-bold text-foreground/90 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors text-left flex items-center gap-2">
                    🍔 Local Deals & Specials
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* --- RIGHT SIDE: ACTIONS & USER MENU --- */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/submit" className="bg-desert-orange/10 border border-desert-orange text-desert-orange text-xs sm:text-sm font-bold px-4 py-2 rounded-full hover:bg-desert-orange hover:text-white transition-all">
              + Submit Event
            </Link>
            
            {user ? (
              <div className="relative">
                {/* The Circular User Icon (Now a Click Button!) */}
                <button 
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsNavMenuOpen(false); // Close the other menu if it's open
                  }}
                  className={`w-10 h-10 rounded-full bg-surface border-2 flex items-center justify-center transition-colors focus:outline-none shadow-sm cursor-pointer ${isUserMenuOpen ? 'border-neon-cyan text-neon-cyan' : 'border-surface-border text-foreground/70 hover:text-neon-cyan hover:border-neon-cyan'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </button>

                {/* The Click Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-surface border border-surface-border rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 flex flex-col gap-1">
                      
                      <Link href="/settings" onClick={() => setIsUserMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors text-left">
                        Account Settings
                      </Link>
                      
                      {/* ONLY SHOW ADMIN LINK IF THEY ARE THE BOSS! */}
                      {user?.email === "gpmiranda@gmail.com" && (
                        <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-desert-orange hover:bg-desert-orange/10 rounded-lg transition-colors text-left">
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <div className="h-px bg-surface-border my-1"></div>
                      
                      <button onClick={handleLogout} className="px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left cursor-pointer">
                        Log Out
                      </button>
                      
                    </div>
                  </div>
                )}
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