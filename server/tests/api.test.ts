import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';

// Integration tests against the real database configured in DATABASE_URL.
// They create their own records (prefixed "ZZTEST") and remove them afterwards.
const app = createApp();
const H = { 'X-Requested-With': 'XMLHttpRequest' };
const adminEmail = 'zztest-admin@example.test';
const editorEmail = 'zztest-editor@example.test';
const pw = 'TestPassw0rd!x';

async function login(email: string) {
  const agent = request.agent(app);
  const r = await agent.post('/api/auth/login').set(H).send({ email, password: pw });
  return { agent, r };
}

beforeAll(async () => {
  const passwordHash = await bcrypt.hash(pw, 4);
  await prisma.adminUser.upsert({ where: { email: adminEmail }, create: { email: adminEmail, name: 'T Admin', role: 'ADMIN', passwordHash }, update: { passwordHash } });
  await prisma.adminUser.upsert({ where: { email: editorEmail }, create: { email: editorEmail, name: 'T Editor', role: 'EDITOR', passwordHash }, update: { passwordHash } });
});

afterAll(async () => {
  await prisma.inquiry.deleteMany({ where: { companyName: { startsWith: 'ZZTEST' } } });
  await prisma.contactMessage.deleteMany({ where: { name: { startsWith: 'ZZTEST' } } });
  await prisma.product.deleteMany({ where: { name: { startsWith: 'ZZTEST' } } });
  await prisma.category.deleteMany({ where: { name: { startsWith: 'ZZTEST' } } });
  await prisma.adminUser.deleteMany({ where: { email: { in: [adminEmail, editorEmail] } } });
  await prisma.$disconnect();
});

describe('public catalogue', () => {
  it('lists categories and products', async () => {
    const c = await request(app).get('/api/categories').expect(200);
    expect(c.body.items.length).toBeGreaterThanOrEqual(6);
    const p = await request(app).get('/api/products?pageSize=100').expect(200);
    expect(p.body.total).toBeGreaterThanOrEqual(25);
  });
  it('searches and filters', async () => {
    const s = await request(app).get('/api/products?search=kaolin').expect(200);
    expect(s.body.items.map((i: any) => i.name)).toContain('Calcined Kaolin');
    const f = await request(app).get('/api/products?category=paint-thinners').expect(200);
    expect(f.body.items.every((i: any) => i.category.slug === 'paint-thinners')).toBe(true);
  });
  it('returns detail with related, and 404 for unknown', async () => {
    const d = await request(app).get('/api/products/ethyl-acetate').expect(200);
    expect(d.body.product.name).toBe('Ethyl Acetate');
    expect(Array.isArray(d.body.related)).toBe(true);
    await request(app).get('/api/products/nope-nope').expect(404);
  });
  it('hides testimonials until approved', async () => {
    const s = await request(app).get('/api/site').expect(200);
    expect(s.body.testimonials).toEqual([]);
  });
});

describe('inquiries & contact', () => {
  const base = { customerName: 'ZZTEST Buyer', companyName: 'ZZTEST Industries', email: 'buyer@example.test', phone: '+91 98765 43210' };
  it('rejects invalid quote requests', async () => {
    const r = await request(app).post('/api/inquiries').send({ ...base, email: 'bad', items: [] }).expect(400);
    expect(r.body.details.email).toBeTruthy();
    expect(r.body.details.items).toBeTruthy();
  });
  it('stores a valid quote request with items', async () => {
    const p = await prisma.product.findFirstOrThrow({ where: { slug: 'ethyl-acetate' } });
    const r = await request(app).post('/api/inquiries').send({ ...base, message: 'Need monthly supply', items: [{ productId: p.id, quantity: 5, unit: 'MT' }] }).expect(201);
    expect(r.body.reference).toMatch(/^CX-/);
    const row = await prisma.inquiry.findUniqueOrThrow({ where: { reference: r.body.reference }, include: { items: true } });
    expect(row.items[0].productName).toBe('Ethyl Acetate');
    expect(row.status).toBe('NEW');
  });
  it('drops honeypot submissions silently', async () => {
    const before = await prisma.inquiry.count();
    await request(app).post('/api/inquiries').send({ ...base, website: 'http://spam', items: [{ productName: 'x', quantity: 1, unit: 'kg' }] }).expect(201);
    expect(await prisma.inquiry.count()).toBe(before);
  });
  it('stores contact messages', async () => {
    await request(app).post('/api/contact').send({ name: 'ZZTEST Person', email: 'p@example.test', message: 'Hello, please call me.' }).expect(201);
    expect(await prisma.contactMessage.count({ where: { name: 'ZZTEST Person' } })).toBe(1);
    await request(app).post('/api/contact').send({ name: 'Z', email: 'x', message: 'short' }).expect(400);
  });
});

