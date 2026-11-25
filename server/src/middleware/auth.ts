import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { prisma } from '../db.js';
import { env, clientOrigins } from '../env.js';
import { HttpError } from '../lib/http.js';

export const COOKIE_NAME = 'cx_session';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: { id: string; email: string; name: string; role: Role };
      sessionId?: string;
    }
  }
}

export const hashToken = (t: string) => crypto.createHash('sha256').update(t).digest('hex');

export async function createSession(adminUserId: string, req: Request) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 3600_000);
  await prisma.session.create({
    data: { tokenHash: hashToken(token), adminUserId, expiresAt, userAgent: req.get('user-agent')?.slice(0, 250), ip: req.ip },
  });
  return { token, expiresAt };
}

export const cookieOptions = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'lax' as const,
  path: '/',
});

/** Loads the admin for the session cookie, if any. Does not reject. */
export async function loadSession(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (typeof token === 'string' && token) {
      const s = await prisma.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { adminUser: true } });
      if (s && s.expiresAt > new Date() && s.adminUser.active) {
        const u = s.adminUser;
        req.admin = { id: u.id, email: u.email, name: u.name, role: u.role };
        req.sessionId = s.id;
      }
    }
    next();
  } catch (e) { next(e); }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.admin) return next(new HttpError(401, 'Authentication required'));
  next();
}

export const requireRole = (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.admin) return next(new HttpError(401, 'Authentication required'));
  if (!roles.includes(req.admin.role)) return next(new HttpError(403, 'Insufficient permissions'));
  next();
};

/** CSRF defence for cookie-authenticated mutations: custom header + Origin check. */
export function csrfGuard(req: Request, _res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('x-requested-with') !== 'XMLHttpRequest') return next(new HttpError(403, 'Missing CSRF header'));
  const origin = req.get('origin');
  if (origin && !clientOrigins.includes(origin)) return next(new HttpError(403, 'Origin not allowed'));
  next();
}
