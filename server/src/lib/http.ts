import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodTypeAny, type z } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => { fn(req, res, next).catch(next); };

export function parse<T extends ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const r = schema.safeParse(data);
  if (!r.success) throw new HttpError(400, 'Validation failed', r.error.flatten().fieldErrors);
  return r.data;
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, details: err.details });
  if (err instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: err.flatten().fieldErrors });
  const e = err as { code?: string; type?: string };
  if (e?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  if (e?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large (max 4 MB)' });
  if (e?.code === 'P2002') return res.status(409).json({ error: 'A record with that unique value already exists' });
  if (e?.code === 'P2025') return res.status(404).json({ error: 'Record not found' });
  if (e?.code === 'P2003') return res.status(409).json({ error: 'Record is still referenced by other data' });
  console.error(`[error] ${req.method} ${req.path}`, err);
  res.status(500).json({ error: 'Internal server error' });
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

export const paging = (q: Record<string, unknown>) => {
  const page = Math.max(1, Number(q.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(q.pageSize) || 20));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
};
