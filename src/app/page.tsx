import { supabase } from "@/lib/supabase";
import Link from "next/link";
import DropdownFilters from "@/components/DropdownFilters";
import EventFeed from "@/components/EventFeed"; 
import { Suspense } from "react";

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

  // --- CLEAN DATE MATH ---
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  
  const thisFriday = new Date(today);
  const daysUntilFriday = (5 - today.getDay() + 7) % 7; 
  thisFriday.setDate(today.getDate() + (daysUntilFriday === 0 && today.getDay() !== 5 ? 7 : daysUntilFriday));
  const thisSunday = new Date(thisFriday);
  thisSunday.setDate(thisFriday.getDate() + 2);
  const thisFridayStr = thisFriday.toISOString().split("T")[0];
  const thisSundayStr = thisSunday.toISOString().split("T")[0];

  let query = supabase
    .from("events")
    .select("*")
    .eq("is_approved", true)
    .order("is_featured", { ascending: false })
    .order("date", { ascending: true }); 

  // --- APPLY FILTERS ---
  if (selectedCity !== "All") query = query.eq("city", selectedCity);
  if (selectedCategory !== "All") query = query.eq("category", selectedCategory);
  
  if (selectedDate === "Today") {
    query = query.eq("date", todayStr);
  } else if (selectedDate === "This Weekend") {
    query = query.gte("date", thisFridayStr).lte("date", thisSundayStr);
  } else if (selectedDate.length === 7 && selectedDate.includes("-")) {
    const [year, month] = selectedDate.split("-").map(Number);
    const startOfMonth = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endOfMonth = new Date(year, month, 0).toISOString().split("T")[0];
    query = query.gte("date", startOfMonth).lte("date", endOfMonth);
  } else {
    query = query.gte("date", todayStr); 
  }

  const { data: events, error } = await query;

  if (error) console.error("Supabase Error:", error.message);

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
        <div className="flex flex-col mb-6">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 w-full pb-4">
            {cities.map((city) => {
              const queryParams = new URLSearchParams();
              if (selectedCategory !== "All") queryParams.set("category", selectedCategory);
              if (selectedDate !== "All") queryParams.set("date", selectedDate);
              if (city !== "All") queryParams.set("city", city);
              
              const href = `/?${queryParams.toString()}`;
              const isActive = selectedCity === city;

              return (
                <Link key={city} href={href} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${isActive ? "bg-desert-orange text-white" : "bg-surface border border-surface-border text-foreground/70 hover:border-desert-orange/50 hover:text-foreground"}`}>
                  {city}
                </Link>
              );
            })}
          </div>

          <div className="flex justify-start pt-4 border-t border-surface-border/20">
            <Suspense fallback={<div className="h-10 w-full animate-pulse bg-surface-border/50 rounded-lg"></div>}>
              <DropdownFilters />
            </Suspense>
          </div>
        </div>

        <EventFeed events={events || []} />
      </section>
    </main>
  );
}