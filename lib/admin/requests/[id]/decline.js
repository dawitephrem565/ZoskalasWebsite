import { H, ok, fail, getId } from '../../../../lib/helpers.js';
import { supabase, dbCheck } from '../../../../lib/supabase.js';

export const maxDuration = 10;

export default H(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  if (!dbCheck(res)) return;

  const id = Number(getId(req));
  if (!id) return fail(res, 400, 'Invalid id');

  const { error } = await supabase
    .from('zoscales_users')
    .update({ status: 'declined', otp_code: null, otp_expires_at: null })
    .eq('id', id);
  if (error) {
    console.error('[admin decline] error:', error.message);
    return fail(res, 500, 'Database error');
  }

  return ok(res, { ok: true });
});
