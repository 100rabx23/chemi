import crypto from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { wrap, parse, HttpError, paging } from '../lib/http.js';
import { esc, sendBoth } from '../lib/mail.js';
import { env } from '../env.js';

export const publicRouter = Router();

const formLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: env.NODE_ENV === 'test' ? 1000 : 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later.' },
});

// ---------- catalogue ----------

publicRouter.get('/categories', wrap(async (_req, res) => {
  const cats = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: { where: { published: true } } } } },
  });
  res.json({ items: cats.map(({ _count, ...c }) => ({ ...c, productCount: _count.products })) });
}));

publicRouter.get('/products', wrap(async (req, res) => {
  const q = req.query;
  const { page, pageSize, skip, take } = paging(q);
  const where: Prisma.ProductWhereInput = { published: true };
  if (typeof q.category === 'string' && q.category) where.category = { slug: q.category };
  if (q.featured === 'true') where.featured = true;
  if (typeof q.search === 'string' && q.search.trim()) {
    const s = q.search.trim().slice(0, 80);
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { description: { contains: s, mode: 'insensitive' } },
      { category: { name: { contains: s, mode: 'insensitive' } } },
    ];
  }
  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where, skip, take, include: { category: { select: { id: true, slug: true, name: true } } },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }, { name: 'asc' }],
    }),
  ]);
  res.json({ items, total, page, pageSize });
}));

publicRouter.get('/products/:slug', wrap(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { slug: String(req.params.slug), published: true },
    include: { category: { select: { id: true, slug: true, name: true } } },
  });
  if (!product) throw new HttpError(404, 'Product not found');
  const related = await prisma.product.findMany({
    where: { published: true, categoryId: product.categoryId, id: { not: product.id } },
    take: 4, orderBy: { sortOrder: 'asc' },
    include: { category: { select: { id: true, slug: true, name: true } } },
  });
  res.json({ product, related });
}));

publicRouter.get('/site', wrap(async (_req, res) => {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: ['contact', 'testimonials'] } } });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, any>;
  const t = map.testimonials;
  res.json({ contact: map.contact ?? null, testimonials: t?.visible ? t.items : [] });
}));

// ---------- inquiries ----------

const text = (max: number) => z.string().trim().max(max);
const inquirySchema = z.object({
  customerName: text(120).min(2),
  companyName: text(160).min(2),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: text(30).regex(/^[+()\-\s\d.]{7,30}$/, 'Enter a valid phone number'),
  message: text(3000).optional().transform((v) => v || undefined),
  website: z.string().max(200).optional(), // honeypot
  items: z.array(z.object({
    productId: z.string().max(40).optional(),
    productName: text(200).optional(),
    quantity: z.coerce.number().positive().max(1_000_000_000),
    unit: z.enum(['kg', 'MT', 'litre', 'drum', 'other']),
  })).min(1, 'Select at least one product').max(20),
});

const ref = () => `CX-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

publicRouter.post('/inquiries', formLimiter, wrap(async (req, res) => {
  const data = parse(inquirySchema, req.body);
  // Honeypot: pretend success without storing.
  if (data.website) return res.status(201).json({ reference: ref(), emailStatus: 'SKIPPED' });

  const ids = [...new Set(data.items.map((i) => i.productId).filter(Boolean) as string[])];
  const found = await prisma.product.findMany({ where: { id: { in: ids }, published: true }, select: { id: true, name: true } });
  const byId = new Map(found.map((p) => [p.id, p.name]));
  const items = data.items.map((i) => {
    if (i.productId) {
      const name = byId.get(i.productId);
      if (!name) throw new HttpError(400, 'One of the selected products is no longer available');
      return { productId: i.productId, productName: name, quantity: i.quantity, unit: i.unit };
    }
    if (!i.productName) throw new HttpError(400, 'Each line needs a product');
    return { productId: null, productName: i.productName, quantity: i.quantity, unit: i.unit };
  });

  const reference = ref();
  const inquiry = await prisma.inquiry.create({
    data: {
      reference, customerName: data.customerName, companyName: data.companyName, email: data.email, phone: data.phone,
      message: data.message, ip: req.ip, items: { create: items },
    },
  });

  const lines = items.map((i) => `${i.productName} — ${i.quantity} ${i.unit}`);
  const emailStatus = await sendBoth({
    subject: `New quotation request ${reference} — ${data.companyName}`,
    replyTo: data.email,
    text: `Reference: ${reference}\nName: ${data.customerName}\nCompany: ${data.companyName}\nEmail: ${data.email}\nPhone: ${data.phone}\n\nProducts:\n${lines.join('\n')}\n\nRequirements:\n${data.message ?? '-'}`,
    html: `<h2>New quotation request ${esc(reference)}</h2><p><b>${esc(data.customerName)}</b>, ${esc(data.companyName)}<br>${esc(data.email)} · ${esc(data.phone)}</p><ul>${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul><p>${esc(data.message ?? '').replace(/\n/g, '<br>')}</p>`,
    customer: {
      to: data.email,
      subject: `We received your quotation request (${reference})`,
      text: `Dear ${data.customerName},\n\nThank you for contacting Chemilinx. We have received your request (reference ${reference}) and our team will respond with a quotation.\n\nRequested:\n${lines.join('\n')}\n\nChemilinx`,
      html: `<p>Dear ${esc(data.customerName)},</p><p>Thank you for contacting Chemilinx. We have received your request (reference <b>${esc(reference)}</b>) and our team will respond with a quotation.</p><ul>${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul><p>Chemilinx</p>`,
    },
  });
  await prisma.inquiry.update({ where: { id: inquiry.id }, data: { emailStatus } });

  res.status(201).json({ reference, emailStatus });
}));

// ---------- contact ----------

const contactSchema = z.object({
  name: text(120).min(2),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: text(30).optional().transform((v) => v || undefined),
  subject: text(160).optional().transform((v) => v || undefined),
  message: text(4000).min(10),
  website: z.string().max(200).optional(),
});

publicRouter.post('/contact', formLimiter, wrap(async (req, res) => {
  const data = parse(contactSchema, req.body);
  if (data.website) return res.status(201).json({ ok: true, emailStatus: 'SKIPPED' });
  const { website: _w, ...rest } = data;
  const msg = await prisma.contactMessage.create({ data: { ...rest, ip: req.ip } });
  const emailStatus = await sendBoth({
    subject: `Website message from ${data.name}${data.subject ? ` — ${data.subject}` : ''}`,
    replyTo: data.email,
    text: `From: ${data.name} <${data.email}> ${data.phone ?? ''}\n\n${data.message}`,
    html: `<p><b>${esc(data.name)}</b> &lt;${esc(data.email)}&gt; ${esc(data.phone ?? '')}</p><p>${esc(data.message).replace(/\n/g, '<br>')}</p>`,
    customer: {
      to: data.email,
      subject: 'We received your message — Chemilinx',
      text: `Dear ${data.name},\n\nThank you for writing to Chemilinx. We have received your message and will get back to you shortly.\n\nChemilinx`,
      html: `<p>Dear ${esc(data.name)},</p><p>Thank you for writing to Chemilinx. We have received your message and will get back to you shortly.</p><p>Chemilinx</p>`,
    },
  });
  await prisma.contactMessage.update({ where: { id: msg.id }, data: { emailStatus } });
  res.status(201).json({ ok: true, emailStatus });
}));
