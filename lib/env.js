import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load root .env BEFORE any module reads process.env.
// On Vercel, env vars come from the dashboard — this finds nothing and that's fine.
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
