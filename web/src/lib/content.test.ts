import { describe, expect, it } from 'vitest';
import { industries, values } from './content';
import { products } from '../../../server/prisma/seed-data';

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

describe('static content integrity', () => {
  const slugs = new Set(products.map((p) => slugify(p.name)));
  it('every industry links only to seeded products', () => {
    for (const ind of industries) for (const s of ind.products) expect(slugs, `${ind.id}: ${s}`).toContain(s);
  });
  it('every industry states its basis', () => {
    for (const ind of industries) expect(ind.basis.length).toBeGreaterThan(20);
  });
  it('has the four published core values', () => {
    expect(values.map((v) => v.title)).toEqual(['Excellence', 'Innovation', 'Responsibility', 'Collaboration']);
  });
  it('seed catalogue has no duplicate products', () => {
    expect(slugs.size).toBe(products.length);
  });
});
