import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EventDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("is_approved", true)
    .single();

  if (error || !event) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString("en-US", { weekday: 'long', month: "long", day: "numeric" });
  };

  const mapSearchQuery = encodeURIComponent(`${event.venue_name} ${event.address} ${event.city} ${event.zip_code}`);
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`;

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center text-foreground/60 hover:text-desert-orange transition-colors mb-8 font-medium">
        ← Back to all events
      </Link>

      {/* 
        Changed to a 12-column grid. 
        Left gets 5 columns (perfect for vertical flyers).
        Right gets 7 columns (perfect for reading text).
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        {/* LEFT COLUMN: Sticky Flyer */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="bg-surface/50 border border-surface-border rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
            {event.image_url ? (
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-gradient-to-br from-surface-border to-background flex items-center justify-center">
                <span className="text-foreground/30 font-medium">No Flyer Available</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Event Details */}
        <div className="lg:col-span-7 flex flex-col space-y-8 pt-2">
          
          {/* Header Info */}
          <div>
            <span className="bg-surface-border/50 text-xs font-bold px-3 py-1 rounded-full text-desert-orange uppercase tracking-wide mb-4 inline-block">
              {event.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
              {event.title}
            </h1>
            <p className="text-xl text-foreground/80 font-medium text-neon-cyan">
              {formatDate(event.date)}
            </p>
          </div>

          {/* Location & Time Box (MOVED UP for better UX) */}
          <div className="bg-surface border border-surface-border rounded-xl p-6 md:p-8 space-y-6 shadow-lg">
            
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-full bg-desert-pink/10 flex items-center justify-center shrink-0 text-xl border border-desert-pink/20">
                ⏰
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-foreground text-lg mb-1">Time</h3>
                <p className="text-foreground/70">
                  {event.start_time.slice(0, 5)} 
                  {event.end_time ? ` - ${event.end_time.slice(0, 5)}` : ""}
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-surface-border/50"></div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-full bg-desert-orange/10 flex items-center justify-center shrink-0 text-xl border border-desert-orange/20">
                📍
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-foreground text-lg mb-1">{event.venue_name}</h3>
                <p className="text-foreground/70 mb-4 leading-relaxed">
                  {event.address}<br/>
                  {event.city}, {event.city === 'Laughlin' ? 'NV' : event.city === 'Needles' ? 'CA' : 'AZ'} {event.zip_code}
                </p>
                <a 
                  href={googleMapsLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-foreground text-background text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-foreground/80 transition-colors shadow-md"
                >
                  Get Directions
                </a>
              </div>
            </div>

          </div>

          {/* Description (MOVED DOWN) */}
          <div className="pt-4 border-t border-surface-border">
            <h3 className="text-lg font-bold text-foreground mb-4">About this event</h3>
            <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-lg">
              {event.description}
            </div>
          </div>

        </div>
      </div>

    </main>
  );
}