import adminBookings from '../lib/admin/bookings.js';
import adminStats from '../lib/admin/stats.js';
import adminContent from '../lib/admin/content.js';
import adminImagesIndex from '../lib/admin/images/index.js';
import adminImagesId from '../lib/admin/images/[id].js';
import adminRequestsIndex from '../lib/admin/requests/index.js';
import adminRequestsAccept from '../lib/admin/requests/[id]/accept.js';
import adminRequestsDecline from '../lib/admin/requests/[id]/decline.js';

export const maxDuration = 30;

export default async function handler(req, res) {
  const url = req.url || '';
  const path = url.split('?')[0];

  if (path === '/api/admin/bookings') return adminBookings(req, res);
  if (path === '/api/admin/stats') return adminStats(req, res);
  if (path === '/api/admin/content') return adminContent(req, res);
  
  if (path === '/api/admin/images') return adminImagesIndex(req, res);
  if (path.startsWith('/api/admin/images/')) {
    const id = path.split('/')[4];
    req.query = req.query || {};
    req.query.id = id;
    return adminImagesId(req, res);
  }

  if (path === '/api/admin/requests') return adminRequestsIndex(req, res);
  if (path.startsWith('/api/admin/requests/')) {
    const parts = path.split('/');
    const id = parts[4];
    const action = parts[5];
    req.query = req.query || {};
    req.query.id = id;
    if (action === 'accept') return adminRequestsAccept(req, res);
    if (action === 'decline') return adminRequestsDecline(req, res);
  }

  return res.status(404).json({ error: 'Not found' });
}
