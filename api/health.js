import { H, ok } from '../lib/helpers.js';
import { hasSupabase } from '../lib/supabase.js';

export const maxDuration = 10;

export default H(async (req, res) => ok(res, { ok: true, db: hasSupabase() }));
