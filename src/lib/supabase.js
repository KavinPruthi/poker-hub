import { createClient } from '@supabase/supabase-js';

// These are the project's public Supabase credentials. The anon key is safe to
// ship in client code by design — row-level security policies on the database
// are what actually protect user data, not the key itself.
const SUPABASE_URL = 'https://jxdbqrdemwhskvilqdbe.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4ZGJxcmRlbXdoc2t2aWxxZGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzQxMDIsImV4cCI6MjA5NjcxMDEwMn0.glnslwqFLSN7DKF7JvLEs8kfyeFTopYHKwNgcT_kSBA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Endpoint + key reused by the AI coach (see src/lib/coach.js).
export const SUPABASE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/poker-coach`;
export { SUPABASE_ANON_KEY };
