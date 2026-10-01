import { H, ok, fail } from '../lib/helpers.js';
import { supabase, dbCheck } from '../lib/supabase.js';

export const maxDuration = 10;

export default H(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'Method not allowed');
  if (!dbCheck(res)) return;

  const { data, error } = await supabase
    .from('zoscales_images')
    .select('id, title, url, visibility')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[collection] select error:', error.message);
    return fail(res, 500, 'Database error');
  }
  return ok(res, { images: data || [] });
});
