import { H, fail } from '../lib/helpers.js';
import { supabase, dbCheck } from '../lib/supabase.js';
import { buildVcard } from '../lib/vcard.js';

export const maxDuration = 10;

export default H(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'Method not allowed');
  if (!dbCheck(res)) return;

  const { data, error } = await supabase
    .from('zoscales_content')
    .select('key, value')
    .eq('section', 'vcard');
  if (error) {
    console.error('[vcard] select error:', error.message);
    return fail(res, 500, 'Database error');
  }

  const d = {};
  for (const r of data || []) d[r.key] = r.value || '';

  res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="zoskales-vcard.vcf"');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(buildVcard(d));
});
