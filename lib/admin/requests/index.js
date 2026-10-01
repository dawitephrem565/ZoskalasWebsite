import { H, ok, fail } from '../../../lib/helpers.js';
import { supabase, dbCheck } from '../../../lib/supabase.js';

export const maxDuration = 15;

export default H(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'Method not allowed');
  if (!dbCheck(res)) return;

  const { data: users, error } = await supabase
    .from('zoscales_users')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[admin requests] select error:', error.message);
    return fail(res, 500, 'Database error');
  }

  const { data: access, error: accErr } = await supabase
    .from('zoscales_member_access')
    .select('user_id, zoscales_images(url)')
    .limit(5000);
  if (accErr) console.error('[admin requests] access error:', accErr.message);

  const urlsByUser = {};
  for (const a of access || []) {
    const u = a.zoscales_images?.url;
    if (!u) continue;
    (urlsByUser[a.user_id] = urlsByUser[a.user_id] || []).push(u);
  }

  const requests = (users || []).map((u) => ({
    ...u,
    image_urls: urlsByUser[u.id] ? urlsByUser[u.id].join(',') : null,
  }));

  return ok(res, { requests });
});
