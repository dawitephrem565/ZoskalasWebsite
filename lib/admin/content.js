import { H, ok, fail, now } from '../../lib/helpers.js';
import { supabase, dbCheck } from '../../lib/supabase.js';

export const maxDuration = 10;

export default H(async (req, res) => {
  if (!dbCheck(res)) return;

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('zoscales_content').select('*');
    if (error) {
      console.error('[admin content] select error:', error.message);
      return fail(res, 500, 'Database error');
    }
    return ok(res, { content: data || [] });
  }

  if (req.method === 'PUT') {
    const { section, key, value, imageUrl } = req.body || {};
    if (!section || !key) return fail(res, 400, 'section and key required');

    const { error } = await supabase.from('zoscales_content').upsert(
      {
        section,
        key,
        value: value || '',
        image_url: imageUrl || '',
        updated_at: now(),
      },
      { onConflict: 'section,key' }
    );
    if (error) {
      console.error('[admin content] upsert error:', error.message);
      return fail(res, 500, 'Database error');
    }
    return ok(res, { ok: true });
  }

  return fail(res, 405, 'Method not allowed');
});
