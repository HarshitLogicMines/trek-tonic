import type { Itinerary } from "@/types/itinerary";

/** Extract the first ```json ...``` block (or first {...} object) from a streamed message. */
export function extractItinerary(text: string): Itinerary | null {
  if (!text) return null;
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  let candidate = fenced?.[1]?.trim();
  if (!candidate) {
    const start = text.indexOf("{");
    if (start === -1) return null;
    candidate = text.slice(start);
  }
  // Try progressively trimming from the end to find valid JSON (handles streaming)
  for (let end = candidate.length; end > 50; end--) {
    const slice = candidate.slice(0, end);
    const lastBrace = slice.lastIndexOf("}");
    if (lastBrace === -1) continue;
    try {
      const parsed = JSON.parse(slice.slice(0, lastBrace + 1));
      if (parsed && typeof parsed === "object" && "days" in parsed) {
        return parsed as Itinerary;
      }
    } catch {
      // keep trimming
    }
    // jump straight to the brace position for efficiency
    end = lastBrace;
  }
  return null;
}

export function formatCurrency(amount: number, currency: "INR" | "USD" = "INR") {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}
