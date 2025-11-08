import React from 'react'
import { createClient } from "@supabase/supabase-js";

export const ConnectDatabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

);

export default ConnectDatabase;

// For testing:
// ALTER TABLE people ENABLE ROW LEVEL SECURITY;

// CREATE POLICY "Allow anon inserts for people"
// ON people
// FOR INSERT
// TO anon
// WITH CHECK (true);
