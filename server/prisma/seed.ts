import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { categories, products, settings } from './seed-data.js';

const prisma = new PrismaClient();
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function main() {
  const catIds = new Map<string, string>();
  for (const [i, c] of categories.entries()) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, create: { ...c, sortOrder: i }, update: {} });
    catIds.set(c.slug, row.id);
  }
  for (const [i, p] of products.entries()) {
    const slug = slugify(p.name);
    await prisma.product.upsert({
      where: { slug },
      create: {
        slug, name: p.name, description: p.description, categoryId: catIds.get(p.category)!,
        featured: p.featured ?? false, specifications: p.specs ?? [], sortOrder: i,
      },
      update: {},
    });
  }
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, create: { key, value: value as never }, update: {} });
  }

  const email = (process.env.SEED_ADMIN_EMAIL ?? '').trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? '';
  if (email && password) {
    if (password.length < 10) throw new Error('SEED_ADMIN_PASSWORD must be at least 10 characters');
    await prisma.adminUser.upsert({
      where: { email },
      create: { email, name: 'Administrator', role: 'ADMIN', passwordHash: await bcrypt.hash(password, 12) },
      update: {},
    });
    console.log(`Admin user ensured: ${email}`);
  } else {
    console.log('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set: no admin user created.');
  }
  console.log(`Seeded ${categories.length} categories, ${products.length} products.`);
}

main().finally(() => prisma.$disconnect());
