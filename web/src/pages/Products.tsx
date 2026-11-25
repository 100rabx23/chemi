import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useApi, type Category, type Paged, type Product } from '../lib/api';
import { useSEO } from '../lib/seo';
import { Container, ErrorState, PageHero, ProductTile, Spinner } from '../components/ui';
import { Reveal } from '../components/motion';

const PAGE = 12;
const SPANS = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-7'];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? '';
  const q = params.get('q') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [text, setText] = useState(q);

  useSEO({ title: 'Products', description: 'Browse the Chemilinx catalogue: fragrance chemicals, solvents, plasticizers, paint thinners, industrial acids and minerals. Request a quotation for any product.' });

  useEffect(() => setText(q), [q]);
  useEffect(() => {
    if (text === q) return;
    const t = setTimeout(() => update({ q: text, page: '' }), 300);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  function update(patch: Record<string, string>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k);
    setParams(next, { replace: true });
  }

  const cats = useApi<{ items: Category[] }>('/categories');
  const qs = new URLSearchParams({ page: String(page), pageSize: String(PAGE) });
  if (category) qs.set('category', category);
  if (q) qs.set('search', q);
  const res = useApi<Paged<Product>>(`/products?${qs}`);
  const pages = res.data ? Math.max(1, Math.ceil(res.data.total / PAGE)) : 1;
  const grand = cats.data?.items.reduce((n, c) => n + (c.productCount ?? 0), 0);
  const tabs = [{ slug: '', name: 'All', count: grand }, ...(cats.data?.items.map((c) => ({ slug: c.slug, name: c.name, count: c.productCount })) ?? [])];

  return (
    <>
      <PageHero eyebrow="Product catalogue" lines={['The', 'catalogue.']}
        intro="Search by name or application, or browse by product family. Every product is supplied against a quotation."
        aside={
          <form role="search" onSubmit={(e) => { e.preventDefault(); update({ q: text, page: '' }); }} className="self-end">
            <label htmlFor="product-search" className="label">Search the catalogue</label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" aria-hidden="true" />
              <input id="product-search" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. solvent, kaolin, salicylate"
                className="block w-full border-0 border-b border-white/40 bg-transparent py-3 pl-8 text-xl text-white placeholder:text-white/35 focus:border-mint focus:outline-none focus:ring-0" />
            </div>
          </form>
        } />

      <div className="sticky top-[76px] z-30 border-b border-navy/15 bg-paper/95 backdrop-blur">
        <Container>
          <nav aria-label="Product families" className="-mx-1 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => {
              const on = category === t.slug;
              return (
                <button key={t.slug || 'all'} onClick={() => update({ category: t.slug, page: '' })} aria-pressed={on}
                  className={`relative shrink-0 px-4 py-5 text-[13px] font-semibold uppercase tracking-[0.1em] transition-colors ${on ? 'text-navy' : 'text-ink-soft hover:text-navy'}`}>
                  {t.name} <span className="ml-1 font-mono text-[10px] tabular-nums opacity-60">{t.count}</span>
                  {on && <motion.span layoutId="tab-underline" className="absolute inset-x-3 bottom-0 h-[3px] bg-emerald" />}
                </button>
              );
            })}
          </nav>
        </Container>
      </div>

      <Container className="py-14 sm:py-20">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
          <p className="label">{res.data ? `${res.data.total} product${res.data.total === 1 ? '' : 's'}` : 'Loading'}{q ? ` · “${q}”` : ''}</p>
          {(category || q) && <button onClick={() => { setText(''); setParams({}, { replace: true }); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-dark hover:underline"><X className="h-4 w-4" aria-hidden="true" /> Clear filters</button>}
        </div>
        {res.loading && <Spinner label="Loading products" />}
        {res.error && <ErrorState message={res.error} onRetry={res.reload} />}
        {res.data && res.data.items.length === 0 && (
          <div className="border border-dashed border-navy/30 p-12 text-center">
            <p className="display-sm">No products match.</p>
            <p className="mt-3 text-ink-soft">Try a different search, or <a className="font-semibold text-emerald-dark underline" href="/request-quote">ask us about a product we don’t list</a>.</p>
          </div>
        )}
        {res.data && res.data.items.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12">
            {res.data.items.map((p, i) => <Reveal key={p.id} delay={(i % 2) * 0.06} className={`${SPANS[i % 4]} flex min-h-[360px] [&>*]:w-full`}><ProductTile p={p} index={(page - 1) * PAGE + i} /></Reveal>)}
          </div>
        )}
        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-14 flex items-center justify-between border-t border-navy pt-6">
            <button disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} className="btn-ghost">← Previous</button>
            <span className="label">Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => update({ page: String(page + 1) })} className="btn-ghost">Next →</button>
          </nav>
        )}
      </Container>
    </>
  );
}
