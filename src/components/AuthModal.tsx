"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      // --- LOGIN LOGIC ---
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
      else {
        window.location.reload(); // Refresh to show they are logged in!
      }
    } else {
      // --- SIGN UP LOGIC ---
      if (!username) {
        setError("Username is required");
        setLoading(false);
        return;
      }
      
      // 1. Create the user in Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password });
      
      if (signUpError) {
        setError(signUpError.message);
      } else if (authData.user) {
        // 2. Save their public username to our new Profiles table!
        const { error: profileError } = await supabase.from("profiles").insert([
          { id: authData.user.id, username: username }
        ]);
        
        if (profileError) setError("Error saving username: " + profileError.message);
        else window.location.reload(); // Success!
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-surface border border-surface-border shadow-2xl rounded-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground text-xl font-bold">✕</button>
        
        <h2 className="text-2xl font-extrabold text-neon-cyan mb-6">
          {isLogin ? "Welcome Back" : "Join the Community"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="text-xs text-foreground/50 font-bold uppercase">Username</label>
              <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-background border border-surface-border rounded-lg px-4 py-2 mt-1 focus:border-neon-cyan outline-none" placeholder="e.g. RiverRat99" />
            </div>
          )}
          
          <div>
            <label className="text-xs text-foreground/50 font-bold uppercase">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-background border border-surface-border rounded-lg px-4 py-2 mt-1 focus:border-neon-cyan outline-none" />
          </div>

          <div>
            <label className="text-xs text-foreground/50 font-bold uppercase">Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-background border border-surface-border rounded-lg px-4 py-2 mt-1 focus:border-neon-cyan outline-none" minLength={6} />
          </div>

          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold py-3 rounded-xl mt-2 transition-colors">
            {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/60 mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="ml-2 text-desert-orange font-bold hover:underline">
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}