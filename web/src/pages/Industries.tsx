import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Factory, Filter, FlaskConical, Flower2, Layers, Paintbrush, SprayCan, type LucideIcon } from 'lucide-react';
import { useApi, type Paged, type Product } from '../lib/api';
import { industries } from '../lib/content';
import { useSEO } from '../lib/seo';
import { ArrowLink, Container, PageHero } from '../components/ui';
import { Reveal } from '../components/motion';

const icons: Record<string, LucideIcon> = { paintbrush: Paintbrush, flower: Flower2, layers: Layers, factory: Factory, droplets: Droplets, filter: Filter, spray: SprayCan, flask: FlaskConical };

export default function Industries() {
  useSEO({ title: 'Industries', description: 'Industries served by Chemilinx products: paints and coatings, fragrance and personal care, plastics and rubber, ceramics and glass, edible oil refining, filtration, cleaning and chemical processing.' });
  const res = useApi<Paged<Product>>('/products?pageSize=100');
  const bySlug = new Map(res.data?.items.map((p) => [p.slug, p]));
  const [active, setActive] = useState<string>(industries[0].id);

  useEffect(() => {
    const els = industries.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (vis) setActive(vis.target.id);
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.1, 0.5] });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <PageHero eyebrow="Industries" lines={['Where our', 'products work.']}
        intro="The application areas below come straight from the uses described for each product in our catalogue — nothing more." />

      <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block" aria-label="Industry index">
          <nav className="sticky top-32">
            <p className="label mb-5">Index</p>
            <ol className="border-l border-navy/20">
              {industries.map((ind, i) => (
                <li key={ind.id}>
                  <a href={`#${ind.id}`} aria-current={active === ind.id ? 'true' : undefined}
                    className={`-ml-px block border-l-2 py-2.5 pl-4 text-[14px] leading-snug transition-all ${active === ind.id ? 'border-emerald font-semibold text-navy' : 'border-transparent text-ink-soft hover:text-navy'}`}>
                    <span className="label mr-2 tabular-nums">{String(i + 1).padStart(2, '0')}</span>{ind.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <ol className="lg:col-span-9">
          {industries.map((ind, i) => {
            const Icon = icons[ind.icon];
            return (
              <li key={ind.id} id={ind.id} className="scroll-mt-28 border-t border-navy py-14 first:pt-0 first:border-t-0 lg:py-20">
                <Reveal>
                  <div className="flex items-start justify-between gap-6">
                    <span className="outline-text-dark font-display text-[clamp(4rem,10vw,9rem)] font-light leading-[0.8]">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-navy text-mint"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                  </div>
                  <h2 className="display-md mt-8 max-w-[18ch] !text-[clamp(2rem,4.4vw,4rem)]">{ind.title}</h2>
                  <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">{ind.blurb}</p>
                  <ul className="mt-8 flex flex-wrap gap-2">
                    {ind.products.map((s) => { const p = bySlug.get(s); return p ? <li key={s}><Link to={`/products/${s}`} className="inline-block border border-navy/30 px-4 py-2 text-sm text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white">{p.name}</Link></li> : null; })}
                  </ul>
                  <p className="mt-8 max-w-xl border-l-2 border-emerald pl-4 text-sm leading-relaxed text-ink-soft"><span className="label !text-emerald-dark">Basis · </span>{ind.basis}</p>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </Container>

      <section className="bg-mist">
        <Container className="flex flex-wrap items-center justify-between gap-6 py-14">
          <p className="display-sm max-w-xl">In a different sector, or need a product we don’t list?</p>
          <ArrowLink to="/contact">Talk to our team</ArrowLink>
        </Container>
      </section>
    </>
  );
}
