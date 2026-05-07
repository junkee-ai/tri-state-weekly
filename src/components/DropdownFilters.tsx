"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function DropdownFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filters from the URL
  const currentCategory = searchParams.get("category") || "All";
  const currentDate = searchParams.get("date") || "All";

  // When a dropdown changes, update the URL without losing the other filters
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "All") {
      params.delete(key); // Clean up the URL if they choose "All"
    } else {
      params.set(key, value);
    }
    
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
      
      {/* Category Dropdown */}
      <select 
        value={currentCategory}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="bg-surface border border-surface-border text-foreground rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-desert-orange cursor-pointer"
      >
        <option value="All">All Categories</option>
        <option value="Classes & Workshops">Classes & Workshops</option>
        <option value="Community">Community</option>
        <option value="Family">Family</option>
        <option value="Food & Drink">Food & Drink</option>
        <option value="Live Music">Live Music</option>
        <option value="Nightlife">Nightlife</option>
        <option value="Outdoor & River">Outdoor & River</option>
        <option value="Pets & Animals">Pets & Animals</option>
      </select>

      {/* Date Dropdown */}
      <select 
        value={currentDate}
        onChange={(e) => updateFilter("date", e.target.value)}
        className="bg-surface border border-surface-border text-foreground rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-desert-orange cursor-pointer"
      >
        <option value="All">All Upcoming Dates</option>
        <option value="Today">Happening Today</option>
        <option value="Next 7 Days">Next 7 Days</option>
      </select>

    </div>
  );
}