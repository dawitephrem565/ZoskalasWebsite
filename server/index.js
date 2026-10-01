import '../lib/env.js';

import express from 'express';
import cors from 'cors';

import health from '../api/health.js';
import content from '../api/content.js';
import vcard from '../api/vcard.js';
import collection from '../api/collection.js';
import membershipRequest from '../api/membership/request.js';
import membershipVerify from '../api/membership/verify.js';
import membershipImages from '../api/membership/images.js';
import bookingsCreate from '../api/bookings/create.js';
import adminBookings from '../lib/admin/bookings.js';
import adminStats from '../lib/admin/stats.js';
import adminContent from '../lib/admin/content.js';
import adminImages from '../lib/admin/images/index.js';
import adminImageId from '../lib/admin/images/[id].js';
import adminRequests from '../lib/admin/requests/index.js';
import adminAccept from '../lib/admin/requests/[id]/accept.js';
import adminDecline from '../lib/admin/requests/[id]/decline.js';
import tryOnFinish from '../api/tryon/finish.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  const t = Date.now();
  res.on('finish', () => console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - t}ms)`));
  next();
});

app.all('/health', health);
app.all('/api/content', content);
app.all('/api/vcard', vcard);
app.all('/api/collection', collection);
app.all('/api/membership/request', membershipRequest);
app.all('/api/membership/verify', membershipVerify);
app.all('/api/membership/images', membershipImages);
app.all('/api/bookings/create', bookingsCreate);
app.all('/api/admin/bookings', adminBookings);
app.all('/api/admin/stats', adminStats);
app.all('/api/admin/content', adminContent);
app.all('/api/admin/images', adminImages);
app.all('/api/admin/images/:id', adminImageId);
app.all('/api/admin/requests', adminRequests);
app.all('/api/admin/requests/:id/accept', adminAccept);
app.all('/api/admin/requests/:id/decline', adminDecline);
app.all('/api/tryon/finish', tryOnFinish);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Local API server: http://localhost:${PORT}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL ? 'configured' : 'MISSING'}`);
  console.log(`Gemini: ${process.env.GEMINI_API_KEY ? 'configured' : 'MISSING'}`);
});

server.on('error', (err) => {
  console.error('[server] listen error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`[server] Port ${PORT} already in use — another API instance is running. Exiting.`);
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('[fatal] uncaughtException (server kept alive):', err?.stack || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[fatal] unhandledRejection (server kept alive):', reason?.stack || reason);
});
