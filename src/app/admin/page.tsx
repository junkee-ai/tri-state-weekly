"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "live">("pending");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);

  // NEW: AI State
  const [aiText, setAiText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  async function fetchEvents() {
    const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    if (!error && data) setAllEvents(data);
    setLoading(false);
  }

  useEffect(() => { fetchEvents(); }, []);

  const pendingEvents = allEvents.filter(e => !e.is_approved);
  const liveEvents = allEvents.filter(e => e.is_approved);
  const displayedEvents = activeTab === "pending" ? pendingEvents : liveEvents;

  // --- ACTIONS ---
  async function handleApprove(id: string) {
    const { error } = await supabase.from("events").update({ is_approved: true }).eq("id", id);
    if (!error) setAllEvents(allEvents.map(e => e.id === id ? { ...e, is_approved: true } : e));
  }

  async function handleUnpublish(id: string) {
    const { error } = await supabase.from("events").update({ is_approved: false, is_featured: false }).eq("id", id);
    if (!error) setAllEvents(allEvents.map(e => e.id === id ? { ...e, is_approved: false, is_featured: false } : e));
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to permanently delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) setAllEvents(allEvents.filter(e => e.id !== id));
  }

  async function handleToggleFeature(id: string, currentStatus: boolean) {
    const { error } = await supabase.from("events").update({ is_featured: !currentStatus }).eq("id", id);
    if (!error) setAllEvents(allEvents.map(e => e.id === id ? { ...e, is_featured: !currentStatus } : e));
  }

  // --- EDITING / DUPLICATING ---
  function handleDuplicate(event: any) {
    const { id, created_at, ...duplicatedData } = event; 
    setEditingId(event.id); 
    setIsDuplicateMode(true); 
    setEditFormData({ ...duplicatedData, is_approved: true }); 
  }

  function startEditing(event: any) {
    setEditingId(event.id);
    setIsDuplicateMode(false); 
    setEditFormData({ ...event });
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  }

  async function handleSave(id: string) {
    if (isDuplicateMode) {
      const { error } = await supabase.from("events").insert([editFormData]);
      if (!error) {
        fetchEvents(); 
        setEditingId(null);
        setIsDuplicateMode(false);
        alert("New event created successfully!");
      } else alert("Error saving: " + error.message);
    } else {
      const { error } = await supabase.from("events").update({ ...editFormData, is_approved: true }).eq("id", id);
      if (!error) {
        setAllEvents(allEvents.map(e => e.id === id ? { ...editFormData, is_approved: true } : e));
        setEditingId(null);
        alert("Changes saved!");
      } else alert("Error saving: " + error.message);
    }
  }

  // --- NEW: AI GENERATOR ---
  async function handleAIGenerate() {
    if (!aiText) return alert("Please paste some text first!");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/parse-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      });

      const result = await response.json();

      if (response.ok) {
        // Open a blank new edit form and stuff the AI data into it!
        setEditingId("ai_new_event");
        setIsDuplicateMode(true);
        setEditFormData({
          ...result.data,
          is_approved: true
        });
        setAiText(""); // Clear the input box
      } else {
        alert("AI Error: " + result.error);
      }
    } catch (error: any) {
      alert("Failed to reach AI: " + error.message);
    }
    
    setIsAiLoading(false);
  }

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-neon-cyan mb-2">Admin Dashboard</h1>
      <p className="text-foreground/70 mb-8">Manage submissions, live events, and sponsorships.</p>

      {/* --- NEW: AI IMPORT BOX --- */}
      <div className="bg-desert-orange/10 border border-desert-orange/30 p-6 rounded-2xl mb-8 shadow-lg">
        <h2 className="text-lg font-bold text-desert-orange mb-2 flex items-center gap-2">
          <span>✨</span> Magic AI Importer
        </h2>
        <p className="text-sm text-foreground/70 mb-4">Paste messy text from a Facebook post or flyer. The AI will extract the details and prepare a new event for you to review.</p>
        <textarea 
          rows={3} 
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          placeholder="e.g. Live band tonight at River Grill! $10 cover starts at 8pm..."
          className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-desert-orange mb-4"
        ></textarea>
        <button 
          onClick={handleAIGenerate}
          disabled={isAiLoading}
          className="bg-desert-orange hover:bg-desert-pink text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg disabled:opacity-50"
        >
          {isAiLoading ? "Thinking..." : "Generate Event"}
        </button>
      </div>

      <div className="flex gap-4 mb-8 border-b border-surface-border pb-4">
        <button 
          onClick={() => setActiveTab("pending")}
          className={`font-bold pb-2 px-2 transition-colors ${activeTab === "pending" ? "text-desert-orange border-b-2 border-desert-orange" : "text-foreground/50 hover:text-foreground"}`}
        >
          Pending ({pendingEvents.length})
        </button>
        <button 
          onClick={() => setActiveTab("live")}
          className={`font-bold pb-2 px-2 transition-colors ${activeTab === "live" ? "text-neon-cyan border-b-2 border-neon-cyan" : "text-foreground/50 hover:text-foreground"}`}
        >
          Live Events ({liveEvents.length})
        </button>
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : displayedEvents.length === 0 && editingId !== "ai_new_event" ? (
        <div className="bg-surface border border-surface-border p-8 rounded-xl text-center text-foreground/50">
          No events found in this tab.
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* SPECIAL AI PREVIEW CARD */}
          {editingId === "ai_new_event" && (
            <div className="bg-surface border border-desert-orange rounded-xl p-6 flex flex-col gap-6 shadow-[0_0_15px_rgba(255,107,53,0.2)]">
              <h3 className="text-desert-orange font-bold uppercase text-sm">✨ Review AI Generated Event</h3>
              <div className="space-y-4 bg-background/50 p-4 rounded-lg border border-surface-border">
                
                <div>
                  <label className="text-xs text-foreground/50 font-bold uppercase">Title</label>
                  <input name="title" value={editFormData.title || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-foreground/50 font-bold uppercase">Date</label>
                    <input type="date" name="date" value={editFormData.date || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/50 font-bold uppercase">Start</label>
                    <input type="time" name="start_time" value={editFormData.start_time || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/50 font-bold uppercase">End</label>
                    <input type="time" name="end_time" value={editFormData.end_time || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-foreground/50 font-bold uppercase">Category</label>
                    <select name="category" value={editFormData.category || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none">
                      <option value="Live Music">Live Music</option>
                      <option value="Nightlife">Nightlife</option>
                      <option value="Food & Drink">Food & Drink</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Community">Community</option>
                      <option value="Family">Family</option>
                      <option value="Outdoor & River">Outdoor & River</option>
                      <option value="Pets & Animals">Pets & Animals</option>
                      <option value="Classes & Workshops">Classes & Workshops</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-foreground/50 font-bold uppercase">City</label>
                    <select name="city" value={editFormData.city || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none">
                      <option value="Fort Mohave">Fort Mohave</option>
                      <option value="Bullhead City">Bullhead City</option>
                      <option value="Laughlin">Laughlin</option>
                      <option value="Needles">Needles</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                    <label className="text-xs text-foreground/50 font-bold uppercase">Venue Name</label>
                    <input name="venue_name" value={editFormData.venue_name || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/50 font-bold uppercase">Address</label>
                    <input name="address" value={editFormData.address || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/50 font-bold uppercase">Zip Code</label>
                    <input name="zip_code" value={editFormData.zip_code || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-foreground/50 font-bold uppercase">Ticket/Info Link</label>
                    <input name="ticket_link" type="url" value={editFormData.ticket_link || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/50 font-bold uppercase">Image URL (Optional)</label>
                    <input name="image_url" type="text" placeholder="Upload via Supabase and paste link, or leave blank" value={editFormData.image_url || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-xs text-foreground/50 focus:border-desert-orange outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-foreground/50 font-bold uppercase">Description</label>
                  <textarea name="description" rows={4} value={editFormData.description || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none"></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => handleSave(event.id)} className="flex-1 bg-desert-orange hover:bg-desert-pink text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    Save as New Event
                  </button>
                  <button onClick={() => {setEditingId(null); setIsDuplicateMode(false);}} className="flex-1 bg-surface-border hover:bg-surface-border/80 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    Discard
                  </button>
                </div>
              </div>
            </div>
          )}

          {displayedEvents.map((event) => {
            const isEditing = editingId === event.id;

            return (
              <div key={event.id} className={`bg-surface border ${event.is_featured ? 'border-desert-pink shadow-desert-pink/20' : 'border-surface-border'} rounded-xl p-6 flex flex-col md:flex-row gap-6 shadow-lg relative`}>
                
                {event.is_featured && (
                  <div className="absolute -top-3 -right-3 bg-desert-pink text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                    ★ PINNED
                  </div>
                )}

                <div className="flex-1 space-y-4">
                  {isEditing ? (
                    <div className="space-y-4 bg-background/50 p-4 rounded-lg border border-surface-border">
                      <div>
                        <label className="text-xs text-foreground/50 font-bold uppercase">Title</label>
                        <input name="title" value={editFormData.title || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-foreground/50 font-bold uppercase">Date</label>
                          <input type="date" name="date" value={editFormData.date || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-foreground/50 font-bold uppercase">Start</label>
                          <input type="time" name="start_time" value={editFormData.start_time || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-foreground/50 font-bold uppercase">End</label>
                          <input type="time" name="end_time" value={editFormData.end_time || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-foreground/50 font-bold uppercase">Category</label>
                          <select name="category" value={editFormData.category || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none">
                            <option value="Live Music">Live Music</option>
                            <option value="Nightlife">Nightlife</option>
                            <option value="Food & Drink">Food & Drink</option>
                            <option value="Comedy">Comedy</option>
                            <option value="Community">Community</option>
                            <option value="Family">Family</option>
                            <option value="Outdoor & River">Outdoor & River</option>
                            <option value="Pets & Animals">Pets & Animals</option>
                            <option value="Classes & Workshops">Classes & Workshops</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-foreground/50 font-bold uppercase">City</label>
                          <select name="city" value={editFormData.city || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none">
                            <option value="Fort Mohave">Fort Mohave</option>
                            <option value="Bullhead City">Bullhead City</option>
                            <option value="Laughlin">Laughlin</option>
                            <option value="Needles">Needles</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                         <div>
                          <label className="text-xs text-foreground/50 font-bold uppercase">Venue Name</label>
                          <input name="venue_name" value={editFormData.venue_name || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-foreground/50 font-bold uppercase">Address</label>
                          <input name="address" value={editFormData.address || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-foreground/50 font-bold uppercase">Zip Code</label>
                          <input name="zip_code" value={editFormData.zip_code || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-foreground/50 font-bold uppercase">Ticket/Info Link</label>
                          <input name="ticket_link" type="url" value={editFormData.ticket_link || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-foreground/50 font-bold uppercase">Image URL</label>
                          <input name="image_url" type="text" value={editFormData.image_url || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-xs text-foreground/50 focus:border-desert-orange outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-foreground/50 font-bold uppercase">Description</label>
                        <textarea name="description" rows={3} value={editFormData.description || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none"></textarea>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-3 items-center mb-1">
                        <span className="bg-desert-orange/20 text-desert-orange text-xs font-bold px-2 py-1 rounded">
                          {event.category}
                        </span>
                        <span className="text-foreground/50 text-sm">{event.city}</span>
                      </div>
                      <h3 className="text-2xl font-bold">{event.title}</h3>
                      <p className="text-sm text-foreground/70 line-clamp-3">{event.description}</p>
                      <div className="text-xs text-foreground/50 pt-2 border-t border-surface-border mt-2">
                        <p><strong>Venue:</strong> {event.venue_name} ({event.address}, {event.zip_code})</p>
                        <p><strong>Date/Time:</strong> {event.date} | {event.start_time.slice(0,5)} {event.end_time ? `- ${event.end_time.slice(0,5)}` : ""}</p>
                        {event.ticket_link && <p><strong>Link:</strong> <a href={event.ticket_link} target="_blank" className="text-desert-orange hover:underline">{event.ticket_link}</a></p>}
                        <p><strong>Submitter:</strong> {event.submitter_info || 'None provided'}</p>
                      </div>
                    </>
                  )}
                </div>

                {event.image_url && !isEditing && (
                  <div className="w-full md:w-32 h-40 shrink-0 bg-black rounded-lg overflow-hidden border border-surface-border">
                    <img src={event.image_url} className="w-full h-full object-cover" alt="Flyer" />
                  </div>
                )}

                <div className="flex md:flex-col gap-3 shrink-0 justify-center min-w-[140px]">
                  {isEditing ? (
                    <>
                      <button onClick={() => handleSave(event.id)} className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold py-2 px-4 rounded-lg transition-colors w-full">
                        {isDuplicateMode ? "Save as New Event" : "Save Changes"}
                      </button>
                      <button onClick={() => {setEditingId(null); setIsDuplicateMode(false);}} className="bg-surface-border hover:bg-surface-border/80 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full">
                        Cancel
                      </button>
                    </>
                  ) : activeTab === "pending" ? (
                    <>
                      <button onClick={() => handleApprove(event.id)} className="bg-neon-cyan/10 hover:bg-neon-cyan text-neon-cyan hover:text-black font-bold py-2 px-4 rounded-lg transition-colors border border-neon-cyan w-full">Approve</button>
                      <button onClick={() => startEditing(event)} className="bg-surface-border/50 hover:bg-surface-border text-foreground font-bold py-2 px-4 rounded-lg transition-colors w-full">Edit</button>
                      <button onClick={() => handleDelete(event.id)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold py-2 px-4 rounded-lg transition-colors border border-red-500/50 w-full">Reject</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleDuplicate(event)} className="bg-neon-cyan/20 hover:bg-neon-cyan text-neon-cyan hover:text-black font-bold py-2 px-4 rounded-lg transition-colors border border-neon-cyan w-full">
                        Duplicate
                      </button>
                      <button onClick={() => handleToggleFeature(event.id, event.is_featured)} className={`${event.is_featured ? 'bg-surface-border text-foreground' : 'bg-desert-pink hover:bg-desert-pink/80 text-white'} font-bold py-2 px-4 rounded-lg transition-colors shadow-lg w-full`}>
                        {event.is_featured ? "Unpin Event" : "Pin (Sponsored)"}
                      </button>
                      <button onClick={() => startEditing(event)} className="bg-surface-border/50 hover:bg-surface-border text-foreground font-bold py-2 px-4 rounded-lg transition-colors w-full">Edit</button>
                      <button onClick={() => handleUnpublish(event.id)} className="bg-desert-orange/10 hover:bg-desert-orange text-desert-orange hover:text-white font-bold py-2 px-4 rounded-lg transition-colors border border-desert-orange/50 w-full">Unpublish</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}