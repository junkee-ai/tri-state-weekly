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

    if (flyerFile && flyerFile.size > 0) {
      const fileExt = flyerFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("flyers")
        .upload(fileName, flyerFile);

      if (uploadError) {
        alert("Failed to upload image: " + uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("flyers")
        .getPublicUrl(fileName);
        
      imageUrl = publicUrlData.publicUrl;
    }

    const newEvent = {
      title: formData.get("title"),
      date: formData.get("date"),
      start_time: formData.get("start_time"),
      end_time: formData.get("end_time") || null, 
      city: formData.get("city"),
      category: formData.get("category"),
      description: formData.get("description"),
      submitter_info: formData.get("submitter_info"),
      image_url: imageUrl,
      // --- NEW FIELDS ---
      venue_name: formData.get("venue_name"),
      address: formData.get("address"),
      zip_code: formData.get("zip_code"),
    };

    const { error } = await supabase.from("events").insert([newEvent]);

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

      <form onSubmit={handleSubmit} className="bg-surface border border-surface-border p-6 md:p-8 rounded-2xl space-y-6">
        
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-base font-medium mb-2">Date *</label>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium mb-2">City *</label>
            <select required name="city" className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange">
              <option value="">Select a city...</option>
              <option value="Fort Mohave">Fort Mohave</option>
              <option value="Bullhead City">Bullhead City</option>
              <option value="Laughlin">Laughlin</option>
              <option value="Needles">Needles</option>
            </select>
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Category *</label>
            <select required name="category" className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange">
              <option value="">Select a category...</option>
              <option value="Classes & Workshops">Classes & Workshops</option>
              <option value="Community">Community</option>
              <option value="Family">Family</option>
              <option value="Food & Drink">Food & Drink</option>
              <option value="Live Music">Live Music</option>
              <option value="Nightlife">Nightlife</option>
              <option value="Outdoor & River">Outdoor & River</option>
              <option value="Pets & Animals">Pets & Animals</option>
            </select>
          </div>
        </div>

        {/* --- NEW ADDRESS SECTION --- */}
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
            Your Email/Phone <span className="text-foreground/50 text-xs font-normal ml-2">(Hidden from public)</span>
          </label>
          <input 
            name="submitter_info" 
            type="text" 
            placeholder="So we can contact you if needed..."
            className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 focus:outline-none focus:border-desert-orange" 
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-desert-orange hover:bg-desert-pink text-white font-bold py-4 rounded-xl transition-colors shadow-lg disabled:opacity-50">
          {isSubmitting ? "Uploading & Submitting..." : "Submit Event"}
        </button>
        {success && (
        <div className="bg-neon-cyan/20 border border-neon-cyan text-neon-cyan p-4 rounded-xl mb-8">
          🎉 Awesome! Your event(s) have been submitted and are pending approval.
        </div>
      )}
      </form>
    </main>
  );
}