import { H, ok, fail } from '../../../lib/helpers.js';
import { supabase, dbCheck, BUCKET } from '../../../lib/supabase.js';

export const maxDuration = 30;

const MAX_B64 = 4_000_000; // ~3MB raw image, under Vercel's 4.5MB body limit

export default H(async (req, res) => {
  if (!dbCheck(res)) return;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('zoscales_images')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[admin images] select error:', error.message);
      return fail(res, 500, 'Database error');
    }
    return ok(res, { images: data || [] });
  }

  if (req.method === 'POST') {
    const { title, visibility, fileBase64 } = req.body || {};
    let b64 = String(fileBase64 || '').replace(/^data:image\/\w+;base64,/, '');
    if (b64.length > MAX_B64) return fail(res, 413, 'Image too large (max ~3MB after compression)');
    if (!b64) return fail(res, 400, 'No image data');

    const buf = Buffer.from(b64, 'base64');
    if (!buf.length) return fail(res, 400, 'Invalid image data');

    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buf, { contentType: 'image/jpeg', upsert: false });
    if (upErr) {
      console.error('[admin images] storage upload error:', upErr.message);
      return fail(res, 500, 'Upload failed: ' + upErr.message);
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const url = pub.publicUrl;

    const vis = visibility === 'private' ? 'private' : 'public';
    const { data: row, error: dbErr } = await supabase
      .from('zoscales_images')
      .insert({ title: title || 'Untitled', url, visibility: vis })
      .select()
      .single();
    if (dbErr) {
      console.error('[admin images] insert error:', dbErr.message);
      return fail(res, 500, 'Database error');
    }

    return ok(res, { ok: true, id: row.id, title: row.title, url, visibility: vis });
  }

  return fail(res, 405, 'Method not allowed');
});
