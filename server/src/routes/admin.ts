import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { env } from '../env.js';
import { wrap, parse, HttpError, paging, slugify } from '../lib/http.js';
import { audit } from '../lib/audit.js';
import { csrfGuard, requireAuth, requireRole } from '../middleware/auth.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, csrfGuard);

const adminOnly = requireRole('ADMIN');
const str = (max: number) => z.string().trim().max(max);
const imageUrl = z.string().trim().max(500).refine((v) => /^(\/uploads\/|\/images\/|https:\/\/)/.test(v), 'Invalid image URL');

// ---------- dashboard ----------

adminRouter.get('/stats', wrap(async (_req, res) => {
  const [products, categories, newInquiries, pendingInquiries, newMessages, recent] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.inquiry.count({ where: { status: 'NEW' } }),
    prisma.inquiry.count({ where: { status: { in: ['NEW', 'IN_PROGRESS'] } } }),
    prisma.contactMessage.count({ where: { status: 'NEW' } }),
    prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 6, include: { items: { select: { productName: true } } } }),
  ]);
  res.json({ products, categories, newInquiries, pendingInquiries, newMessages, recentInquiries: recent });
}));

// ---------- uploads ----------

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024, files: 1 } });

function sniff(buf: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length > 12 && buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}

adminRouter.post('/uploads', upload.single('file'), wrap(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No file uploaded (field name "file")');
  const ext = sniff(req.file.buffer);
  if (!ext) throw new HttpError(415, 'Only JPEG, PNG or WebP images are allowed');
  const name = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  await fs.mkdir(env.UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(env.UPLOAD_DIR, name), req.file.buffer);
  await audit(req, 'upload.create', 'Upload', name);
  res.status(201).json({ url: `/uploads/${name}` });
}));

// ---------- categories ----------

const categorySchema = z.object({
  name: str(120).min(2),
  slug: str(80).optional(),
  tagline: str(300).nullish().transform((v) => v || null),
  description: str(2000).nullish().transform((v) => v || null),
  imageUrl: imageUrl.nullish().transform((v) => v || null),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

adminRouter.get('/categories', wrap(async (_req, res) => {
  const items = await prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], include: { _count: { select: { products: true } } } });
  res.json({ items: items.map(({ _count, ...c }) => ({ ...c, productCount: _count.products })) });
}));

adminRouter.post('/categories', wrap(async (req, res) => {
  const d = parse(categorySchema, req.body);
  const c = await prisma.category.create({ data: { ...d, slug: slugify(d.slug || d.name) } });
  await audit(req, 'category.create', 'Category', c.id, { name: c.name });
  res.status(201).json(c);
}));

adminRouter.put('/categories/:id', wrap(async (req, res) => {
  const d = parse(categorySchema, req.body);
  const c = await prisma.category.update({ where: { id: String(req.params.id) }, data: { ...d, slug: slugify(d.slug || d.name) } });
  await audit(req, 'category.update', 'Category', c.id, { name: c.name });
  res.json(c);
}));

adminRouter.delete('/categories/:id', adminOnly, wrap(async (req, res) => {
  const id = String(req.params.id);
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) throw new HttpError(409, `Category still has ${count} product(s). Move or delete them first.`);
  await prisma.category.delete({ where: { id } });
  await audit(req, 'category.delete', 'Category', id);
  res.json({ ok: true });
}));

// ---------- products ----------

const productSchema = z.object({
  name: str(200).min(2),
  slug: str(100).optional(),
  description: str(4000).min(5),
  categoryId: z.string().min(1),
  imageUrl: imageUrl.nullish().transform((v) => v || null),
  specifications: z.array(z.object({ label: str(80).min(1), value: str(200).min(1) })).max(30).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

adminRouter.get('/products', wrap(async (req, res) => {
  const { page, pageSize, skip, take } = paging(req.query);
  const where: Prisma.ProductWhereInput = {};
  const { search, category, published } = req.query;
  if (typeof category === 'string' && category) where.categoryId = category;
  if (published === 'true' || published === 'false') where.published = published === 'true';
  if (typeof search === 'string' && search.trim()) where.name = { contains: search.trim().slice(0, 80), mode: 'insensitive' };
  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, skip, take, orderBy: [{ updatedAt: 'desc' }], include: { category: { select: { id: true, name: true, slug: true } } } }),
  ]);
  res.json({ items, total, page, pageSize });
}));

