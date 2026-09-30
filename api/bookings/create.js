import { H, ok, fail, rateLimit } from '../../lib/helpers.js';
import { supabase, dbCheck } from '../../lib/supabase.js';

export const maxDuration = 10;

export default H(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  if (!dbCheck(res)) return;
  if (!rateLimit(req, 8)) return fail(res, 429, 'Too many requests. Please try again later.');

  const b = req.body || {};
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim();

  if (!name) return fail(res, 400, 'Name is required');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, 'Valid email is required');

  const row = {
    name: name.slice(0, 200),
    email: email.slice(0, 320),
    phone: String(b.phone || '').trim().slice(0, 50),
    consult_type: String(b.consult_type || '').trim().slice(0, 200),
    preferred_date: String(b.preferred_date || '').trim().slice(0, 40),
    showroom: String(b.showroom || '').trim().slice(0, 200),
    message: String(b.message || '').trim().slice(0, 3000),
    status: 'new',
  };

  const { data, error } = await supabase
    .from('zoscales_bookings')
    .insert(row)
    .select()
    .single();
  if (error) {
    console.error('[bookings] insert error:', error.message);
    return fail(res, 500, 'Could not submit your request. Please try again.');
  }

  console.log(`[bookings] New: ${name} <${email}> ${row.phone || ''}`);
  return ok(res, { ok: true, id: data.id });
});
