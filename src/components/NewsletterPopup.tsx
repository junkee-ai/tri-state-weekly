"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("hasSeenNewsletter");
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenNewsletter", "true"); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const { error } = await supabase.from("subscribers").insert([{ email }]);

    if (error) {
      if (error.code === '23505') {
        setStatus("success");
        setTimeout(closeModal, 2000);
      } else {
        setStatus("error");
      }
    } else {
      setStatus("success");
      setTimeout(closeModal, 2000); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeModal}
      ></div>

      <div className="relative bg-surface border-2 border-desert-orange/50 shadow-[0_0_40px_rgba(255,107,53,0.3)] rounded-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
        
        <h2 className="text-3xl font-extrabold text-sunset mb-2">
          Be the first to know.
        </h2>
        <p className="text-foreground/80 mb-6">
          We're building the ultimate Tri-State weekend guide. Drop your email below to get early access when our weekly newsletter launches!
        </p>

        {status === "success" ? (
          <div className="bg-neon-cyan/20 text-neon-cyan font-bold p-4 rounded-xl mb-4">
            🎉 You're on the list!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
            <input 
              type="email" 
              required 
              placeholder="Enter your email address..." 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 focus:outline-none focus:border-desert-orange text-center"
            />
            <button 
              type="submit" 
              disabled={status === "loading"}
              className="w-full bg-desert-orange hover:bg-desert-pink text-white font-bold py-3 rounded-xl transition-colors shadow-lg disabled:opacity-50"
            >
              {status === "loading" ? "Adding you..." : "Send me the Guide"}
            </button>
            {status === "error" && <p className="text-red-500 text-sm">Something went wrong. Try again.</p>}
          </form>
        )}

        <button 
          onClick={closeModal}
          className="text-sm text-foreground/50 hover:text-foreground transition-colors underline decoration-foreground/30 underline-offset-4"
        >
          No thanks, just let me see the events
        </button>

      </div>
    </div>
  );
}