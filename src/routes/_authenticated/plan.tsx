import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { createTrip } from "@/lib/trips.functions";
import { extractItinerary } from "@/lib/itinerary-parser";
import { ItineraryView } from "@/components/itinerary-view";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  Sparkles,
  Bookmark,
  Copy,
  Brain,
  Upload,
  RotateCw,
  MessageSquarePlus,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/plan")({
  head: () => ({ meta: [{ title: "Plan a trip — TripMind" }] }),
  component: PlanPage,
});

const STARTERS = [
  "Plan a 5-day Goa trip for 2 people under ₹40,000",
  "Weekend trip from Bangalore to somewhere cold",
  "Family trip to Kerala in December, budget ₹1.5 lakh",
  "Solo backpacking in Himachal for 7 days, ₹25,000",
];

function PlanPage() {
  const navigate = useNavigate();
  const save = useServerFn(createTrip);
  
  // Selected AI Model
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  const transport = useMemo(
    () => new DefaultChatTransport({ api: `/api/chat?model=${encodeURIComponent(selectedModel)}` }),
    [selectedModel]
  );

  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onError: (e) => toast.error(e.message || "AI request failed"),
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Listen for the global new-chat event from the Sidebar
  useEffect(() => {
    const handleNewChatEvent = () => {
      setMessages([]);
      setInput("");
    };
    window.addEventListener("new-chat", handleNewChatEvent);
    return () => window.removeEventListener("new-chat", handleNewChatEvent);
  }, [setMessages]);

  // assemble latest assistant text
  const latestAssistantText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === "assistant") {
        return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
      }
    }
    return "";
  }, [messages]);

  const itinerary = useMemo(() => extractItinerary(latestAssistantText), [latestAssistantText]);

  // auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  function submit(text?: string) {
    const t = (text ?? input).trim();
    if (!t || isLoading) return;
    setInput("");
    sendMessage({ text: t });
  }

  async function onSave() {
    if (!itinerary) return;
    setSaving(true);
    try {
      const row = await save({
        data: {
          title: itinerary.title || `Trip to ${itinerary.destination}`,
          destination: itinerary.destination,
          duration: itinerary.duration,
          budget: itinerary.totalBudget,
          currency: (itinerary.currency === "USD" ? "USD" : "INR"),
          groupSize: itinerary.groupSize ?? 1,
          itinerary,
        }
      });
      toast.success("Trip saved!");
      
      // Dispatch custom events to trigger sidebar reload and let it know a trip updated
      window.dispatchEvent(new Event("trip-updated"));
      
      navigate({ to: "/itinerary/$id", params: { id: row.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaving(false); }
  }

  // Action Button Handlers
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Response copied to clipboard!");
  };

  const handleShare = () => {
    if (itinerary) {
      const shareText = `TripMind Plan to ${itinerary.destination} (${itinerary.duration} days)\nBudget: ${itinerary.totalBudget}\nPlan details saved.`;
      navigator.clipboard.writeText(shareText);
      toast.success("Share summary copied to clipboard!");
    } else {
      toast.info("No itinerary content available to share yet.");
    }
  };

  const handleRegenerate = () => {
    const userMsgs = messages.filter((m) => m.role === "user");
    if (userMsgs.length > 0) {
      const lastUserMsg = userMsgs[userMsgs.length - 1];
      const lastText = lastUserMsg.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
      
      // Remove last assistant message if any
      setMessages((prev) => {
        const lastIdx = prev.map(m => m.role).lastIndexOf("assistant");
        if (lastIdx !== -1) {
          return prev.filter((_, idx) => idx !== lastIdx);
        }
        return prev;
      });
      sendMessage({ text: lastText });
      toast.info("Regenerating response...");
    } else {
      toast.error("No queries to regenerate!");
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    toast.success("Started a new chat session!");
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    toast.success(`Switched AI model to ${model === "gemini-2.5-flash" ? "Gemini 2.5 Flash" : "Gemini 2.5 Pro"}`);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <SiteHeader />
      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_1.1fr]">
        {/* Chat panel */}
        <div className="flex flex-col border-r border-border">
          <ScrollArea className="flex-1">
            <div ref={scrollRef} className="mx-auto max-w-2xl space-y-6 px-4 py-8">
              {messages.length === 0 ? (
                <EmptyState onPick={submit} />
              ) : (
                messages.map((m) => (
                  <Message
                    key={m.id}
                    m={m}
                    onCopy={handleCopy}
                    onShare={handleShare}
                    onRegenerate={handleRegenerate}
                    onNewChat={handleNewChat}
                    selectedModel={selectedModel}
                    onModelChange={handleModelChange}
                  />
                ))
              )}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-amber" /> TripMind is planning…
                </div>
              ) : null}
            </div>
          </ScrollArea>

          <div className="border-t border-border bg-card/50 p-4">
            <form
              className="mx-auto flex max-w-2xl items-end gap-2"
              onSubmit={(e) => { e.preventDefault(); submit(); }}
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
                placeholder="Describe your dream trip…"
                rows={2}
                className="min-h-[56px] resize-none"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="h-[56px] gradient-amber text-navy">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>

        {/* Live itinerary panel */}
        <div className="hidden flex-col overflow-hidden bg-grain lg:flex">
          <div className="flex items-center justify-between border-b border-border bg-background/60 px-6 py-3 backdrop-blur">
            <span className="text-sm font-medium text-muted-foreground">Live itinerary</span>
            {itinerary ? (
              <Button size="sm" onClick={onSave} disabled={saving} className="gradient-amber text-navy">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bookmark className="mr-2 h-4 w-4" />}
                Save trip
              </Button>
            ) : null}
          </div>
          <ScrollArea className="flex-1">
            <div className="mx-auto max-w-2xl px-6 py-8">
              {itinerary ? (
                <ItineraryView itinerary={itinerary} />
              ) : (
                <div className="grid h-full place-items-center py-24 text-center">
                  <div>
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl gradient-amber text-navy">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="font-display text-xl text-foreground">Your itinerary appears here</p>
                    <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                      Start the chat. As TripMind plans, your day-by-day itinerary materializes here in real time.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile itinerary fallback */}
      {itinerary ? (
        <div className="lg:hidden border-t border-border p-4 bg-background">
          <Button onClick={onSave} disabled={saving} className="w-full gradient-amber text-navy">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bookmark className="mr-2 h-4 w-4" />}
            Save this trip
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl gradient-amber text-navy">
        <Sparkles className="h-5 w-5" />
      </div>
      <h2 className="font-display text-2xl font-semibold text-foreground">Where to next?</h2>
      <p className="mt-2 text-sm text-muted-foreground">Tell me about your trip — or try one of these:</p>
      <div className="mx-auto mt-6 grid max-w-md gap-2">
        {STARTERS.map((s) => (
          <button key={s} onClick={() => onPick(s)} className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition hover:border-amber/60 hover:shadow-soft">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Message({
  m,
  onCopy,
  onShare,
  onRegenerate,
  onNewChat,
  selectedModel,
  onModelChange,
}: {
  m: UIMessage;
  onCopy: (text: string) => void;
  onShare: () => void;
  onRegenerate: () => void;
  onNewChat: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}) {
  const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  // Strip the JSON block from the assistant text in chat (it shows in the right pane)
  const display = m.role === "assistant" ? text.replace(/```json[\s\S]*?```/g, "").trim() : text;

  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm gradient-navy px-4 py-2.5 text-sm text-navy-foreground shadow-soft">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 group/msg">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full gradient-amber text-navy">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="prose prose-sm max-w-none text-foreground prose-headings:font-display prose-strong:text-foreground prose-a:text-amber">
          <ReactMarkdown>{display || "…"}</ReactMarkdown>
        </div>
        
        {/* Action Toolbar - Matching the picture */}
        {display && (
          <div className="flex items-center gap-1.5 mt-2 opacity-70 md:opacity-0 md:group-hover/msg:opacity-100 transition-opacity duration-200">
            {/* Copy Response */}
            <button
              onClick={() => onCopy(display)}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
              title="Copy response"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>

            {/* Model Selector (Brain Icon) */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <button
                  className={`p-1.5 rounded hover:bg-muted transition ${selectedModel !== "gemini-2.5-flash" ? "text-amber font-semibold" : "text-muted-foreground hover:text-foreground"
                    }`}
                  title={`AI Model: ${selectedModel}`}
                >
                  <Brain className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover border border-border">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Select AI Model</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onModelChange("gemini-2.5-flash")} className="flex items-center justify-between text-xs cursor-pointer">
                  <span>Gemini 2.5 Flash (Default)</span>
                  {selectedModel === "gemini-2.5-flash" && <span className="h-1.5 w-1.5 rounded-full bg-amber" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onModelChange("gemini-2.5-pro")} className="flex items-center justify-between text-xs cursor-pointer">
                  <span>Gemini 2.5 Pro (Advanced)</span>
                  {selectedModel === "gemini-2.5-pro" && <span className="h-1.5 w-1.5 rounded-full bg-amber" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Share / Upload Itinerary */}
            <button
              onClick={onShare}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
              title="Share itinerary details"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>

            {/* Regenerate Plan */}
            <button
              onClick={onRegenerate}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
              title="Regenerate trip plan"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>

            {/* More Options (Three dots) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
                  title="More actions"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover border border-border">
                <DropdownMenuItem onClick={() => toast.info("PDF Export coming soon!")} className="text-xs cursor-pointer">
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(m, null, 2));
                  toast.success("Copied debug message metadata!");
                }} className="text-xs cursor-pointer">
                  Copy Debug Metadata
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* New Chat Option (in addition to the other buttons, as requested) */}
            <button
              onClick={onNewChat}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
              title="Start a new chat session"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
