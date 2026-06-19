import type { Itinerary } from "@/types/itinerary";
import { formatCurrency } from "@/lib/itinerary-parser";
import { MapPin, Utensils, Bus, BedDouble, Sparkles, Clock, Backpack, Wallet, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const CATEGORY_ICON = {
  attraction: MapPin, food: Utensils, transport: Bus, accommodation: BedDouble, experience: Sparkles,
} as const;

export function ItineraryView({ itinerary, compact = false }: { itinerary: Itinerary; compact?: boolean }) {
  const currency = itinerary.currency ?? "INR";
  const daysTotal = itinerary.days?.reduce((s, d) => s + (d.estimatedCost ?? 0), 0) ?? 0;
  const lodging = itinerary.accommodation?.[0]?.pricePerNight ?? 0;
  const estTotal = daysTotal + lodging * Math.max(0, (itinerary.duration ?? 1) - 1);
  const pct = itinerary.totalBudget ? Math.min(100, Math.round((estTotal / itinerary.totalBudget) * 100)) : 0;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <p className="text-xs uppercase tracking-wide text-amber">{itinerary.destination}</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">{itinerary.title}</h2>
        {itinerary.intro ? <p className="mt-3 text-sm text-muted-foreground">{itinerary.intro}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary"><Calendar className="mr-1 h-3 w-3" />{itinerary.duration} days</Badge>
          <Badge variant="secondary"><Wallet className="mr-1 h-3 w-3" />{formatCurrency(itinerary.totalBudget, currency)} budget</Badge>
          <Badge variant="secondary">{itinerary.groupSize} {itinerary.groupSize === 1 ? "traveler" : "travelers"}</Badge>
        </div>
        {itinerary.totalBudget ? (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>Estimated cost</span>
              <span className="font-medium text-foreground">{formatCurrency(estTotal, currency)} / {formatCurrency(itinerary.totalBudget, currency)}</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        ) : null}
      </header>

      {itinerary.days?.length ? (
        <Tabs defaultValue={String(itinerary.days[0].day)}>
          <TabsList className="flex w-full flex-wrap">
            {itinerary.days.map((d) => (
              <TabsTrigger key={d.day} value={String(d.day)} className="flex-1">Day {d.day}</TabsTrigger>
            ))}
          </TabsList>
          {itinerary.days.map((d) => (
            <TabsContent key={d.day} value={String(d.day)} className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-xl font-semibold text-foreground">{d.theme}</h3>
                <span className="text-sm text-muted-foreground">{formatCurrency(d.estimatedCost ?? 0, currency)}</span>
              </div>
              {d.activities?.map((a, idx) => {
                const Icon = CATEGORY_ICON[a.category] ?? MapPin;
                return (
                  <div key={idx} className="rounded-xl border border-border bg-card p-4 shadow-soft">
                    <div className="flex items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg gradient-amber text-navy">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-xs font-medium text-amber">{a.time}</span>
                          <span className="text-xs text-muted-foreground"><Clock className="mr-0.5 inline h-3 w-3" />{a.duration}</span>
                        </div>
                        <h4 className="mt-1 font-medium text-foreground">{a.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-muted-foreground"><MapPin className="mr-0.5 inline h-3 w-3" />{a.location}</span>
                          <span className="font-medium text-foreground">{formatCurrency(a.cost ?? 0, currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      ) : null}

      {!compact && itinerary.accommodation?.length ? (
        <Card title="Stay" icon={BedDouble}>
          <div className="grid gap-3 sm:grid-cols-3">
            {itinerary.accommodation.map((s, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <p className="text-xs uppercase text-amber">{s.tier}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{s.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(s.pricePerNight, currency)} / night</p>
                {s.notes ? <p className="mt-2 text-xs text-muted-foreground">{s.notes}</p> : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {!compact && itinerary.foodRecommendations?.length ? (
        <Card title="Must-try food" icon={Utensils}>
          <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
            {itinerary.foodRecommendations.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </Card>
      ) : null}

      {!compact && itinerary.transportTips?.length ? (
        <Card title="Getting around" icon={Bus}>
          <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
            {itinerary.transportTips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </Card>
      ) : null}

      {!compact && itinerary.packingList?.length ? (
        <Card title="Packing list" icon={Backpack}>
          <div className="flex flex-wrap gap-2">
            {itinerary.packingList.map((p, i) => <Badge key={i} variant="outline">{p}</Badge>)}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <Icon className="h-4 w-4 text-amber" /> {title}
      </h3>
      {children}
    </section>
  );
}
