"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        const { data } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single();
          
        if (data) setUsername(data.username);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    const { error } = await supabase
      .from("profiles")
      .update({ username: username })
      .eq("id", user.id);

    if (error) {
      if (error.code === '23505') {
        setMessage({ text: "That username is already taken!", type: "error" });
      } else {
        setMessage({ text: "Error saving: " + error.message, type: "error" });
      }
    } else {
      setMessage({ text: "Username updated successfully!", type: "success" });
    }
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen p-12 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen p-12 text-center flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">You are not logged in.</h1>
        <Link href="/" className="text-desert-orange hover:underline">Go back home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-2xl mx-auto">
      
      <Link href="/" className="inline-flex items-center text-foreground/60 hover:text-desert-orange transition-colors mb-8 font-medium">
        ← Back to events
      </Link>

      <h1 className="text-3xl font-extrabold text-neon-cyan mb-2">Account Settings</h1>
      <p className="text-foreground/70 mb-8">Manage your public profile and account details.</p>

      <div className="bg-surface border border-surface-border p-6 md:p-8 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-foreground mb-4 border-b border-surface-border pb-4">Public Profile</h2>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground/70 uppercase tracking-wide mb-2">
              Email Address <span className="lowercase font-normal opacity-50">(Cannot be changed)</span>
            </label>
            <input 
              type="text" 
              disabled 
              value={user.email} 
              className="w-full bg-background/50 border border-surface-border rounded-lg px-4 py-3 text-foreground/50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground/70 uppercase tracking-wide mb-2">
              Username
            </label>
            <input 
              type="text" 
              required
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-cyan"
            />
            <p className="text-xs text-foreground/50 mt-2">This is how you will appear in the community comments section.</p>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg text-sm font-bold ${message.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            disabled={saving}
            className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold py-3 px-8 rounded-xl transition-colors shadow-lg disabled:opacity-50 cursor-pointer mt-4"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

    </main>
  );
}