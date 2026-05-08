"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SubmitEvent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    let imageUrl = null;
    const flyerFile = formData.get("flyer") as File;

    // 1. Upload Flyer (if attached)
    if (flyerFile && flyerFile.size > 0) {
      const fileExt = flyerFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("flyers").upload(fileName, flyerFile);
      if (uploadError) {
        alert("Failed to upload image: " + uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("flyers").getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    // 2. Setup the Base Event Data (Everything EXCEPT the date)
    const baseEvent = {
      title: formData.get("title"),
      start_time: formData.get("start_time"),
      end_time: formData.get("end_time") || null, // Safely handles empty end times
      city: formData.get("city"),
      category: formData.get("category"),
      description: formData.get("description"),
      submitter_info: formData.get("submitter_info"),
      venue_name: formData.get("venue_name"),
      address: formData.get("address"),
      zip_code: formData.get("zip_code"),
      image_url: imageUrl,
    };

    // 3. --- AUTOMATED REPEAT MAGIC LOGIC ---
    const weeksToRepeat = parseInt(formData.get("repeat_weeks") as string) || 1;
    const startDateString = formData.get("date") as string;
    
    // We split the date manually so JavaScript timezone bugs don't shift it backward a day!
    const [year, month, day] = startDateString.split("-").map(Number);
    
    const eventsToInsert = [];

    // Loop X amount of times based on the dropdown
    for (let i = 0; i < weeksToRepeat; i++) {
      const nextDate = new Date(year, month - 1, day + (i * 7)); // Adds 7 days per loop
      
      // Format it back to YYYY-MM-DD for Supabase
      const formattedDate = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;

      eventsToInsert.push({
        ...baseEvent,
        date: formattedDate,
      });
    }

    // 4. Send the ENTIRE array to Supabase in one shot!
    const { error } = await supabase.from("events").insert(eventsToInsert);

    if (error) {
      alert("Something went wrong: " + error.message);
    } else {
      setSuccess(true);
      form.reset(); 
    }
    
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-3xl mx-auto">
      <h1 className="text-4xl font-extrabold text-sunset mb-2">Submit an Event</h1>
      <p className="text-foreground/70 mb-8">
        Hosting something cool in the tri-state area? Let the community know. 
      </p>

      <form onSubmit={handleSubmit} className="bg-surface border border-surface-border p-6 md:p-8 rounded-2xl space-y-6 shadow-xl">
        
        <div className="border-2 border-dashed border-surface-border rounded-xl p-6 text-center bg-background/50 hover:border-desert-pink transition-colors">
          <label className="block text-base font-medium mb-2 cursor-pointer">
            <span className="text-desert-orange font-bold">Click to upload an Event Flyer</span> (Optional)
            <input name="flyer" type="file" accept="image/*" className="block w-full text-base mt-4 text-foreground/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-base file:font-semibold file:bg-desert-orange file:text-white hover:file:bg-desert-pink cursor-pointer" />
          </label>
        </div>

        <div>
          <label className="block text-base font-medium mb-2 text-foreground/90">Event Title *</label>
          <input required name="title" type="text" placeholder="e.g. Taco Tuesday at River Grill" className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-desert-orange" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-base font-medium mb-2">Start Date *</label>
            <input required name="date" type="date" className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange" />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Start Time *</label>
            <input required name="start_time" type="time" className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange" />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">End Time</label>
            <input name="end_time" type="time" className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange" />
          </div>
        </div>

        {/* --- NEW: RECURRING DROPDOWN --- */}
        <div className="bg-desert-orange/5 border border-desert-orange/20 p-4 rounded-lg">
          <label className="block text-base font-bold text-desert-orange mb-2">Does this event repeat weekly?</label>
          <select name="repeat_weeks" className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange cursor-pointer">
            <option value="1">No, it happens just this once.</option>
            <option value="4">Yes, repeat weekly for 4 weeks (1 month)</option>
            <option value="8">Yes, repeat weekly for 8 weeks (2 months)</option>
            <option value="12">Yes, repeat weekly for 12 weeks (3 months)</option>
          </select>
          <p className="text-sm text-foreground/50 mt-2">Selecting a repeat option will automatically create future events at the exact same time and location.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium mb-2">City *</label>
            <select required name="city" className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange cursor-pointer">
              <option value="">Select a city...</option>
              <option value="Fort Mohave">Fort Mohave</option>
              <option value="Bullhead City">Bullhead City</option>
              <option value="Laughlin">Laughlin</option>
              <option value="Needles">Needles</option>
            </select>
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Category *</label>
            <select required name="category" className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange cursor-pointer">
              <option value="">Select a category...</option>
              <option value="Live Music">Live Music</option>
              <option value="Nightlife">Nightlife</option>
              <option value="Food & Drink">Food & Drink</option>
              <option value="Community">Community</option>
              <option value="Family">Family</option>
              <option value="Outdoor & River">Outdoor & River</option>
              <option value="Pets & Animals">Pets & Animals</option>
              <option value="Classes & Workshops">Classes & Workshops</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-base font-medium mb-2">Venue Name *</label>
            <input required name="venue_name" type="text" placeholder="e.g. River City Grill" className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange" />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Street Address *</label>
            <input required name="address" type="text" placeholder="e.g. 1234 Riverfront Dr" className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange" />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Zip Code *</label>
            <input required name="zip_code" type="text" placeholder="e.g. 86426" className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange" />
          </div>
        </div>

        <div>
          <label className="block text-base font-medium mb-2">Description *</label>
          <textarea required name="description" rows={4} className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange"></textarea>
        </div>

        <div>
          <label className="block text-base font-medium mb-2">
            Your Email/Phone <span className="text-foreground/50 text-sm font-normal ml-2">(Hidden from public)</span>
          </label>
          <input name="submitter_info" type="text" placeholder="So we can contact you if needed..." className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange" />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-desert-orange hover:bg-desert-pink text-white font-bold py-4 rounded-xl transition-colors shadow-lg disabled:opacity-50">
          {isSubmitting ? "Uploading & Submitting..." : "Submit Event(s)"}
        </button>

        {success && (
          <div className="bg-neon-cyan/20 border border-neon-cyan text-neon-cyan p-4 rounded-xl mt-6 text-center shadow-lg font-medium">
            🎉 Awesome! Your event has been submitted and is pending approval.
          </div>
        )}
      </form>
    </main>
  );
}