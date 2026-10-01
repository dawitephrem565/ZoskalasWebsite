import { H, ok, fail, getId, now, genOtp } from '../../../../lib/helpers.js';
import { supabase, dbCheck } from '../../../../lib/supabase.js';

export const maxDuration = 15;

export default H(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  if (!dbCheck(res)) return;

  const id = Number(getId(req));
  if (!id) return fail(res, 400, 'Invalid id');

  const { data: user, error: uErr } = await supabase
    .from('zoscales_users')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (uErr) {
    console.error('[admin accept] user error:', uErr.message);
    return fail(res, 500, 'Database error');
  }
  if (!user) return fail(res, 404, 'User not found');

  const body = req.body || {};
  const imageIds = (Array.isArray(body.imageIds) ? body.imageIds : [])
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
  const durationHours = Math.max(1, Math.min(720, Number(body.durationHours) || 1));

  const ts = now();
  const otp = genOtp();

  const { error: updErr } = await supabase
    .from('zoscales_users')
    .update({
      status: 'approved',
      otp_code: otp,
      otp_expires_at: ts + 15 * 60,
      approved_at: ts,
    })
    .eq('id', id);
  if (updErr) {
    console.error('[admin accept] update error:', updErr.message);
    return fail(res, 500, 'Database error');
  }

  const { error: delErr } = await supabase
    .from('zoscales_member_access')
    .delete()
    .eq('user_id', id);
  if (delErr) {
    console.error('[admin accept] delete access error:', delErr.message);
    return fail(res, 500, 'Database error');
  }

  if (imageIds.length) {
    const rows = imageIds.map((imageId) => ({
      user_id: id,
      image_id: imageId,
      duration_hours: durationHours,
      published_at: ts,
      expires_at: ts + durationHours * 3600,
    }));
    const { error: insErr } = await supabase
      .from('zoscales_member_access')
      .upsert(rows, { onConflict: 'user_id,image_id' });
    if (insErr) {
      console.error('[admin accept] insert access error:', insErr.message);
      return fail(res, 500, 'Database error');
    }
  }

  console.log(`[admin] Approved ${user.phone} OTP: ${otp}`);
  return ok(res, { ok: true, otp, phone: user.phone });
});
