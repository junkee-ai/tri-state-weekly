import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Notice there is NO "default" keyword here! Just "export async function POST"
export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const systemPrompt = `
      You are an expert data extractor for a local events website in the Tri-State area (Fort Mohave, Bullhead City, Laughlin, Needles).
      A user will give you raw, messy text from a Facebook post or flyer.
      Extract the event details and format them EXACTLY as a JSON object with the following keys. 
      If you cannot find a piece of information, leave the value as an empty string "".

      JSON Keys required:
      - title (String: Catchy event title)
      - date (String: YYYY-MM-DD format. Assume the current year is ${new Date().getFullYear()} if not specified)
      - start_time (String: HH:MM format in 24-hour time. e.g. 8:00 PM is 20:00)
      - end_time (String: HH:MM format in 24-hour time, or "" if none)
      - venue_name (String: Name of the location/bar/park/casino)
      - address (String: Street address, or "" if you only know the venue name)
      - city (String: MUST be one of: "Fort Mohave", "Bullhead City", "Laughlin", "Needles". Guess based on context if not explicit)
      - category (String: MUST be one of: "Live Music", "Nightlife", "Food & Drink", "Comedy", "Community", "Family", "Outdoor & River", "Pets & Animals", "Classes & Workshops". Guess the best fit.)
      - description (String: A clean, well-formatted 1-2 paragraph description based on the post. Remove emojis and hashtags.)
      - ticket_link (String: Any URL found in the text for tickets or more info)
      - zip_code (String: The 5-digit zip code if provided, otherwise "")
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
    });

    const aiResult = response.choices[0].message.content;
    const parsedData = JSON.parse(aiResult || "{}");

    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    console.error("AI Parsing Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}