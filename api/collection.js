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

  let catMap = {};
  try {
    const { data: catRows } = await supabase
      .from('zoscales_content')
      .select('key, value')
      .eq('section', 'image_cat');
    for (const r of catRows || []) catMap[String(r.key)] = r.value || '';
  } catch (e) {
    console.error('[collection] category lookup error:', e.message);
  }

  const images = (data || []).map((im) => ({ ...im, category: catMap[String(im.id)] || '' }));
  return ok(res, { images });
});
