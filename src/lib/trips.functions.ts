import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ItinerarySchema = z.unknown();

const CreateTripInput = z.object({
  title: z.string().min(1).max(200),
  destination: z.string().min(1).max(200),
  duration: z.number().int().min(1).max(60),
  budget: z.number().nonnegative(),
  currency: z.string().min(1).max(8).default("INR"),
  groupSize: z.number().int().min(1).max(50).default(1),
  itinerary: ItinerarySchema,
});

export const createTrip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateTripInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("trips")
      .insert({
        user_id: userId,
        title: data.title,
        destination: data.destination,
        duration: data.duration,
        budget: data.budget,
        currency: data.currency,
        group_size: data.groupSize,
        itinerary: data.itinerary as never,
        status: "planned",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listTrips = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("trips")
      .select("id,title,destination,duration,budget,currency,group_size,status,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getTrip = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("trips")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteTrip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("trips").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
