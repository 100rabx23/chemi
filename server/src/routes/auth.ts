import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../db.js';
import { wrap, parse, HttpError } from '../lib/http.js';
import { audit } from '../lib/audit.js';
import { COOKIE_NAME, cookieOptions, createSession, hashToken, requireAuth, csrfGuard } from '../middleware/auth.js';
import { env } from '../env.js';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: env.NODE_ENV === 'test' ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
});

// A real bcrypt hash of a random string so unknown emails take the same time as wrong passwords.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const loginSchema = z.object({ email: z.string().trim().toLowerCase().email().max(200), password: z.string().min(1).max(200) });

authRouter.post('/login', csrfGuard, loginLimiter, wrap(async (req, res) => {
  const { email, password } = parse(loginSchema, req.body);
  const user = await prisma.adminUser.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.active || !ok) throw new HttpError(401, 'Invalid email or password');
  const { token, expiresAt } = await createSession(user.id, req);
  // Opportunistic cleanup of expired sessions.
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), expires: expiresAt });
  req.admin = { id: user.id, email: user.email, name: user.name, role: user.role };
  await audit(req, 'auth.login', 'AdminUser', user.id);
  res.json({ user: req.admin });
}));

authRouter.post('/logout', csrfGuard, wrap(async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (typeof token === 'string' && token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
    if (req.admin) await audit(req, 'auth.logout', 'AdminUser', req.admin.id);
  }
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.json({ ok: true });
}));

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.admin });
});
