import { H, ok, fail, now } from '../../lib/helpers.js';
import { supabase, dbCheck } from '../../lib/supabase.js';

export const maxDuration = 10;

export default H(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'Method not allowed');
  if (!dbCheck(res)) return;

  const phone = String(req.query?.phone || '').replace(/\D/g, '');
  const { data: user, error } = await supabase
    .from('zoscales_users')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();
  if (error) {
    console.error('[membership] images select error:', error.message);
    return fail(res, 500, 'Database error');
  }
  if (!user) return fail(res, 403, 'Not found');

  const { data: access, error: accErr } = await supabase
    .from('zoscales_member_access')
    .select('duration_hours, expires_at, published_at, zoscales_images(id,title,url,visibility)')
    .eq('user_id', user.id)
    .not('published_at', 'is', null)
    .gt('expires_at', now());
  if (accErr) {
    console.error('[membership] access error:', accErr.message);
    return fail(res, 500, 'Database error');
  }

  const privateImages = (access || [])
    .filter((a) => a.zoscales_images)
    .map((a) => ({
      ...a.zoscales_images,
      expires_at: a.expires_at,
      duration_hours: a.duration_hours,
    }));

  const { data: publicImages, error: pubErr } = await supabase
    .from('zoscales_images')
    .select('id,title,url,visibility')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false });
  if (pubErr) console.error('[membership] public images error:', pubErr.message);

  return ok(res, { privateImages, publicImages: publicImages || [] });
});
