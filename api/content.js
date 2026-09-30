import { H, ok, fail } from '../lib/helpers.js';
import { supabase, dbCheck } from '../lib/supabase.js';

export const maxDuration = 10;

export default H(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'Method not allowed');
  if (!dbCheck(res)) return;

  const { data, error } = await supabase.from('zoscales_content').select('*');
  if (error) {
    console.error('[content] select error:', error.message);
    return fail(res, 500, 'Database error');
  }

  const content = {};
  for (const r of data || []) {
    content[r.section] = content[r.section] || {};
    content[r.section][r.key] = { value: r.value, image: r.image_url || '' };
  }
  return ok(res, { content });
});
