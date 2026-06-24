import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://etrvvzeobtzcpwobqava.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_A8qzs4Kjt6RVGQGNAzp9YQ_KjaXy3_X";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);