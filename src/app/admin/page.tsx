"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminDashboard() {
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [allDeals, setAllDeals] = useState<any[]>([]); // NEW: Deals State
  const [loading, setLoading] = useState(true);
  
  // Tabs: added 'deals'
  const [activeTab, setActiveTab] = useState<"pending" | "live" | "chatter" | "deals">("pending");
  
  // Event Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);
  
  // Deals Edit State
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [editDealData, setEditDealData] = useState<any>({});
  const [isAddingDeal, setIsAddingDeal] = useState(false);

  // Other State
  const [aiText, setAiText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);

  async function fetchDashboardData() {
    setLoading(true);
    const { data: events } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    if (events) setAllEvents(events);

    const { count } = await supabase.from("subscribers").select("*", { count: 'exact', head: true });
    if (count !== null) setSubscriberCount(count);

    const { data: comments } = await supabase.from("comments").select("*, events(title), profiles(username)").order("created_at", { ascending: false });
    if (comments) setAllComments(comments);

    // Fetch Deals
    const { data: deals } = await supabase.from("deals").select("*").order("created_at", { ascending: false });
    if (deals) setAllDeals(deals);

    setLoading(false);
  }

  useEffect(() => { fetchDashboardData(); }, []);

  const pendingEvents = allEvents.filter(e => !e.is_approved);
  const liveEvents = allEvents.filter(e => e.is_approved);
  const displayedEvents = activeTab === "pending" ? pendingEvents : liveEvents;

  // ==========================================
  // DEALS LOGIC
  // ==========================================
  function handleDealChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setEditDealData({ ...editDealData, [e.target.name]: e.target.value });
  }

  async function handleDealImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `deal_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from("flyers").upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from("flyers").getPublicUrl(fileName);
      setEditDealData({ ...editDealData, image_url: data.publicUrl });
    }
    setIsUploading(false);
  }

  async function handleSaveDeal() {
    // Add safety fallbacks so the database NEVER crashes on a blank box!
    const dealPayload = { 
      ...editDealData, 
      is_approved: true,
      description: editDealData.description || " ", // Fallback to an empty space
      business_name: editDealData.business_name || "Unknown Business",
      deal_title: editDealData.deal_title || "Special Deal",
      city: editDealData.city || "Fort Mohave",
      address: editDealData.address || " ",
      category: editDealData.category || "Food & Drink"
    }; // Deals are auto-approved since Admin makes them
    
    if (isAddingDeal) {
      const { error } = await supabase.from("deals").insert([dealPayload]);
      if (!error) {
        fetchDashboardData();
        setIsAddingDeal(false);
        setEditDealData({});
        alert("Deal published!");
      } else alert("Error: " + error.message);
    } else {
      const { error } = await supabase.from("deals").update(dealPayload).eq("id", editingDealId);
      if (!error) {
        fetchDashboardData();
        setEditingDealId(null);
        setEditDealData({});
        alert("Deal updated!");
      } else alert("Error: " + error.message);
    }
  }

  async function handleDeleteDeal(id: string) {
    if (!window.confirm("Delete this deal?")) return;
    await supabase.from("deals").delete().eq("id", id);
    fetchDashboardData();
  }

  async function handleToggleDealLive(id: string, currentStatus: boolean) {
    await supabase.from("deals").update({ is_approved: !currentStatus }).eq("id", id);
    fetchDashboardData();
  }

  async function handleToggleDealFeature(id: string, currentStatus: boolean) {
    await supabase.from("deals").update({ is_featured: !currentStatus }).eq("id", id);
    fetchDashboardData();
  }

  // ==========================================
  // EVENTS & COMMENTS LOGIC
  // ==========================================
  async function handleDeleteComment(commentId: string) {
    if (!window.confirm("Nuke this comment?")) return;
    await supabase.from("comments").delete().eq("id", commentId);
    fetchDashboardData();
  }

  async function handleApprove(id: string) {
    await supabase.from("events").update({ is_approved: true }).eq("id", id);
    fetchDashboardData();
  }

  async function handleUnpublish(id: string) {
    await supabase.from("events").update({ is_approved: false, is_featured: false }).eq("id", id);
    fetchDashboardData();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Permanently delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    fetchDashboardData();
  }

  async function handleToggleFeature(id: string, currentStatus: boolean) {
    await supabase.from("events").update({ is_featured: !currentStatus }).eq("id", id);
    fetchDashboardData();
  }

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

  async function handleAdminImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from("flyers").upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from("flyers").getPublicUrl(fileName);
      setEditFormData({ ...editFormData, image_url: data.publicUrl });
    }
    setIsUploading(false);
  }

  async function handleSave(id?: string) {
    const targetId = id || editingId; 
    if (isDuplicateMode) {
      const { error } = await supabase.from("events").insert([editFormData]);
      if (!error) {
        fetchDashboardData(); 
        setEditingId(null);
        setIsDuplicateMode(false);
        alert("New event created successfully!");
      } else alert("Error saving: " + error.message);
    } else {
      if (!targetId) return; 
      const { error } = await supabase.from("events").update({ ...editFormData, is_approved: true }).eq("id", targetId);
      if (!error) {
        fetchDashboardData();
        setEditingId(null);
        alert("Changes saved!");
      } else alert("Error saving: " + error.message);
    }
  }

  async function handleAIGenerate() {
    if (!aiText) return alert("Please paste text or a URL first!");
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/parse-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      });
      const result = await response.json();
      if (response.ok && result.data.length > 0) {
        const eventsToInsert = result.data.map((event: any) => ({
          ...event,
          is_approved: false,
          start_time: event.start_time && event.start_time !== "" ? event.start_time : "12:00", 
          end_time: event.end_time && event.end_time !== "" ? event.end_time : null,
          title: event.title || "Unknown Event Title",
          date: event.date || new Date().toISOString().split("T")[0],
        }));
        await supabase.from("events").insert(eventsToInsert);
        setAiText(""); 
        setActiveTab("pending"); 
        fetchDashboardData(); 
        alert(`Success! Imported ${eventsToInsert.length} event(s) into Pending.`);
      } else alert("AI Error: Could not find any events. " + (result.error || ""));
    } catch (error: any) { alert("Failed to reach AI: " + error.message); }
    setIsAiLoading(false);
  }

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neon-cyan mb-2">Admin Dashboard</h1>
          <p className="text-foreground/70">Manage submissions, live events, and sponsorships.</p>
        </div>
        <div className="bg-surface border border-surface-border px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <span className="text-2xl">📬</span>
          <div>
            <p className="text-xs text-foreground/50 font-bold uppercase tracking-wider">Total Subs</p>
            <p className="text-2xl font-black text-foreground">{subscriberCount}</p>
          </div>
        </div>
      </div>

      {/* AI IMPORTER */}
      <div className="bg-desert-orange/10 border border-desert-orange/30 p-6 rounded-2xl mb-8 shadow-lg">
        <h2 className="text-lg font-bold text-desert-orange mb-2 flex items-center gap-2">
          <span>✨</span> Magic AI Importer
        </h2>
        <textarea rows={2} value={aiText} onChange={(e) => setAiText(e.target.value)} placeholder="e.g. https://www.avicasino.com/entertainment" className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-desert-orange mb-4"></textarea>
        <button onClick={handleAIGenerate} disabled={isAiLoading} className="bg-desert-orange hover:bg-desert-pink text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg disabled:opacity-50">
          {isAiLoading ? "Scanning URL..." : "Generate Event(s)"}
        </button>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto gap-4 mb-8 border-b border-surface-border pb-4">
        <button onClick={() => setActiveTab("pending")} className={`font-bold pb-2 px-2 transition-colors whitespace-nowrap ${activeTab === "pending" ? "text-desert-orange border-b-2 border-desert-orange" : "text-foreground/50 hover:text-foreground"}`}>
          Pending Events ({pendingEvents.length})
        </button>
        <button onClick={() => setActiveTab("live")} className={`font-bold pb-2 px-2 transition-colors whitespace-nowrap ${activeTab === "live" ? "text-neon-cyan border-b-2 border-neon-cyan" : "text-foreground/50 hover:text-foreground"}`}>
          Live Events ({liveEvents.length})
        </button>
        <button onClick={() => setActiveTab("deals")} className={`font-bold pb-2 px-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "deals" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-foreground/50 hover:text-foreground"}`}>
          🍔 Local Deals ({allDeals.length})
        </button>
        <button onClick={() => setActiveTab("chatter")} className={`font-bold pb-2 px-2 transition-colors whitespace-nowrap ${activeTab === "chatter" ? "text-desert-pink border-b-2 border-desert-pink" : "text-foreground/50 hover:text-foreground"}`}>
          Chatter ({allComments.length})
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : activeTab === "chatter" ? (
        // --- CHATTER TAB ---
        <div className="space-y-4">
          {allComments.length === 0 ? <p className="text-foreground/50">No comments yet.</p> : allComments.map(comment => (
              <div key={comment.id} className="bg-surface border border-surface-border rounded-xl p-6 shadow-lg flex flex-col md:flex-row gap-4 justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-neon-cyan">{comment.profiles?.username || "Unknown"}</span>
                    <span className="text-foreground/40 text-xs">on</span>
                    <Link href={`/events/${comment.event_id}`} className="text-desert-orange hover:underline text-xs font-bold bg-desert-orange/10 px-2 py-1 rounded">
                      {comment.events?.title || "Deleted Event"}
                    </Link>
                  </div>
                  <p className="text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
                </div>
                <button onClick={() => handleDeleteComment(comment.id)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold py-2 px-4 rounded transition-colors">Nuke</button>
              </div>
          ))}
        </div>
      ) : activeTab === "deals" ? (
        // --- DEALS TAB ---
        <div className="space-y-6">
          
          <button onClick={() => { setIsAddingDeal(true); setEditDealData({}); setEditingDealId(null); }} className="w-full bg-yellow-400/10 border-2 border-dashed border-yellow-400/50 hover:border-yellow-400 text-yellow-400 font-bold py-6 rounded-xl transition-colors">
            + Add New Local Deal
          </button>

          {(isAddingDeal || editingDealId) && (
            <div className="bg-surface border border-yellow-400 rounded-xl p-6 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
              <h3 className="text-yellow-400 font-bold uppercase text-sm mb-4">{isAddingDeal ? "Create New Deal" : "Edit Deal"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground/50 font-bold uppercase">Business / Restaurant Name</label>
                  <input name="business_name" value={editDealData.business_name || ""} onChange={handleDealChange} className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm focus:border-yellow-400 outline-none" placeholder="e.g. River City Grill" />
                </div>
                <div>
                  <label className="text-xs text-foreground/50 font-bold uppercase">Deal Title</label>
                  <input name="deal_title" value={editDealData.deal_title || ""} onChange={handleDealChange} className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm focus:border-yellow-400 outline-none" placeholder="e.g. $5 Margaritas All Day" />
                </div>
                <div>
                  <label className="text-xs text-foreground/50 font-bold uppercase">Category</label>
                  <select name="category" value={editDealData.category || ""} onChange={handleDealChange} className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm focus:border-yellow-400 outline-none">
                    <option value="">Select...</option>
                    <option value="Food & Drink">Food & Drink</option>
                    <option value="Happy Hour">Happy Hour</option>
                    <option value="Retail">Retail</option>
                    <option value="Activity">Activity / Entertainment</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-foreground/50 font-bold uppercase">Expiration Date (Optional)</label>
                  <input type="date" name="expiration_date" value={editDealData.expiration_date || ""} onChange={handleDealChange} className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm focus:border-yellow-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-foreground/50 font-bold uppercase">City</label>
                  <select name="city" value={editDealData.city || ""} onChange={handleDealChange} className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm focus:border-yellow-400 outline-none">
                    <option value="">Select...</option>
                    <option value="Fort Mohave">Fort Mohave</option>
                    <option value="Bullhead City">Bullhead City</option>
                    <option value="Laughlin">Laughlin</option>
                    <option value="Needles">Needles</option>
                    <option value="Mohave Valley">Mohave Valley</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-foreground/50 font-bold uppercase">Address</label>
                  <input name="address" value={editDealData.address || ""} onChange={handleDealChange} className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm focus:border-yellow-400 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-foreground/50 font-bold uppercase">Description</label>
                  <textarea name="description" rows={3} value={editDealData.description || ""} onChange={handleDealChange} className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm focus:border-yellow-400 outline-none"></textarea>
                </div>
                <div>
                  <label className="text-xs text-foreground/50 font-bold uppercase">Fine Print (Optional)</label>
                  <input name="fine_print" placeholder="e.g. Dine-in only. Expires 12/31." value={editDealData.fine_print || ""} onChange={handleDealChange} className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm focus:border-yellow-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-foreground/50 font-bold uppercase">Promo Image / Logo</label>
                  <div className="flex gap-2 mt-1">
                    <input name="image_url" type="text" placeholder="URL..." value={editDealData.image_url || ""} onChange={handleDealChange} className="flex-1 bg-background border border-surface-border rounded px-3 py-2 text-xs focus:border-yellow-400 outline-none" />
                    <label className="bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold py-2 px-4 rounded cursor-pointer transition-colors flex items-center shrink-0">
                      {isUploading ? "..." : "Upload"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleDealImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={handleSaveDeal} className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg transition-colors">Save Deal</button>
                <button onClick={() => {setIsAddingDeal(false); setEditingDealId(null);}} className="flex-1 bg-surface-border text-white font-bold py-3 px-4 rounded-lg transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {allDeals.map(deal => (
            <div key={deal.id} className={`bg-surface border ${deal.is_featured ? 'border-yellow-400' : 'border-surface-border'} rounded-xl p-4 flex gap-4 items-center`}>
              {deal.image_url ? (
                <img src={deal.image_url} alt="Promo" className="w-16 h-16 rounded object-cover bg-black" />
              ) : (
                <div className="w-16 h-16 rounded bg-surface-border flex items-center justify-center text-xl">🍔</div>
              )}
              <div className="flex-1">
                <div className="flex gap-2 items-center mb-1">
                  <span className={`w-2 h-2 rounded-full ${deal.is_approved ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <p className="text-xs font-bold text-foreground/50">{deal.is_approved ? 'LIVE' : 'HIDDEN'}</p>
                </div>
                <h3 className="font-bold text-lg">{deal.deal_title}</h3>
                <p className="text-sm text-foreground/70">{deal.business_name} | {deal.city}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => handleToggleDealLive(deal.id, deal.is_approved)} className="text-xs font-bold bg-surface-border px-3 py-1 rounded hover:text-white">
                  {deal.is_approved ? 'Hide' : 'Make Live'}
                </button>
                <button onClick={() => handleToggleDealFeature(deal.id, deal.is_featured)} className={`text-xs font-bold px-3 py-1 rounded ${deal.is_featured ? 'bg-yellow-400 text-black' : 'bg-surface-border text-foreground/50 hover:text-yellow-400'}`}>
                  {deal.is_featured ? 'Unpin' : 'Pin Deal'}
                </button>
                <button onClick={() => { setEditingDealId(deal.id); setEditDealData(deal); setIsAddingDeal(false); }} className="text-xs font-bold bg-surface-border px-3 py-1 rounded hover:text-white">Edit</button>
                <button onClick={() => handleDeleteDeal(deal.id)} className="text-xs font-bold text-red-500 hover:bg-red-500/10 px-3 py-1 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : displayedEvents.length === 0 && editingId !== "ai_new_event" ? (
        <div className="bg-surface border border-surface-border p-8 rounded-xl text-center text-foreground/50">No events found in this tab.</div>
      ) : (
        // --- EVENTS TABS (Pending / Live) ---
        <div className="space-y-6">
          {editingId === "ai_new_event" && (
            <div className="bg-surface border border-desert-orange rounded-xl p-6 shadow-lg">
              <h3 className="text-desert-orange font-bold uppercase text-sm mb-4">✨ Review AI Event</h3>
              <div className="space-y-4">
                <input name="title" value={editFormData.title || ""} onChange={handleFormChange} className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm focus:border-desert-orange" />
                <div className="flex gap-4 pt-4">
                  <button onClick={() => handleSave("new")} className="flex-1 bg-desert-orange text-white font-bold py-3 rounded-lg">Save Event</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 bg-surface-border text-white font-bold py-3 rounded-lg">Discard</button>
                </div>
              </div>
            </div>
          )}
          {displayedEvents.map(event => {
            const isEditing = editingId === event.id;
            return (
              <div key={event.id} className="bg-surface border border-surface-border rounded-xl p-6 flex flex-col md:flex-row gap-6 shadow-lg">
                <div className="flex-1 space-y-2">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input name="title" value={editFormData.title || ""} onChange={handleFormChange} className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm" />
                      <button onClick={(e) => { e.preventDefault(); handleSave(event.id); }} className="bg-neon-cyan text-black font-bold py-2 px-4 rounded w-full">Save Changes</button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold">{event.title}</h3>
                      <p className="text-sm text-foreground/70">{event.date} | {event.venue_name}</p>
                    </>
                  )}
                </div>
                <div className="flex md:flex-col gap-2 shrink-0 min-w-[140px]">
                  {!isEditing && activeTab === "pending" && <button onClick={() => handleApprove(event.id)} className="bg-neon-cyan/10 text-neon-cyan font-bold py-2 px-4 rounded border border-neon-cyan">Approve</button>}
                  {!isEditing && activeTab === "live" && <button onClick={() => handleUnpublish(event.id)} className="bg-desert-orange/10 text-desert-orange font-bold py-2 px-4 rounded border border-desert-orange/50">Unpublish</button>}
                  {!isEditing && <button onClick={() => startEditing(event)} className="bg-surface-border/50 font-bold py-2 px-4 rounded">Edit</button>}
                  {!isEditing && <button onClick={() => handleDelete(event.id)} className="text-red-500 font-bold py-2 px-4 rounded">Delete</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}