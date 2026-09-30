import { H, ok, fail, now, genOtp } from '../../lib/helpers.js';
import { supabase, dbCheck } from '../../lib/supabase.js';

export const maxDuration = 10;

export default H(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  if (!dbCheck(res)) return;

  const phone = String(req.body?.phone || '').replace(/\D/g, '');
  if (phone.length < 7) return fail(res, 400, 'Please enter a valid phone number');

  let { data: user, error } = await supabase
    .from('zoscales_users')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();
  if (error) {
    console.error('[membership] select error:', error.message);
    return fail(res, 500, 'Database error');
  }

  if (!user) {
    const { data: created, error: insErr } = await supabase
      .from('zoscales_users')
      .insert({ phone, status: 'pending' })
      .select()
      .single();
    if (insErr) {
      if (insErr.code === '23505') {
        const again = await supabase
          .from('zoscales_users')
          .select('*')
          .eq('phone', phone)
          .single();
        user = again.data;
      } else {
        console.error('[membership] insert error:', insErr.message);
        return fail(res, 500, 'Database error');
      }
    } else {
      user = created;
    }
  }

  if (user.status === 'approved') {
    const otp = genOtp();
    const expires = now() + 15 * 60;
    const { error: updErr } = await supabase
      .from('zoscales_users')
      .update({ otp_code: otp, otp_expires_at: expires })
      .eq('id', user.id);
    if (updErr) {
      console.error('[membership] otp update error:', updErr.message);
      return fail(res, 500, 'Database error');
    }
    console.log(`[membership] OTP for ${phone}: ${otp}`);
    return ok(res, { status: 'approved', needsOtp: true, phone });
  }

  if (user.status === 'declined') {
    return ok(res, { status: 'declined', message: 'Your request was declined. Contact support.' });
  }

  return ok(res, { status: 'pending', message: 'Your request is awaiting admin approval.' });
});
