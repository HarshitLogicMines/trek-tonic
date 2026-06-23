import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getProfile, updateProfile } from "@/lib/profiles.functions";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const INTERESTS = ["Beaches", "Mountains", "History", "Food", "Nightlife", "Wildlife", "Spiritual", "Shopping", "Adventure", "Art"];
const STYLES = ["Adventure", "Relaxation", "Cultural", "Food", "Mixed"];
const PACES = ["Packed", "Balanced", "Relaxed"];
const DIETARY = ["No restriction", "Vegetarian", "Vegan", "Jain", "Halal"];

function Onboarding() {
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getProfile);
  const save = useServerFn(updateProfile);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [homeCity, setHomeCity] = useState("");
  const [travelStyle, setTravelStyle] = useState("Mixed");
  const [pace, setPace] = useState("Balanced");
  const [dietary, setDietary] = useState("No restriction");
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    fetchProfile().then((p) => {
      if (p?.onboarded) { navigate({ to: "/plan" }); return; }
      if (p?.home_city) setHomeCity(p.home_city);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [fetchProfile, navigate]);

  function toggleInterest(i: string) {
    setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  }

  async function submit() {
    setSubmitting(true);
    try {
      await save({ data: {
        home_city: homeCity,
        preferences: { travelStyle, interests, pace, dietary },
        onboarded: true,
      }});
      toast.success("Preferences saved!");
      navigate({ to: "/plan" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally { setSubmitting(false); }
  }

  if (loading) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin text-amber" /></div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-display text-4xl font-semibold text-foreground">Tell us about you</h1>
        <p className="mt-2 text-muted-foreground">We'll tailor every itinerary to your taste. Takes 30 seconds.</p>

        <div className="mt-10 space-y-8">
          <div className="space-y-2">
            <Label htmlFor="city">Home city</Label>
            <Input id="city" placeholder="e.g. Mumbai" value={homeCity} onChange={(e) => setHomeCity(e.target.value)} />
          </div>

          <Section title="Travel style">
            <ChipGroup options={STYLES} value={[travelStyle]} onSelect={(v) => setTravelStyle(v)} />
          </Section>

          <Section title="Pace">
            <ChipGroup options={PACES} value={[pace]} onSelect={(v) => setPace(v)} />
          </Section>

          <Section title="Dietary">
            <ChipGroup options={DIETARY} value={[dietary]} onSelect={(v) => setDietary(v)} />
          </Section>

          <Section title="Interests (pick a few)">
            <ChipGroup options={INTERESTS} value={interests} onSelect={toggleInterest} multi />
          </Section>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => navigate({ to: "/plan" })}>Skip for now</Button>
            <Button onClick={submit} disabled={submitting} className="gradient-amber text-navy">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save & continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm font-medium text-foreground">{title}</Label>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ChipGroup({ options, value, onSelect, multi }: { options: string[]; value: string[]; onSelect: (v: string) => void; multi?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              active ? "border-amber bg-amber text-amber-foreground" : "border-border bg-card text-foreground hover:border-amber/60"
            }`}
            aria-pressed={active}
          >
            {opt}{multi && active ? " ✓" : ""}
          </button>
        );
      })}
    </div>
  );
}