describe('auth & authorization', () => {
  it('blocks unauthenticated admin access', async () => {
    await request(app).get('/api/admin/stats').expect(401);
    await request(app).get('/api/auth/me').expect(401);
    await request(app).post('/api/admin/products').set(H).send({}).expect(401);
  });
  it('rejects bad credentials and missing CSRF header', async () => {
    await request(app).post('/api/auth/login').set(H).send({ email: adminEmail, password: 'wrong' }).expect(401);
    await request(app).post('/api/auth/login').send({ email: adminEmail, password: pw }).expect(403);
  });
  it('logs in with an HTTP-only cookie, serves /me, and logout revokes the session', async () => {
    const { agent, r } = await login(adminEmail);
    expect(r.status).toBe(200);
    expect(String(r.headers['set-cookie'])).toMatch(/HttpOnly/i);
    expect(r.body.user.passwordHash).toBeUndefined();
    await agent.get('/api/auth/me').expect(200);
    const cookie = String(r.headers['set-cookie']).split(';')[0];
    await agent.post('/api/auth/logout').set(H).expect(200);
    await request(app).get('/api/auth/me').set('Cookie', cookie).expect(401);
  });
  it('requires CSRF header on admin mutations', async () => {
    const { agent } = await login(adminEmail);
    await agent.post('/api/admin/categories').send({ name: 'ZZTEST nocsrf' }).expect(403);
  });
});

describe('admin CRUD', () => {
  it('manages categories and products end to end with role checks', async () => {
    const { agent } = await login(adminEmail);
    const cat = await agent.post('/api/admin/categories').set(H).send({ name: 'ZZTEST Category' }).expect(201);
    const prod = await agent.post('/api/admin/products').set(H).send({
      name: 'ZZTEST Product', description: 'A test chemical description.', categoryId: cat.body.id,
      specifications: [{ label: 'Purity', value: '99%' }], featured: true,
    }).expect(201);
    expect(prod.body.slug).toBe('zztest-product');

    // appears publicly
    await request(app).get('/api/products/zztest-product').expect(200);
    // unpublish hides it
    await agent.put(`/api/admin/products/${prod.body.id}`).set(H).send({ name: 'ZZTEST Product', description: 'A test chemical description.', categoryId: cat.body.id, published: false }).expect(200);
    await request(app).get('/api/products/zztest-product').expect(404);

    // cannot delete category with products
    await agent.delete(`/api/admin/categories/${cat.body.id}`).set(H).expect(409);

    // editor cannot delete
    const ed = await login(editorEmail);
    await ed.agent.delete(`/api/admin/products/${prod.body.id}`).set(H).expect(403);
    await ed.agent.put('/api/admin/settings').set(H).send({ notifications: { notifyEmail: '' } }).expect(403);
    await ed.agent.get('/api/admin/products').expect(200);

    await agent.delete(`/api/admin/products/${prod.body.id}`).set(H).expect(200);
    await agent.delete(`/api/admin/categories/${cat.body.id}`).set(H).expect(200);
    const logs = await prisma.auditLog.count({ where: { entity: 'Product', entityId: prod.body.id } });
    expect(logs).toBe(3); // create, update, delete
  });
  it('rejects non-image uploads', async () => {
    const { agent } = await login(adminEmail);
    await agent.post('/api/admin/uploads').set(H).attach('file', Buffer.from('<?php echo 1;'), { filename: 'x.jpg', contentType: 'image/jpeg' }).expect(415);
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    const ok = await agent.post('/api/admin/uploads').set(H).attach('file', png, { filename: 'x.png', contentType: 'image/png' }).expect(201);
    expect(ok.body.url).toMatch(/^\/uploads\/[a-f0-9]{32}\.png$/);
  });
  it('manages inquiry status and notes', async () => {
    const { agent } = await login(adminEmail);
    const list = await agent.get('/api/admin/inquiries?search=ZZTEST').expect(200);
    expect(list.body.total).toBeGreaterThan(0);
    const id = list.body.items[0].id;
    const u = await agent.patch(`/api/admin/inquiries/${id}`).set(H).send({ status: 'IN_PROGRESS', internalNotes: 'Called customer' }).expect(200);
    expect(u.body.status).toBe('IN_PROGRESS');
    expect(u.body.internalNotes).toBe('Called customer');
    await agent.patch(`/api/admin/inquiries/${id}`).set(H).send({ status: 'BOGUS' }).expect(400);
    const stats = await agent.get('/api/admin/stats').expect(200);
    expect(stats.body.products).toBeGreaterThanOrEqual(25);
    const msgs = await agent.get('/api/admin/messages').expect(200);
    expect(msgs.body.total).toBeGreaterThan(0);
  });
});