adminRouter.get('/products/:id', wrap(async (req, res) => {
  const p = await prisma.product.findUnique({ where: { id: String(req.params.id) }, include: { category: true } });
  if (!p) throw new HttpError(404, 'Product not found');
  res.json(p);
}));

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base || 'product';
  for (let i = 2; await prisma.product.findFirst({ where: { slug, id: excludeId ? { not: excludeId } : undefined } }); i++) slug = `${base}-${i}`;
  return slug;
}

adminRouter.post('/products', wrap(async (req, res) => {
  const d = parse(productSchema, req.body);
  if (!(await prisma.category.findUnique({ where: { id: d.categoryId } }))) throw new HttpError(400, 'Unknown category');
  const p = await prisma.product.create({ data: { ...d, slug: await uniqueSlug(slugify(d.slug || d.name)) } });
  await audit(req, 'product.create', 'Product', p.id, { name: p.name });
  res.status(201).json(p);
}));

adminRouter.put('/products/:id', wrap(async (req, res) => {
  const id = String(req.params.id);
  const d = parse(productSchema, req.body);
  if (!(await prisma.category.findUnique({ where: { id: d.categoryId } }))) throw new HttpError(400, 'Unknown category');
  const p = await prisma.product.update({ where: { id }, data: { ...d, slug: await uniqueSlug(slugify(d.slug || d.name), id) } });
  await audit(req, 'product.update', 'Product', p.id, { name: p.name });
  res.json(p);
}));

adminRouter.delete('/products/:id', adminOnly, wrap(async (req, res) => {
  const id = String(req.params.id);
  const p = await prisma.product.delete({ where: { id } });
  await audit(req, 'product.delete', 'Product', id, { name: p.name });
  res.json({ ok: true });
}));

// ---------- inquiries ----------

adminRouter.get('/inquiries', wrap(async (req, res) => {
  const { page, pageSize, skip, take } = paging(req.query);
  const where: Prisma.InquiryWhereInput = {};
  const { status, search } = req.query;
  if (typeof status === 'string' && ['NEW', 'IN_PROGRESS', 'QUOTED', 'CLOSED', 'SPAM'].includes(status)) where.status = status as never;
  if (typeof search === 'string' && search.trim()) {
    const s = search.trim().slice(0, 80);
    where.OR = [
      { customerName: { contains: s, mode: 'insensitive' } },
      { companyName: { contains: s, mode: 'insensitive' } },
      { email: { contains: s, mode: 'insensitive' } },
      { reference: { contains: s, mode: 'insensitive' } },
    ];
  }
  const [total, items] = await Promise.all([
    prisma.inquiry.count({ where }),
    prisma.inquiry.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { items: true } }),
  ]);
  res.json({ items, total, page, pageSize });
}));

adminRouter.get('/inquiries/:id', wrap(async (req, res) => {
  const i = await prisma.inquiry.findUnique({ where: { id: String(req.params.id) }, include: { items: true } });
  if (!i) throw new HttpError(404, 'Inquiry not found');
  res.json(i);
}));

const inquiryPatch = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'QUOTED', 'CLOSED', 'SPAM']).optional(),
  internalNotes: str(5000).nullish(),
}).refine((v) => v.status !== undefined || v.internalNotes !== undefined, 'Nothing to update');

adminRouter.patch('/inquiries/:id', wrap(async (req, res) => {
  const d = parse(inquiryPatch, req.body);
  const i = await prisma.inquiry.update({ where: { id: String(req.params.id) }, data: d, include: { items: true } });
  await audit(req, 'inquiry.update', 'Inquiry', i.id, { status: d.status, notesChanged: d.internalNotes !== undefined });
  res.json(i);
}));

