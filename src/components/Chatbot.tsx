"use client";

import { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: "assistant", content: "Hey! 👋 Looking for something to do in the Tri-State area? Ask me!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add user message to UI instantly
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We only send the last 4 messages to save data/money
        body: JSON.stringify({ message: userMsg, history: newMessages.slice(-4) }), 
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: "Oops, my circuits got crossed. Try again?" }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "Connection lost. Please try again!" }]);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      
      {/* --- THE CHAT WINDOW --- */}
      {isOpen && (
        <div className="bg-surface border border-neon-cyan/50 shadow-[0_0_30px_rgba(0,243,255,0.15)] rounded-2xl w-[90vw] sm:w-[350px] h-[450px] mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-neon-cyan/10 border-b border-neon-cyan/20 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <h3 className="font-bold text-neon-cyan text-sm uppercase tracking-wider">Event Guide AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-foreground/50 hover:text-foreground font-bold">✕</button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {messages.map((msg, idx) => {
              // Tiny script to turn ChatGPT's **text** into real bold HTML
              const formattedContent = msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              
              return (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-2xl max-w-[90%] text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-desert-orange text-white rounded-br-none" : "bg-surface border border-surface-border text-foreground/90 rounded-bl-none shadow-sm"}`}>
                    <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface border border-surface-border p-3 rounded-2xl rounded-bl-none text-sm text-foreground/50 flex gap-1">
                  <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3 border-t border-surface-border bg-surface flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Any live music tonight?" 
              className="flex-1 bg-background border border-surface-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="w-10 h-10 bg-neon-cyan text-black rounded-full flex items-center justify-center font-bold disabled:opacity-50 transition-colors">
              ↑
            </button>
          </form>

        </div>
      )}

      {/* --- THE FLOATING BUTTON --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-[0_0_20px_rgba(0,243,255,0.3)] flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-surface border border-neon-cyan text-neon-cyan' : 'bg-neon-cyan text-black'}`}
      >
        {isOpen ? "✕" : "💬"}
      </button>

    </div>
  );
}