import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8080;
export const PORTAL_BASE = process.env.PORTAL_BASE || ''; // p.sh. http://example.com:8080
export const PORTAL_PATH = process.env.PORTAL_PATH || '/c';
export const DEFAULT_UA = process.env.DEFAULT_UA || 'MAG250/5.0-0';
export const DEFAULT_MAC = process.env.DEFAULT_MAC || '';
export const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*';