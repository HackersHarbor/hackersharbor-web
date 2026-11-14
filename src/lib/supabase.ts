
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://xizkneeohymoxlsqjvuh.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXMiLCJyZWYiOiJ4aXprbmVlb2h5bW94bHNxcWp2dWgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4NTk5NTkxOSwiZXhwIjoyMTAxNTcxOTE5fQ.64imsI0fOw1L9AZEh9iV47wf9aF71vuIQaQE3n6Idv0";

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);
