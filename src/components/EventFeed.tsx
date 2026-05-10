import Link from "next/link";

export default function EventFeed({ events }: { events: any[] }) {
  
  const getMonth = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString("en-US", { month: "short" });
  };

  const getDay = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString("en-US", { day: "numeric" });
  };

  const formatTime = (time24: string) => {
    if (!time24) return "";
    const [hourStr, minuteStr] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // Converts 0 (midnight) to 12
    return `${hour}:${minuteStr} ${ampm} PT`;
  };

  const groupedEvents: any[] = [];
  const seenKeys = new Set();

  events.forEach((event) => {
    const uniqueKey = `${event.title}-${event.venue_name}`.toLowerCase();
    if (!seenKeys.has(uniqueKey)) {
      const duplicates = events.filter(e => `${e.title}-${e.venue_name}`.toLowerCase() === uniqueKey);
      groupedEvents.push({ ...event, is_recurring: duplicates.length > 1 });
      seenKeys.add(uniqueKey); 
    }
  });

  if (!groupedEvents || groupedEvents.length === 0) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 xl:gap-6">
        {groupedEvents.map((event) => (
          
          <div
            key={event.id}
            className="bg-surface border border-surface-border rounded-2xl shadow-xl hover:border-desert-orange/50 transition-colors group overflow-hidden flex flex-col items-stretch relative"
          >
            
            <Link href={`/events/${event.id}`} className="absolute inset-0 z-10">
              <span className="sr-only">View Details</span>
            </Link>

            {/* IMAGE SECTION (Now ALWAYS on top) */}
            <div className="relative bg-surface overflow-hidden w-full aspect-[4/3] sm:aspect-[3/4] border-b border-surface-border/50">
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
                  <img src={event.image_url} alt={event.title} className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl pointer-events-none" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-surface-border to-background flex items-center justify-center">
                  <span className="text-foreground/30 font-medium text-base">No Flyer</span>
                </div>
              )}
            </div>

            {/* TEXT SECTION (Now ALWAYS on bottom) */}
            <div className="p-5 flex flex-col flex-1 w-full justify-center">
              
              <div className="flex justify-start items-center mb-2 gap-2">
                <span className="bg-surface-border/50 text-xs font-bold px-3 py-1 rounded-full text-desert-orange uppercase tracking-wide">
                  {event.category}
                </span>
                
                {event.is_recurring && (
                  <span className="text-neon-cyan/80 text-xs font-bold border border-neon-cyan/20 bg-neon-cyan/5 px-2 py-1 rounded-md flex items-center gap-1">
                    ↻ Repeats
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-desert-pink transition-colors line-clamp-2">
                {event.title}
              </h3>
              
              <p className="text-base text-foreground/80 mb-4 line-clamp-2">
                {event.description}
              </p>

              <div className="text-sm opacity-90 space-y-2 bg-background/50 p-4 rounded-lg border border-surface-border/50 mt-auto">
                <div>
                  <p className="flex items-center gap-2 font-bold text-foreground mb-1">
                    📍 <span className="line-clamp-1">{event.venue_name}</span>
                  </p>
                  <p className="pl-6 text-foreground/70 text-xs uppercase tracking-wide line-clamp-1">
                    {event.address} | {event.city}
                  </p>
                </div>
                <p className="flex items-center gap-2 pt-2 border-t border-surface-border/50">
                  ⏰ <span className="font-medium text-sm"> {formatTime(event.start_time)} {event.end_time ? `- ${formatTime(event.end_time)}` : ""} </span>
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="relative z-20 flex gap-2 sm:gap-3 mt-4 pt-4 border-t border-surface-border/50">
                
                {event.ticket_link && (
                  <a 
                    href={event.ticket_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-surface-border/40 hover:bg-desert-orange text-foreground hover:text-white text-xs sm:text-sm font-extrabold py-2.5 rounded-lg border border-surface-border hover:border-desert-orange transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md text-center flex items-center justify-center"
                  >
                    Website
                  </a>
                )}

                {(() => {
                  const dateClean = event.date.replace(/-/g, '');
                  const startTime = event.start_time.replace(/:/g, '') + '00';
                  const endTime = event.end_time ? event.end_time.replace(/:/g, '') + '00' : startTime;
                  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${dateClean}T${startTime}/${dateClean}T${endTime}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(`${event.venue_name}, ${event.address}, ${event.city} ${event.zip_code}`)}`;
                  
                  return (
                    <a 
                      href={calUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Add to Calendar"
                      className="w-10 sm:w-12 shrink-0 bg-surface-border/40 hover:bg-neon-cyan border border-surface-border hover:border-neon-cyan text-foreground hover:text-black text-lg sm:text-xl font-bold flex items-center justify-center rounded-lg transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                    >
                      +
                    </a>
                  );
                })()}

                <Link 
                  href={`/events/${event.id}`}
                  className="flex-1 bg-surface-border/40 hover:bg-desert-pink border border-surface-border hover:border-desert-pink text-foreground hover:text-white text-xs sm:text-sm font-extrabold py-2.5 rounded-lg transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md text-center flex items-center justify-center"
                >
                  Details
                </Link>

              </div>

            </div>

          </div>
        ))}
      </div>
    </div>
  );
}