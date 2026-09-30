export const now = () => Math.floor(Date.now() / 1000);
export const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));
export const getId = (req) => req?.params?.id ?? req?.query?.id;

export function setCors(res) {
  res.setHeader?.('Access-Control-Allow-Origin', '*');
  res.setHeader?.('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader?.('Access-Control-Allow-Headers', 'Content-Type');
}

export const ok = (res, data = {}) => res.status(200).json(data);
export const fail = (res, status, error) => res.status(status).json({ error });

const buckets = new Map();
export function rateLimit(req, max = 20, windowMs = 15 * 60 * 1000) {
  const key =
    req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
    req?.ip ||
    req?.socket?.remoteAddress ||
    'anon';
  const t = Date.now();
  const list = (buckets.get(key) || []).filter((x) => t - x < windowMs);
  if (list.length >= max) return false;
  list.push(t);
  buckets.set(key, list);
  return true;
}

export function H(fn) {
  return async (req, res) => {
    setCors(res);
    if ((req.method || '').toUpperCase() === 'OPTIONS') return res.status(204).end();
    try {
      return await fn(req, res);
    } catch (err) {
      console.error('[api]', req?.url || req?.path || '', err);
      if (!res.headersSent) return fail(res, 500, err.message || 'Server error');
    }
  };
}
