import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env.js";

export const db = createClient(ENV.SUPABASE.URL, ENV.SUPABASE.SERVICE_KEY);