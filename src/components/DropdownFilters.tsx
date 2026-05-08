"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function DropdownFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "All";
  const currentDate = searchParams.get("date") || "All";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") params.delete(key);
    else params.set(key, value);
    router.push(`/?${params.toString()}`);
  };

  // --- GENERATE THE NEXT 6 MONTHS DYNAMICALLY ---
  const upcomingMonths = [];
  const today = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    // We save the value as "YYYY-MM" so the database can read it easily!
    const monthValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    upcomingMonths.push({ name: monthName, value: monthValue });
  }

  return (
    <div className="grid grid-cols-2 md:flex md:flex-row gap-3 w-full md:w-auto">
      
      <select 
        value={currentCategory}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="bg-surface border border-surface-border text-foreground rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-desert-orange cursor-pointer"
      >
        <option value="All">All Categories</option>
        <option value="Live Music">Live Music</option>
        <option value="Nightlife">Nightlife</option>
        <option value="Food & Drink">Food & Drink</option>
        <option value="Community">Community</option>
        <option value="Family">Family</option>
        <option value="Outdoor & River">Outdoor & River</option>
        <option value="Pets & Animals">Pets & Animals</option>
        <option value="Classes & Workshops">Classes & Workshops</option>
      </select>

      <select 
        value={currentDate}
        onChange={(e) => updateFilter("date", e.target.value)}
        className="bg-surface border border-surface-border text-foreground rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-desert-orange cursor-pointer"
      >
        <option value="All">All Upcoming</option>
        <option value="Today">Happening Today</option>
        <option value="This Weekend">This Weekend</option>
        <optgroup label="Search by Month">
          {upcomingMonths.map((m) => (
            <option key={m.value} value={m.value}>{m.name}</option>
          ))}
        </optgroup>
      </select>

    </div>
  );
}