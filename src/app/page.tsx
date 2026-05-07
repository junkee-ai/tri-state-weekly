import { supabase } from "@/lib/supabase";
import Link from "next/link";
import DropdownFilters from "@/components/DropdownFilters";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; category?: string; date?: string }>;
}) {
  const params = await searchParams;
  const selectedCity = params.city || "All";
  const selectedCategory = params.category || "All";
  const selectedDate = params.date || "All";

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  let query = supabase
    .from("events")
    .select("*")
    .eq("is_approved", true)
    .order("is_featured", { ascending: false })
    .order("date", { ascending: true });

  if (selectedCity !== "All") query = query.eq("city", selectedCity);
  if (selectedCategory !== "All") query = query.eq("category", selectedCategory);
  
  if (selectedDate === "Today") {
    query = query.eq("date", todayStr);
  } else if (selectedDate === "Next 7 Days") {
    query = query.gte("date", todayStr).lte("date", nextWeekStr);
  } else {
    query = query.gte("date", todayStr);
  }

  const { data: events, error } = await query;

  if (error) {
    console.error("Supabase Error:", error.message);
  }

  const getMonth = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString("en-US", { month: "short" });
  };

  const getDay = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString("en-US", { day: "numeric" });
  };

  const cities = ["All", "Fort Mohave", "Bullhead City", "Laughlin", "Needles"];

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-sunset mb-4">
          Tri-State Weekly
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl">
          The social pulse of Fort Mohave, Bullhead City, Laughlin, and Needles.
        </p>
      </header>

      <section>
        
        {/* --- CONTROLS HEADER --- */}
        <div className="flex flex-col gap-4 mb-8">
          
          {/* Top Row: Cities (Cyan title removed) */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 w-full mb-4">
            {cities.map((city) => {
              const queryParams = new URLSearchParams();
              if (selectedCategory !== "All") queryParams.set("category", selectedCategory);
              if (selectedDate !== "All") queryParams.set("date", selectedDate);
              if (city !== "All") queryParams.set("city", city);
              
              const href = `/?${queryParams.toString()}`;
              const isActive = selectedCity === city;

              return (
                <Link
                  key={city}
                  href={href}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-desert-orange text-white" 
                      : "bg-surface border border-surface-border text-foreground/70 hover:border-desert-orange/50 hover:text-foreground"
                  }`}
                >
                  {city}
                </Link>
              );
            })}
          </div>

          {/* Bottom Row: Dropdowns */}
          <div className="flex justify-start pt-4 mt-2 border-t border-surface-border/20">
            <DropdownFilters />
          </div>

        </div>

        {/* --- EVENTS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events && events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-surface border border-surface-border rounded-2xl shadow-xl hover:border-desert-orange/50 transition-colors group cursor-pointer overflow-hidden flex flex-col"
              >
                {/* Image Section */}
                {event.image_url ? (
                  <div className="w-full aspect-[3/4] md:aspect-[2/3] relative overflow-hidden bg-black">
                    
                    {/* DATE BADGE OVERLAY */}
                    <div className="absolute top-4 left-4 z-10 bg-surface/95 backdrop-blur-md border border-surface-border rounded-xl flex flex-col items-center justify-center w-14 h-14 shadow-2xl">
                      <span className="text-[10px] font-extrabold uppercase text-desert-orange leading-none mb-1">
                        {getMonth(event.date)}
                      </span>
                      <span className="text-xl font-black text-foreground leading-none">
                        {getDay(event.date)}
                      </span>
                    </div>

                    {/* SPONSORED BADGE */}
                    {event.is_featured && (
                      <div className="absolute top-4 right-4 z-10 bg-desert-pink text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl border border-white/20">
                        Sponsored
                      </div>
                    )}

                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[3/4] md:aspect-[2/3] relative bg-gradient-to-br from-surface-border to-background flex items-center justify-center">
                    
                    {/* Fallback Date Badge if no flyer */}
                    <div className="absolute top-4 left-4 z-10 bg-surface border border-surface-border rounded-xl flex flex-col items-center justify-center w-14 h-14 shadow-xl">
                      <span className="text-[10px] font-extrabold uppercase text-desert-orange leading-none mb-1">{getMonth(event.date)}</span>
                      <span className="text-xl font-black text-foreground leading-none">{getDay(event.date)}</span>
                    </div>
                    
                    <span className="text-foreground/30 font-medium text-base">No Flyer</span>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-start items-start mb-4">
                    <span className="bg-surface-border/50 text-sm font-bold px-3 py-1 rounded-full text-desert-orange uppercase tracking-wide">
                      {event.category}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-desert-pink transition-colors">
                    {event.title}
                  </h3>
                  
                  {/* BUMPED TO text-base */}
                  <p className="text-base text-foreground/80 mb-6 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="mt-auto text-base opacity-90 space-y-3 bg-background/50 p-4 rounded-lg border border-surface-border/50">
                    <div>
                      <p className="flex items-center gap-2 font-bold text-foreground mb-1">
                        📍 <span>{event.venue_name}</span>
                      </p>
                      {/* BUMPED TO text-sm */}
                      <p className="pl-6 text-foreground/70 text-sm uppercase tracking-wide">
                        {event.address}
                        <br />
                        {event.city},{" "}
                        {event.city === "Laughlin" ? "NV" : event.city === "Needles" ? "CA" : "AZ"} {event.zip_code}
                      </p>
                    </div>

                    <p className="flex items-center gap-2 pt-2 border-t border-surface-border/50">
                      ⏰{" "}
                      <span className="font-medium text-base">
                        {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-surface/50 border border-dashed border-surface-border rounded-2xl">
              <h3 className="text-2xl font-bold mb-2">No events found</h3>
              <p className="text-foreground/70 text-lg max-w-sm mx-auto mb-6">
                We couldn't find any upcoming events matching these filters in {selectedCity === "All" ? "the Tri-State area" : selectedCity}.
              </p>
              <Link href="/submit" className="text-desert-orange text-lg font-bold hover:underline">
                Know something happening? Submit it here.
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}