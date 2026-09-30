import { H, ok, fail, getId } from '../../lib/helpers.js';
import { supabase, dbCheck } from '../../lib/supabase.js';

export const maxDuration = 15;

export default H(async (req, res) => {
  if (!dbCheck(res)) return;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('zoscales_bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) {
      console.error('[admin bookings] select error:', error.message);
      return fail(res, 500, 'Database error');
    }
    return ok(res, { bookings: data || [] });
  }

  if (req.method === 'PATCH') {
    const id = Number(req.body?.id ?? getId(req));
    const status = String(req.body?.status || '');
    if (!id || !['new', 'contacted', 'closed'].includes(status)) {
      return fail(res, 400, 'Invalid id or status');
    }
    const { error } = await supabase
      .from('zoscales_bookings')
      .update({ status })
      .eq('id', id);
    if (error) {
      console.error('[admin bookings] update error:', error.message);
      return fail(res, 500, 'Database error');
    }
    return ok(res, { ok: true });
  }

  return fail(res, 405, 'Method not allowed');
});
