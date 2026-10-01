import { H, ok, fail } from '../../lib/helpers.js';
import { supabase, dbCheck } from '../../lib/supabase.js';

export const maxDuration = 10;

export default H(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'Method not allowed');
  if (!dbCheck(res)) return;

  const countHead = async (table, filter) => {
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    if (filter) q = filter(q);
    const { count, error } = await q;
    if (error) {
      console.error('[admin] count error:', error.message);
      throw new Error(error.message);
    }
    return count || 0;
  };

  const [pending, approved, declined, images, privateCount] = await Promise.all([
    countHead('zoscales_users', (q) => q.eq('status', 'pending')),
    countHead('zoscales_users', (q) => q.eq('status', 'approved')),
    countHead('zoscales_users', (q) => q.eq('status', 'declined')),
    countHead('zoscales_images'),
    countHead('zoscales_images', (q) => q.eq('visibility', 'private')),
  ]);

  return ok(res, { pending, approved, declined, images, privateCount });
});
