import { H, ok, fail, getId } from '../../../lib/helpers.js';
import { supabase, dbCheck, BUCKET } from '../../../lib/supabase.js';

export const maxDuration = 15;

export default H(async (req, res) => {
  const method = (req.method || '').toUpperCase();
  if (method !== 'DELETE' && method !== 'PATCH') return fail(res, 405, 'Method not allowed');
  if (!dbCheck(res)) return;

  const id = Number(getId(req));
  if (!id) return fail(res, 400, 'Invalid id');

  if (method === 'PATCH') {
    const { visibility } = req.body || {};
    if (visibility !== 'private' && visibility !== 'public') return fail(res, 400, 'Invalid visibility');
    const { data, error } = await supabase
      .from('zoscales_images')
      .update({ visibility })
      .eq('id', id)
      .select('id, title, url, visibility')
      .single();
    if (error) {
      console.error('[admin images] update error:', error.message);
      return fail(res, 500, 'Database error');
    }
    return ok(res, { ok: true, image: data });
  }

  const { data: img } = await supabase
    .from('zoscales_images')
    .select('url')
    .eq('id', id)
    .maybeSingle();

  if (img?.url?.includes(`${BUCKET}/`)) {
    const storagePath = img.url.split(`${BUCKET}/`)[1];
    if (storagePath) {
      const { error: rmErr } = await supabase.storage.from(BUCKET).remove([storagePath]);
      if (rmErr) console.error('[admin images] storage remove error:', rmErr.message);
    }
  }

  const { error } = await supabase.from('zoscales_images').delete().eq('id', id);
  if (error) {
    console.error('[admin images] delete error:', error.message);
    return fail(res, 500, 'Database error');
  }

  return ok(res, { ok: true });
});
