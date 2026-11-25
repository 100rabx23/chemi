import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Category, Product } from '../lib/api';

const DOOR: Record<string, { color: string; short: string }> = {
  'fragrance-solutions': { color: '#2f5d4e', short: 'Fragrance' },
  'versatile-solvents': { color: '#1d3b4a', short: 'Solvents' },
  'enhancing-plasticizers': { color: '#454e53', short: 'Plasticizers' },
  'paint-thinners': { color: '#37607a', short: 'Thinners' },
  'additional-products': { color: '#6f8a78', short: 'Industrial' },
  'industrial-minerals': { color: '#7d7469', short: 'Minerals' },
};
export const shortName = (c: Pick<Category, 'slug' | 'name'>) => DOOR[c.slug]?.short ?? c.name;

function Door({ cat, products, index }: { cat: Category; products: Product[]; index: number }) {
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const reduce = useReducedMotion();
  const meta = DOOR[cat.slug] ?? { color: '#454e53', short: cat.name };
  const angle = open ? -84 : peek ? -11 : 0;
  const id = `door-${cat.slug}`;
  return (
    <li className="group">
      <div className="relative mx-auto aspect-[1/2.05] w-full max-w-[230px] rounded-t-full bg-bone p-[9px] shadow-[0_1px_0_#fff_inset,0_14px_30px_-18px_rgba(15,40,51,.5)]" style={{ perspective: 1100 }}>
        {/* room behind the door */}
        <div className="absolute inset-[9px] flex flex-col overflow-hidden rounded-t-full bg-[#dedcd4] pb-4 pl-8 pr-4 pt-[34%]" id={id} role="region" aria-label={`${cat.name} products`}
          aria-hidden={!open} {...(!open ? { inert: true } : {})}>
          <p className="label text-center !text-navy">{cat.productCount} products</p>
          <ul className="mt-3 flex-1 space-y-0.5 overflow-y-auto pr-1 text-[13px] leading-snug">
            {products.map((p) => <li key={p.id}><Link to={`/products/${p.slug}`} className="block border-b border-navy/10 py-1.5 text-navy transition-colors hover:text-emerald">{p.name}</Link></li>)}
          </ul>
          <Link to={`/products?category=${cat.slug}`} className="mt-2 inline-flex items-center justify-center gap-1 bg-navy py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white hover:bg-emerald">View family <ArrowUpRight className="h-3 w-3" aria-hidden="true" /></Link>
        </div>

        {/* the door */}
        <motion.button type="button" aria-expanded={open} aria-controls={id} aria-label={`${open ? 'Close' : 'Open'} the ${meta.short} door: ${cat.name}`}
          onClick={() => setOpen((v) => !v)} onMouseEnter={() => setPeek(true)} onMouseLeave={() => setPeek(false)}
          animate={{ rotateY: angle }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 70, damping: 15 }}
          className="absolute inset-[9px] block cursor-pointer rounded-t-full text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
          style={{ transformOrigin: 'left center', background: meta.color, backfaceVisibility: 'hidden', boxShadow: open ? '12px 0 24px -10px rgba(0,0,0,.45)' : 'inset 0 0 0 7px rgba(255,255,255,.035), inset 0 0 60px rgba(0,0,0,.18)' }}>
          <span className="absolute inset-0 rounded-t-full opacity-80" style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 2px, rgba(0,0,0,.05) 2px 7px)' }} aria-hidden="true" />
          <span className="absolute inset-x-[16%] top-[36%] rounded-[2px] bg-gradient-to-b from-[#ead9a0] via-[#cfb26a] to-[#a98a47] py-1.5 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3b2f12] shadow-[0_1px_2px_rgba(0,0,0,.4)]">{meta.short}</span>
          <span className="absolute right-[13%] top-[62%] h-[7px] w-[34px] rounded-full bg-gradient-to-b from-[#ead9a0] to-[#a98a47] shadow-[0_1px_2px_rgba(0,0,0,.5)]" aria-hidden="true" />
          <span className="absolute right-[15%] top-[69%] h-3 w-[7px] rounded-full bg-[#2b2210]/70" aria-hidden="true" />
        </motion.button>
      </div>
      <div className="mx-auto mt-5 max-w-[230px]"><p className="label tabular-nums !text-emerald-dark">{String(index + 1).padStart(2, '0')}</p><h3 className="mt-1 text-lg leading-tight">{cat.name}</h3></div>
    </li>
  );
}

export function Doors({ cats, products }: { cats: Category[]; products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 xl:grid-cols-6">
      {cats.map((c, i) => <Door key={c.id} cat={c} index={i} products={products.filter((p) => p.category.slug === c.slug)} />)}
    </ul>
  );
}
