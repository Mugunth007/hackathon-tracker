import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], currentHackathons = [] } = body;

    const apiKey =
      req.headers.get("x-gemini-key") ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          reply:
            "⚠️ Gemini API key not found. Please add your `GEMINI_API_KEY` to `.env.local` or click the Settings icon (gear) in the top-right to enter it directly!",
          action: "none",
        },
        { status: 200 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format current date context
    const today = new Date().toISOString().split("T")[0];
    const systemPrompt = `You are "Aether", an intelligent hackathon tracker assistant built into a sleek Aceternity-style dashboard.
Current date today is: ${today}.

Your duties:
1. When the user mentions participating in, registering for, or finding a hackathon (e.g. "I am participating in HackNITR from Nov 10 to Nov 12, devpost link is devpost.com/hacknitr"), extract the structured hackathon data and set action = "add_hackathon".
   - StartDate and EndDate MUST be in YYYY-MM-DD format. Infer reasonable years and months based on today's date (${today}) if only weekdays or month names are given.
   - Detect platforms like Devpost, Devfolio, Unstop, MLH, DoraHacks, etc. If unknown, use "Other".
   - Extract tags, prize pool, team name, and description if present.
   - Provide an enthusiastic, polite reply confirming what was added.

2. When the user asks to delete or remove a hackathon (e.g. "Remove Google AI Gemini Developer Sprint"), inspect the current hackathons list provided below, find the matching item's id, set action = "delete_hackathon", targetHackathonId = that id, and confirm in your reply.

3. When the user asks questions about their schedule, upcoming deadlines, recommendations, or how to prepare:
   - Answer accurately using the current hackathons list context.
   - Set action = "none".

CURRENT HACKATHONS IN USER'S DASHBOARD:
${JSON.stringify(currentHackathons, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\nUser request: "${message}"`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "Natural conversational response to the user.",
            },
            action: {
              type: Type.STRING,
              description: "One of: 'add_hackathon', 'delete_hackathon', 'none'",
            },
            hackathon: {
              type: Type.OBJECT,
              description: "Structured details when action is add_hackathon",
              properties: {
                title: { type: Type.STRING, description: "Name of the hackathon" },
                startDate: { type: Type.STRING, description: "Start date (YYYY-MM-DD)" },
                endDate: { type: Type.STRING, description: "End date (YYYY-MM-DD)" },
                websiteUrl: { type: Type.STRING, description: "Website or registration URL" },
                platform: { type: Type.STRING, description: "Platform name" },
                description: { type: Type.STRING, description: "Summary or problem statement" },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Domain tags (AI, Web3, Mobile, etc.)",
                },
                teamName: { type: Type.STRING, description: "Team name" },
                prizePool: { type: Type.STRING, description: "Prizes or rewards" },
              },
            },
            targetHackathonId: {
              type: Type.STRING,
              description: "ID of hackathon to delete if action is delete_hackathon",
            },
          },
          propertyOrdering: ["reply", "action"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      {
        reply: `Error communicating with Gemini: ${error?.message || "Unknown error"}. Check your API key.`,
        action: "none",
      },
      { status: 500 }
    );
  }
}
