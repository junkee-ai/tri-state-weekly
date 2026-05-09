import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    let contentToParse = text;

    // --- NEW: MAGIC URL READER ---
    // If the user pasted a URL, read the website instead of treating it as raw text!
    if (text.startsWith("http://") || text.startsWith("https://")) {
      const jinaResponse = await fetch(`https://r.jina.ai/${text}`);
      if (!jinaResponse.ok) {
        throw new Error("Failed to read the website URL.");
      }
      contentToParse = await jinaResponse.text();
    }

    // --- NEW: MULTI-EVENT PROMPT ---
    const systemPrompt = `
      You are an expert data extractor for a local events website in the Tri-State area (Fort Mohave, Bullhead City, Laughlin, Needles, Mohave Valley).
      A user will give you either raw text from a flyer, OR the full text of a casino/venue calendar page.
      Find EVERY SINGLE EVENT mentioned in the text.
      
      Return a JSON object with a single key called "events". The value must be an ARRAY of event objects.
      If you only find 1 event, return an array with 1 object.
      If you cannot find a piece of information for a specific event, leave the value as an empty string "".

      JSON Keys required for EACH event object:
      - title (String: Catchy event title)
      - date (String: YYYY-MM-DD format. Assume the current year is ${new Date().getFullYear()} if not specified)
      - start_time (String: HH:MM format in 24-hour time. e.g. 8:00 PM is 20:00)
      - end_time (String: HH:MM format in 24-hour time, or "" if none)
      - venue_name (String: Name of the location/bar/park/casino)
      - address (String: Street address, or "" if you only know the venue name)
      - city (String: MUST be one of: "Fort Mohave", "Bullhead City", "Laughlin", "Needles", "Mohave Valley". Guess based on context if not explicit)
      - category (String: MUST be one of: "Live Music", "Nightlife", "Food & Drink", "Comedy", "Community", "Family", "Outdoor & River", "Pets & Animals", "Classes & Workshops". Guess the best fit.)
      - description (String: A clean, well-formatted 1-2 paragraph description based on the post. Remove emojis and hashtags.)
      - ticket_link (String: Any URL found in the text for tickets or more info)
      - zip_code (String: The 5-digit zip code if provided, otherwise "")
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Upgraded model to handle massive webpage text!
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contentToParse },
      ],
    });

    const aiResult = response.choices[0].message.content;
    const parsedData = JSON.parse(aiResult || "{}");

    // Send the array of events back to the dashboard
    return NextResponse.json({ data: parsedData.events || [] });

  } catch (error: any) {
    console.error("AI Parsing Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}