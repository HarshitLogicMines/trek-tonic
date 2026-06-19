import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg gradient-amber text-navy">
            <Compass className="h-4 w-4" strokeWidth={2.5} />
          </span>
          TripMind
        </Link>
        <nav className="flex items-center gap-2">
          {authed ? (
            <>
              <Link to="/saved" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline">Saved</Link>
              <Link to="/plan">
                <Button size="sm" className="gradient-amber text-navy hover:opacity-90">Plan a trip</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={signOut}>Sign out</Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="gradient-amber text-navy hover:opacity-90">Sign in</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
