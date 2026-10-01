import './env.js';
import { createClient } from '@supabase/supabase-js';

export const BUCKET = 'zs-images';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabase = () => Boolean(url && key);

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'service-role-placeholder',
  { auth: { persistSession: false, autoRefreshToken: false } }
);
//

export function dbCheck(res) {
  if (!hasSupabase()) {
    res.status(500).json({ error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured' });
    return false;
  }
  return true;
}
