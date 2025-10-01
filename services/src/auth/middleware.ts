import { eq } from 'drizzle-orm';
import type { Context, Next } from 'hono';
import { z } from 'zod';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';

const TokenSchema = z.string().uuid().or(z.string().email());

export async function authMiddleware(c: Context, next: Next) {
  const token = c.req.header('x-user') || c.req.header('authorization')?.replace('Bearer ', '') || '';
  if (!token || !TokenSchema.safeParse(token).success) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  // Try uuid id first, then email
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(token);
  const looksLikeEmail = token.includes('@');
  let current: any = null;
  try {
    if (isUuid) {
      const byId = await db.select().from(users).where(eq(users.id, token as any)).limit(1);
      current = byId[0] || null;
    }
    if (!current && looksLikeEmail) {
      const byEmail = await db.select().from(users).where(eq(users.email, token)).limit(1);
      current = byEmail[0] || null;
    }
  } catch {
    // ignore and treat as not found
  }
  if (!current) return c.json({ error: 'Unauthorized' }, 401);
  // attach user to context for route handlers
  // @ts-ignore augment context at runtime
  (c as any).user = current;
  c.set('user', current);
  return next();
}

export function getUser<T = any>(c: Context): T | null {
  try { return c.get('user') as T; } catch { return null; }
}
