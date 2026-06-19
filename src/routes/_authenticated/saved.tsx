import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listTrips } from "@/lib/trips.functions";
import { formatCurrency } from "@/lib/itinerary-parser";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, MapPin, Calendar, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved trips — TripMind" }] }),
  component: SavedPage,
});

type Trip = Awaited<ReturnType<typeof listTrips>>[number];

function SavedPage() {
  const fetchTrips = useServerFn(listTrips);
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[] | null>(null);

  useEffect(() => {
    fetchTrips()
      .then(setTrips)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load"));
  }, [fetchTrips]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">Your trips</h1>
            <p className="mt-1 text-sm text-muted-foreground">Every plan you've saved.</p>
          </div>
          <Link to="/plan"><Button className="gradient-amber text-navy"><Plus className="mr-2 h-4 w-4" />New trip</Button></Link>
        </div>

        {trips === null ? (
          <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-amber" /></div>
        ) : trips.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="font-display text-xl text-foreground">No trips yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Start planning your first adventure.</p>
            <Link to="/plan" className="mt-5 inline-block">
              <Button className="gradient-amber text-navy">Plan a trip</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate({ to: "/itinerary/$id", params: { id: t.id } })}
                className="group rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-amber/60 hover:shadow-glow"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="capitalize">{t.status}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground group-hover:text-amber">{t.title}</h3>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{t.destination}</p>
                  <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{t.duration} days · {t.group_size} {t.group_size === 1 ? "traveler" : "travelers"}</p>
                  <p className="flex items-center gap-2"><Wallet className="h-3.5 w-3.5" />{formatCurrency(Number(t.budget), (t.currency === "USD" ? "USD" : "INR"))}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