// ---------- messages ----------

adminRouter.get('/messages', wrap(async (req, res) => {
  const { page, pageSize, skip, take } = paging(req.query);
  const where: Prisma.ContactMessageWhereInput = {};
  const { status, search } = req.query;
  if (typeof status === 'string' && ['NEW', 'READ', 'REPLIED', 'ARCHIVED'].includes(status)) where.status = status as never;
  if (typeof search === 'string' && search.trim()) {
    const s = search.trim().slice(0, 80);
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { email: { contains: s, mode: 'insensitive' } },
      { message: { contains: s, mode: 'insensitive' } },
    ];
  }
  const [total, items] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
  ]);
  res.json({ items, total, page, pageSize });
}));

adminRouter.patch('/messages/:id', wrap(async (req, res) => {
  const d = parse(z.object({ status: z.enum(['NEW', 'READ', 'REPLIED', 'ARCHIVED']) }), req.body);
  const m = await prisma.contactMessage.update({ where: { id: String(req.params.id) }, data: d });
  await audit(req, 'message.update', 'ContactMessage', m.id, d);
  res.json(m);
}));

// ---------- settings ----------

const settingsSchema = z.object({
  contact: z.object({
    companyName: str(120), address: str(300), phone: str(40),
    emailGeneral: str(200), emailSales: str(200), emailExports: str(200),
    facebook: str(300), instagram: str(300), linkedin: str(300), mapQuery: str(300),
  }).partial().optional(),
  notifications: z.object({ notifyEmail: str(200).refine((v) => v === '' || z.string().email().safeParse(v).success, 'Invalid email') }).optional(),
  testimonials: z.object({
    visible: z.boolean(),
    items: z.array(z.object({ name: str(120), role: str(160), company: str(160), quote: str(1200) })).max(12),
  }).optional(),
});

adminRouter.get('/settings', wrap(async (_req, res) => {
  const rows = await prisma.siteSetting.findMany();
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
}));

adminRouter.put('/settings', adminOnly, wrap(async (req, res) => {
  const d = parse(settingsSchema, req.body);
  for (const [key, value] of Object.entries(d)) {
    if (value === undefined) continue;
    await prisma.siteSetting.upsert({ where: { key }, create: { key, value: value as never }, update: { value: value as never } });
  }
  await audit(req, 'settings.update', 'SiteSetting', null, { keys: Object.keys(d) });
  const rows = await prisma.siteSetting.findMany();
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
}));

// ---------- profile ----------

adminRouter.get('/profile', wrap(async (req, res) => {
  const u = await prisma.adminUser.findUniqueOrThrow({ where: { id: req.admin!.id }, select: { id: true, email: true, name: true, role: true, createdAt: true } });
  res.json(u);
}));

const strongPassword = z.string().min(10, 'At least 10 characters').max(200)
  .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v), 'Use upper-case, lower-case and a number');

adminRouter.patch('/profile', wrap(async (req, res) => {
  const d = parse(z.object({
    name: str(120).min(2).optional(),
    currentPassword: z.string().max(200).optional(),
    newPassword: strongPassword.optional(),
  }), req.body);
  const data: Prisma.AdminUserUpdateInput = {};
  if (d.name) data.name = d.name;
  if (d.newPassword) {
    const u = await prisma.adminUser.findUniqueOrThrow({ where: { id: req.admin!.id } });
    if (!d.currentPassword || !(await bcrypt.compare(d.currentPassword, u.passwordHash))) throw new HttpError(400, 'Current password is incorrect');
    data.passwordHash = await bcrypt.hash(d.newPassword, 12);
  }
  const u = await prisma.adminUser.update({ where: { id: req.admin!.id }, data, select: { id: true, email: true, name: true, role: true } });
  if (d.newPassword) {
    // Revoke every other session after a password change.
    await prisma.session.deleteMany({ where: { adminUserId: u.id, NOT: { id: req.sessionId } } });
  }
  await audit(req, d.newPassword ? 'profile.password' : 'profile.update', 'AdminUser', u.id);
  res.json(u);
}));
