import { createClient } from '@supabase/supabase-js';

// Fallback for build time / missing keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase Environment Variables! Auth will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
