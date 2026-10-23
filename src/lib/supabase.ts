import { createClient } from "@supabase/supabase-js";

// Publishable key only: safe in the browser because row-level security limits access to signed-in users.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
