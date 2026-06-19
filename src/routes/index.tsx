import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Sparkles, Wallet, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TripMind — AI Travel Planner for India & beyond" },
      { name: "description", content: "Tell TripMind your budget, dates, and vibe. Get a complete day-by-day itinerary in under 60 seconds — built for the Indian traveler." },
      { property: "og:title", content: "TripMind — AI Travel Planner" },
      { property: "og:description", content: "Personalized day-by-day itineraries in under 60 seconds." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Himalayan peaks at golden hour" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/60 to-navy/95" />
        </div>
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-28 text-center sm:py-36">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber/40 bg-navy/30 px-3 py-1 text-xs font-medium text-amber backdrop-blur">
            <Sparkles className="h-3 w-3" /> AI-powered, built for Indian travelers
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight text-cream text-balance sm:text-6xl md:text-7xl">
            Your next trip,<br />planned in <span className="text-amber italic">60 seconds</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-cream/80 sm:text-lg">
            Tell us your budget, dates, and what you love. TripMind crafts a complete day-by-day itinerary — hotels, activities, food, and costs — instantly.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/plan">
              <Button size="lg" className="gradient-amber px-7 text-navy shadow-glow hover:opacity-95">
                Start planning — free
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="border-cream/30 bg-transparent text-cream hover:bg-cream/10 hover:text-cream">
                Sign in
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-xs text-cream/60">"Plan a 5-day Goa trip for 2 under ₹40,000" — try it</p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Wallet, title: "Budget-first", text: "Itineraries that respect your ₹ — backpacker to luxury, we fit every plan to your wallet." },
            { icon: MapPin, title: "Local depth", text: "Real attractions, real food, real prices. Tuned for Indian destinations end to end." },
            { icon: Clock, title: "Instant drafts", text: "Conversational planning. Refine your trip live as the AI streams a full plan back to you." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl gradient-amber text-navy">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="border-t border-border bg-grain">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">Pack lighter. Plan smarter.</h2>
          <p className="max-w-xl text-muted-foreground">Stop juggling 12 browser tabs. Get one complete plan, ready to go.</p>
          <Link to="/plan"><Button size="lg" className="gradient-amber text-navy">Plan my trip</Button></Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TripMind · Made for travelers
      </footer>
    </div>
  );
}
