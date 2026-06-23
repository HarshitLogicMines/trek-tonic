import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM_PROMPT = `You are TripMind, an expert AI travel planner specializing in India and global destinations.

When a user describes a trip, extract: destination, duration (days), budget (INR unless USD stated), group size & type, travel style, interests, and dates/season. If anything is vague, make sensible assumptions and state them.

Respond in TWO parts, in this order:

PART 1 — A short, warm intro (2-3 sentences) explaining why this trip will be great.

PART 2 — A single fenced JSON code block (\`\`\`json ... \`\`\`) with this EXACT shape:
{
  "title": string,
  "destination": string,
  "duration": number,
  "totalBudget": number,
  "currency": "INR" | "USD",
  "groupSize": number,
  "intro": string,
  "days": [
    {
      "day": number,
      "theme": string,
      "estimatedCost": number,
      "activities": [
        { "time": "Morning"|"Afternoon"|"Evening"|"Night", "title": string, "description": string, "location": string, "duration": string, "cost": number, "category": "attraction"|"food"|"transport"|"accommodation"|"experience" }
      ]
    }
  ],
  "accommodation": [ { "name": string, "tier": "budget"|"mid"|"luxury", "pricePerNight": number, "notes": string } ],
  "transportTips": [ string ],
  "packingList": [ string ],
  "foodRecommendations": [ string ]
}

After the JSON, add a brief friendly closing line.

Rules:
- Total estimated cost across days + accommodation must stay within totalBudget.
- Use realistic Indian prices in INR when destination is in India.
- Each day should have 3-5 activities covering morning/afternoon/evening.
- Always return valid JSON (no trailing commas, all keys quoted).`;

type ChatBody = { messages?: unknown; model?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const queryModel = url.searchParams.get("model");

        // Read raw body for improved error visibility
        const rawBody = await request.text();
        // Log raw bytes to catch hidden characters (BOM, control chars)
        try {
          const bytes = Array.from(Buffer.from(rawBody, 'utf8'));
          console.error('[chat] raw body bytes:', bytes.slice(0, 80));
          JSON.parse(rawBody);
        } catch (e) {
          console.error('[chat] invalid JSON body:', rawBody, e);
          return new Response('Invalid JSON body', { status: 400 });
        }

        const body = (rawBody ? JSON.parse(rawBody) : {}) as ChatBody;
        const { messages, model: requestedModelFromBody } = body ?? {};
        const requestedModel = typeof requestedModelFromBody === "string" && requestedModelFromBody.trim() ? requestedModelFromBody : queryModel;

        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.VITE_GEMINI_API_KEY;
        if (!key) return new Response("Missing VITE_GEMINI_API_KEY", { status: 500 });

        const google = createGoogleGenerativeAI({ apiKey: key });

        const defaultModel = process.env.VITE_GEMINI_MODEL ?? "gemini-2.5-flash";
        const modelId = typeof requestedModel === "string" && requestedModel.trim() ? requestedModel : defaultModel;

        // Fallback to a safe default if an invalid modelId was supplied
        const safeModelId = typeof modelId === "string" ? modelId : defaultModel;

        try {
          const model = google(safeModelId);

          const result = streamText({
            model,
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages as UIMessage[]),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
            onError: (error) => {
              console.error("[chat] stream error", error);
              return "The AI planner ran into an error. Please try again.";
            },
          });
        } catch (error) {
          console.error("[chat] handler error", error);
          return new Response("AI planner failed to start streaming", { status: 500 });
        }
      },
    },
  },
});
