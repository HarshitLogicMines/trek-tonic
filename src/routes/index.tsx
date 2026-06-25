import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import appPreview from "@/assets/app-preview.jpg";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Wallet,
  MapPin,
  Clock,
  MessageSquare,
  Map,
  Share2,
  Star,
  ArrowRight,
  Check,
  PlaneTakeoff,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TripMind — AI Travel Planner for India & beyond" },
      {
        name: "description",
        content:
          "Tell TripMind your budget, dates, and vibe. Get a complete day-by-day itinerary in under 60 seconds — built for the Indian traveler.",
      },
      { property: "og:title", content: "TripMind — AI Travel Planner" },
      {
        property: "og:description",
        content: "Personalized day-by-day itineraries in under 60 seconds.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Himalayan peaks at golden hour"
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/80 to-background" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-20 pb-12 sm:pt-28 sm:pb-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber/40 bg-cream/10 px-3 py-1 text-xs font-medium text-amber backdrop-blur">
              <Sparkles className="h-3 w-3" /> New · GPT-powered itineraries
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] text-cream text-balance sm:text-6xl md:text-7xl">
              Your next trip,<br />
              planned in <span className="italic text-amber">60 seconds</span>.
            </h1>
            <p className="mt-6 max-w-xl text-base text-cream/80 sm:text-lg">
              Tell TripMind your budget, dates and vibe. Get a complete day-by-day plan —
              hotels, activities, food, transport and costs — instantly.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/plan">
                <Button
                  size="lg"
                  className="gradient-amber px-7 text-navy shadow-glow hover:opacity-95"
                >
                  Start planning — free <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cream/30 bg-transparent text-cream hover:bg-cream/10 hover:text-cream"
                >
                  Sign in
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-cream/70">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-amber" /> No credit card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-amber" /> Free forever plan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-amber" /> Built for India ✦ Works worldwide
              </span>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="pointer-events-none absolute -inset-x-10 -inset-y-6 -z-10 rounded-[2.5rem] bg-amber/20 blur-3xl" />
            <div className="overflow-hidden rounded-2xl border border-cream/15 bg-navy/40 shadow-2xl ring-1 ring-cream/10 backdrop-blur">
              <img
                src={appPreview}
                alt="TripMind itinerary dashboard showing a day-by-day Goa plan"
                className="h-auto w-full"
                width={1600}
                height={1024}
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Logo strip */}
        <div className="border-t border-cream/10 bg-navy/40 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-cream/60">
              Trusted by travellers from
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-display text-lg text-cream/70">
              <span>Bengaluru</span>
              <span className="text-amber/60">·</span>
              <span>Mumbai</span>
              <span className="text-amber/60">·</span>
              <span>Delhi</span>
              <span className="text-amber/60">·</span>
              <span>Singapore</span>
              <span className="text-amber/60">·</span>
              <span>Dubai</span>
              <span className="text-amber/60">·</span>
              <span>London</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 rounded-3xl border border-border bg-card p-8 shadow-soft sm:grid-cols-3 sm:p-10">
          {[
            { k: "120k+", v: "Trips planned" },
            { k: "4.9 / 5", v: "Average traveller rating" },
            { k: "60 sec", v: "Average plan time" },
          ].map((s) => (
            <div key={s.v} className="text-center">
              <div className="font-display text-4xl font-bold text-navy sm:text-5xl">
                {s.k}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
            Why TripMind
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-5xl">
            Everything you need.<br />
            <span className="italic text-muted-foreground">Nothing you don't.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            We replaced 12 browser tabs and a spreadsheet with one calm conversation.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Wallet,
              title: "Budget-first",
              text: "From backpacker to luxury — every plan respects your ₹ down to the last chai.",
            },
            {
              icon: MapPin,
              title: "Local depth",
              text: "Real attractions, real food, real prices. Tuned for Indian destinations end to end.",
            },
            {
              icon: Clock,
              title: "Instant drafts",
              text: "Full day-by-day itineraries stream back in under a minute. Refine as you chat.",
            },
            {
              icon: MessageSquare,
              title: "Conversational",
              text: '"Make day 3 chill" or "swap dinner for street food" — TripMind just gets it.',
            },
            {
              icon: Map,
              title: "Map-aware routing",
              text: "Activities are grouped by neighbourhood so you spend time exploring, not commuting.",
            },
            {
              icon: Share2,
              title: "Share & save",
              text: "Send your plan to friends, save it offline, or export to your favourite calendar.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl gradient-amber text-navy">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="border-y border-border bg-grain">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
              How it works
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-5xl">
              Three steps. One perfect trip.
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Tell us the vibe",
                text: "Destination, dates, budget, who's coming — in plain English.",
              },
              {
                n: "02",
                title: "AI builds your plan",
                text: "A complete day-by-day itinerary streams in under 60 seconds.",
              },
              {
                n: "03",
                title: "Refine & go",
                text: "Tweak any day, save it, share it. Then go enjoy yourself.",
              },
            ].map((s, i) => (
              <div key={s.n} className="relative">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-5xl font-bold text-amber">{s.n}</span>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {s.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {s.text}
                </p>
                {i < 2 && (
                  <ArrowRight className="absolute -right-4 top-2 hidden h-5 w-5 text-amber/40 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
            Loved by travellers
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-5xl">
            Plans you'd actually use.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              quote:
                "Planned a 7-day Ladakh trip in literally one prompt. Costs, stays, even where to eat momos — sorted.",
              name: "Ananya Sharma",
              role: "Solo traveller · Bengaluru",
            },
            {
              quote:
                "We used to argue for hours about Goa plans. TripMind ended that. One plan, both happy.",
              name: "Rohan & Meera",
              role: "Couple · Mumbai",
            },
            {
              quote:
                "Booked a 4-day Bali trip under ₹50k for 2. The itinerary was tighter than what my agent gave me.",
              name: "Karan Mehta",
              role: "Founder · Delhi",
            },
          ].map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex gap-0.5 text-amber">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-foreground">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full gradient-amber font-display text-sm font-semibold text-navy">
                  {t.name[0]}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="px-4 pb-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl gradient-navy p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber/20 blur-3xl" />

          <PlaneTakeoff className="mx-auto mb-5 h-10 w-10 text-amber" />
          <h2 className="font-display text-3xl font-semibold text-cream text-balance sm:text-5xl">
            Pack lighter.<br />Plan smarter.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cream/80">
            Your next adventure is one prompt away. Join thousands of travellers planning
            smarter trips with TripMind.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/plan">
              <Button size="lg" className="gradient-amber px-8 text-navy shadow-glow">
                Plan my trip — free
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                size="lg"
                variant="outline"
                className="border-cream/30 bg-transparent text-cream hover:bg-cream/10 hover:text-cream"
              >
                Create account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TripMind · Made with ♥ for travellers
      </footer>
    </div>
  );
}
