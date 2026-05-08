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

  async function fetchEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAllEvents(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const pendingEvents = allEvents.filter(e => !e.is_approved);
  const liveEvents = allEvents.filter(e => e.is_approved);
  const displayedEvents = activeTab === "pending" ? pendingEvents : liveEvents;

  // Actions
  async function handleApprove(id: string) {
    const { error } = await supabase.from("events").update({ is_approved: true }).eq("id", id);
    if (!error) setAllEvents(allEvents.map(e => e.id === id ? { ...e, is_approved: true } : e));
  }

  async function handleUnpublish(id: string) {
    // If we unpublish, we should probably un-feature it too just in case!
    const { error } = await supabase.from("events").update({ is_approved: false, is_featured: false }).eq("id", id);
    if (!error) setAllEvents(allEvents.map(e => e.id === id ? { ...e, is_approved: false, is_featured: false } : e));
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to permanently delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) setAllEvents(allEvents.filter(e => e.id !== id));
  }

  // NEW: Pin/Unpin Sponsored Events
  async function handleToggleFeature(id: string, currentStatus: boolean) {
    const { error } = await supabase.from("events").update({ is_featured: !currentStatus }).eq("id", id);
    if (!error) setAllEvents(allEvents.map(e => e.id === id ? { ...e, is_featured: !currentStatus } : e));
  }
  // NEW: Duplicate Event Function
  function handleDuplicate(event: any) {
    const { id, created_at, ...duplicatedData } = event; 
    setEditingId(event.id); // Open the form on the card they clicked
    setIsDuplicateMode(true); // Tell the app we are making a copy
    setEditFormData({ ...duplicatedData, is_approved: true }); 
  }
  // Normal Edit Function
  function startEditing(event: any) {
    setEditingId(event.id);
    setIsDuplicateMode(false); // Tell the app this is a normal edit
    setEditFormData({ ...event });
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  }

  // Save Function
  async function handleSave(id: string) {
    if (isDuplicateMode) {
      // It's a duplicate, so INSERT a new row
      const { error } = await supabase.from("events").insert([editFormData]);
      if (!error) {
        fetchEvents(); 
        setEditingId(null);
        setIsDuplicateMode(false);
        alert("Event duplicated successfully!");
      } else alert("Error duplicating: " + error.message);
    } else {
      // It's a normal edit, so UPDATE the existing row
      const { error } = await supabase.from("events").update({ ...editFormData, is_approved: true }).eq("id", id);
      if (!error) {
        setAllEvents(allEvents.map(e => e.id === id ? { ...editFormData, is_approved: true } : e));
        setEditingId(null);
        alert("Changes saved!");
      } else alert("Error saving: " + error.message);
    }
  }

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-neon-cyan mb-2">Admin Dashboard</h1>
      <p className="text-foreground/70 mb-8">Manage submissions, live events, and sponsorships.</p>

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
      ) : displayedEvents.length === 0 ? (
        <div className="bg-surface border border-surface-border p-8 rounded-xl text-center text-foreground/50">
          No events found in this tab.
        </div>
      ) : (
        <div className="space-y-6">
          {displayedEvents.map((event) => {
            const isEditing = editingId === event.id;

            return (
              <div key={event.id} className={`bg-surface border ${event.is_featured ? 'border-desert-pink shadow-desert-pink/20' : 'border-surface-border'} rounded-xl p-6 flex flex-col md:flex-row gap-6 shadow-lg relative`}>
                
                {/* Visual Indicator on Admin Dashboard */}
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
                          <label className="text-xs text-foreground/50 font-bold uppercase">Venue Name</label>
                          <input name="venue_name" value={editFormData.venue_name || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-foreground/50 font-bold uppercase">Address</label>
                          <input name="address" value={editFormData.address || ""} onChange={handleFormChange} className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange outline-none" />
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
                      <button onClick={() => { setEditingId(null); setIsDuplicateMode(false); }} className="bg-surface-border hover:bg-surface-border/80 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full">
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
                      {/* NEW: DUPLICATE BUTTON */}
                      <button onClick={() => handleDuplicate(event)} className="bg-neon-cyan/20 hover:bg-neon-cyan text-neon-cyan hover:text-black font-bold py-2 px-4 rounded-lg transition-colors border border-neon-cyan w-full">
                        Duplicate
                      </button>

                      {/* PIN BUTTON */}
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