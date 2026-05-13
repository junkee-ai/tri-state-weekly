import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // 1. Fetch all upcoming approved events so the AI knows what's going on!
    const todayStr = new Date().toISOString().split("T")[0];
    const { data: events } = await supabase
      .from("events")
      .select("title, date, start_time, venue_name, city, category, description")
      .eq("is_approved", true)
      .gte("date", todayStr)
      .order("date", { ascending: true });

    // 2. Turn the events into a clean text list for the AI to read
    const eventContext = events?.map(e => 
      `- ${e.title} on ${e.date} at ${e.venue_name} (${e.city}). Category: ${e.category}. Details: ${e.description}`
    ).join("\n") || "No upcoming events currently scheduled.";

    // 3. Give the AI its personality and rules
    const systemPrompt = `
      You are the friendly, energetic local event assistant for 'Tri-State Weekly' (covering Fort Mohave, Bullhead City, Laughlin, Needles).
      Your job is to help users find things to do based ONLY on the events listed below.
      If someone asks about an event not on the list, politely tell them you don't see it on the calendar.
      Keep your answers conversational and helpful. Use emojis!
      IMPORTANT: Always use double line breaks between different events to keep the text easy to read on mobile.
      
      UPCOMING EVENTS CALENDAR:
      ${eventContext}
    `;

    // 4. Send the chat to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and smart
      messages: [
        { role: "system", content: systemPrompt },
        ...history, // Pass the previous chat history so it remembers the conversation
        { role: "user", content: message }
      ],
    });

    return NextResponse.json({ reply: response.choices[0].message.content });

  } catch (error: any) {
    console.error("Chatbot Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}