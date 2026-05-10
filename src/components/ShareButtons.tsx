"use client";

import { useState, useEffect } from "react";

export default function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Grab the URL once the component loads on the user's screen
  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const copyToClipboard = async () => {
    try {
      if (navigator.share) {
        // If on mobile, open the native iPhone/Android share menu!
        await navigator.share({ title: title, url: url });
      } else {
        // If on desktop, just copy the link
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.log("Share failed", err);
    }
  };

  if (!url) return null;

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const xUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Check out this event: " + title)}`;

  return (
    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-surface-border">
      <span className="text-sm font-bold text-foreground/50 tracking-widest uppercase">Share</span>
      
      <div className="flex gap-3">
        {/* Facebook */}
        <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center hover:border-desert-orange hover:text-desert-orange transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
        </a>
        
        {/* X / Twitter */}
        <a href={xUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center hover:border-neon-cyan hover:text-neon-cyan transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.04H5.078z" /></svg>
        </a>

        {/* Copy Link / Mobile Native Share */}
        <button onClick={copyToClipboard} className={`px-4 h-10 rounded-full bg-surface border flex items-center justify-center text-sm font-bold transition-colors ${copied ? 'border-green-500 text-green-500' : 'border-surface-border hover:border-foreground'}`}>
          {copied ? "Copied!" : navigator.share ? "Share..." : "Copy Link"}
        </button>
      </div>
    </div>
  );
}