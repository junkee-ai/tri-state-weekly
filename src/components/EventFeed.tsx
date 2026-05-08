import Link from "next/link";

// Notice we removed "use client" and "useState" because we don't need them anymore!
export default function EventFeed({ events }: { events: any[] }) {
  
  const getMonth = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString("en-US", { month: "short" });
  };

  const getDay = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString("en-US", { day: "numeric" });
  };

  if (!events || events.length === 0) {
    return (
      <div className="col-span-full py-16 text-center bg-surface/50 border border-dashed border-surface-border rounded-2xl">
        <h3 className="text-2xl font-bold mb-2">No events found</h3>
        <p className="text-foreground/70 text-lg max-w-sm mx-auto mb-6">
          We couldn't find any upcoming events matching these filters.
        </p>
        <Link href="/submit" className="text-desert-orange text-lg font-bold hover:underline">
          Know something happening? Submit it here.
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      
      {/* --- THE FEED (LIST VIEW ONLY) --- */}
      <div className="flex flex-col gap-5">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="bg-surface border border-surface-border rounded-2xl shadow-xl hover:border-desert-orange/50 transition-colors group cursor-pointer overflow-hidden flex flex-col md:flex-row items-center md:items-stretch"
          >
            
            {/* IMAGE SECTION (Square on desktop, wide on mobile) */}
            <div className="relative bg-surface overflow-hidden w-full md:w-56 md:shrink-0 h-56 md:h-auto">
              
              <div className="absolute top-4 left-4 z-20 bg-surface/95 backdrop-blur-md border border-surface-border rounded-xl flex flex-col items-center justify-center w-14 h-14 shadow-xl">
                <span className="text-[10px] font-extrabold uppercase text-desert-orange leading-none mb-1">{getMonth(event.date)}</span>
                <span className="text-xl font-black text-foreground leading-none">{getDay(event.date)}</span>
              </div>

              {event.is_featured && (
                <div className="absolute top-4 right-4 z-20 bg-desert-pink text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl border border-white/20">
                  Sponsored
                </div>
              )}

              {event.image_url ? (
                <>
                  <div className="absolute inset-0 opacity-40 blur-2xl scale-110 group-hover:scale-125 transition-transform duration-700" style={{ backgroundImage: `url(${event.image_url})`, backgroundPosition: 'center', backgroundSize: 'cover' }}></div>
                  <img src={event.image_url} alt={event.title} className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-surface-border to-background flex items-center justify-center">
                  <span className="text-foreground/30 font-medium text-base">No Flyer</span>
                </div>
              )}
            </div>

            {/* TEXT SECTION */}
            <div className="p-5 md:p-6 flex flex-col flex-1 w-full justify-center">
              
              <div className="flex justify-start items-start mb-2">
                <span className="bg-surface-border/50 text-xs font-bold px-3 py-1 rounded-full text-desert-orange uppercase tracking-wide">
                  {event.category}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-desert-pink transition-colors">
                {event.title}
              </h3>
              
              <p className="text-base text-foreground/80 mb-4 line-clamp-2">
                {event.description}
              </p>

              <div className="text-sm md:text-base opacity-90 space-y-2 bg-background/50 p-4 rounded-lg border border-surface-border/50 mt-auto">
                <div>
                  <p className="flex items-center gap-2 font-bold text-foreground mb-1">
                    📍 <span>{event.venue_name}</span>
                  </p>
                  <p className="pl-6 text-foreground/70 text-xs md:text-sm uppercase tracking-wide">
                    {event.address} | {event.city}
                  </p>
                </div>
                <p className="flex items-center gap-2 pt-2 border-t border-surface-border/50">
                  ⏰ <span className="font-medium text-base">{event.start_time.slice(0, 5)} {event.end_time ? `- ${event.end_time.slice(0, 5)}` : ""}</span>
                </p>
              </div>

            </div>

          </Link>
        ))}
      </div>
    </div>
  );
}