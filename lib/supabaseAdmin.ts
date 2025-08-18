// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Friendly errors in dev
if (!url) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL. Set it in .env.local");
}
if (!key) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (server-only). Set it in .env.local");
}

export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false },
});
