import { H, ok, fail, now } from '../../lib/helpers.js';
import { supabase, dbCheck } from '../../lib/supabase.js';

export const maxDuration = 10;

export default H(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  if (!dbCheck(res)) return;

  const phone = String(req.body?.phone || '').replace(/\D/g, '');
  const otp = String(req.body?.otp || '').trim();

  const { data: user, error } = await supabase
    .from('zoscales_users')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();
  if (error) {
    console.error('[membership] verify select error:', error.message);
    return fail(res, 500, 'Database error');
  }

  if (!user || user.status !== 'approved') return fail(res, 403, 'Not approved');
  if (!user.otp_code || user.otp_code !== otp) return fail(res, 400, 'Invalid code');
  if (user.otp_expires_at && user.otp_expires_at < now()) {
    return fail(res, 400, 'Code expired. Request a new one.');
  }

  const { error: clrErr } = await supabase
    .from('zoscales_users')
    .update({ otp_code: null, otp_expires_at: null })
    .eq('id', user.id);
  if (clrErr) console.error('[membership] otp clear error:', clrErr.message);

  return ok(res, { ok: true, userId: user.id });
});
