import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const PrefsSchema = z.object({
  travelStyle: z.string().optional(),
  interests: z.array(z.string()).optional(),
  groupType: z.string().optional(),
  pace: z.string().optional(),
  dietary: z.string().optional(),
  budgetTier: z.string().optional(),
});

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const UpdateInput = z.object({
  display_name: z.string().max(120).optional(),
  home_city: z.string().max(120).optional(),
  preferences: PrefsSchema.optional(),
  onboarded: z.boolean().optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateInput.parse(d))
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = { ...data };
    const { data: row, error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, ...patch })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
