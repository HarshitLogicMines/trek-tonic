import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getTrip, deleteTrip } from "@/lib/trips.functions";
import { ItineraryView } from "@/components/itinerary-view";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import type { Itinerary } from "@/types/itinerary";
import { toast } from "sonner";
import { Loader2, Trash2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/itinerary/$id")({
  component: ItineraryPage,
});

function ItineraryPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const fetchTrip = useServerFn(getTrip);
  const remove = useServerFn(deleteTrip);
  const [trip, setTrip] = useState<{ title: string; itinerary: Itinerary } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrip({ data: { id } })
      .then((row) => setTrip({ title: row.title, itinerary: row.itinerary as unknown as Itinerary }))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [fetchTrip, id]);

  async function onDelete() {
    if (!confirm("Delete this trip?")) return;
    try {
      await remove({ data: { id } });
      toast.success("Trip deleted");
      navigate({ to: "/saved" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/saved" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> All trips
          </Button>
          {trip ? (
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          ) : null}
        </div>

        {loading ? (
          <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-amber" /></div>
        ) : trip?.itinerary ? (
          <ItineraryView itinerary={trip.itinerary} />
        ) : (
          <p className="text-muted-foreground">Trip not found.</p>
        )}
      </div>
    </div>
  );
}
