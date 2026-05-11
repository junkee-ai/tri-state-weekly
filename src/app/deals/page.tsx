import { supabase } from "@/lib/supabase";
import Link from "next/link";
import DropdownFilters from "@/components/DropdownFilters";

export const dynamic = "force-dynamic";

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; category?: string }>;
}) {
  const params = await searchParams;
  const selectedCity = params.city || "All";
  const selectedCategory = params.category || "All";

  // Build the database query
  let query = supabase
    .from("deals")
    .select("*")
    .eq("is_approved", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false }); 

  if (selectedCity !== "All") query = query.eq("city", selectedCity);
  if (selectedCategory !== "All") query = query.eq("category", selectedCategory);

  const { data: deals, error } = await query;

  if (error) console.error("Supabase Error:", error.message);

  const cities = ["All", "Fort Mohave", "Bullhead City", "Laughlin", "Needles", "Mohave Valley"];

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-neon-cyan mb-4">
          Local Deals
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl">
          The best food, drink, and entertainment specials across the Tri-State area.
        </p>
      </header>

      <section>
        {/* --- CONTROLS --- */}
        <div className="flex flex-col mb-6">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 w-full pb-4">
            {cities.map((city) => {
              const queryParams = new URLSearchParams();
              if (selectedCategory !== "All") queryParams.set("category", selectedCategory);
              if (city !== "All") queryParams.set("city", city);
              
              const href = `/deals?${queryParams.toString()}`;
              const isActive = selectedCity === city;

              return (
                <Link key={city} href={href} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${isActive ? "bg-neon-cyan text-black" : "bg-surface border border-surface-border text-foreground/70 hover:border-neon-cyan/50 hover:text-foreground"}`}>
                  {city}
                </Link>
              );
            })}
          </div>
        </div>

        {/* --- THE DEALS FEED --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {!deals || deals.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-surface/50 border border-dashed border-surface-border rounded-2xl">
              <h3 className="text-2xl font-bold mb-2">No deals found</h3>
              <p className="text-foreground/70 text-lg max-w-sm mx-auto mb-6">
                We couldn't find any specials matching these filters.
              </p>
            </div>
          ) : (
            deals.map((deal) => (
              <div key={deal.id} className="bg-surface border border-surface-border rounded-2xl shadow-xl flex flex-col sm:flex-row overflow-hidden group hover:border-neon-cyan/50 transition-colors relative">
                
                {deal.is_featured && (
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 bg-desert-pink text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                    Sponsored
                  </div>
                )}

                {/* IMAGE SQUARE */}
                <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-background flex items-center justify-center border-b sm:border-b-0 sm:border-r border-surface-border/50 p-4">
                  {deal.image_url ? (
                    <img src={deal.image_url} alt={deal.business_name} className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-4xl">🍔</span>
                  )}
                </div>

                {/* TEXT CONTENT */}
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-neon-cyan uppercase tracking-wider">{deal.category}</span>
                    {deal.expiration_date && (
                      <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">
                        Ends {new Date(deal.expiration_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-black text-foreground mb-1 leading-tight">{deal.deal_title}</h3>
                  <p className="text-lg font-bold text-foreground/70 mb-3">{deal.business_name}</p>
                  
                  <p className="text-sm text-foreground/90 mb-4 line-clamp-3">{deal.description}</p>
                  
                  <div className="mt-auto flex items-end justify-between gap-4">
                    <div className="text-xs text-foreground/50">
                      <p className="font-bold">📍 {deal.city}</p>
                      <p className="opacity-70">{deal.address}</p>
                    </div>
                    {deal.fine_print && (
                      <p className="text-[10px] text-foreground/40 italic max-w-[120px] text-right line-clamp-2">
                        * {deal.fine_print}
                      </p>
                    )}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </section>
    </main>
  );
}