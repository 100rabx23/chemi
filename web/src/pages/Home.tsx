import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useApi, type Category, type Paged, type Product } from '../lib/api';
import { useSite } from '../lib/site';
import { useSEO } from '../lib/seo';
import { values } from '../lib/content';
import { Doors } from '../components/Doors';
import { ArrowLink, Container, Eyebrow, ErrorState } from '../components/ui';
import { FlipWord, Lines, Marquee, ParallaxImage, Reveal, RollingNumber, ScrollWords, Wipe } from '../components/motion';

const WORDS: Record<string, string> = {
  'fragrance-solutions': 'Fragrance solutions', 'versatile-solvents': 'Solvents', 'enhancing-plasticizers': 'Plasticizers',
  'paint-thinners': 'Paint thinners', 'additional-products': 'Industrial essentials', 'industrial-minerals': 'Industrial minerals',
};

function Hero({ cats, total }: { cats: Category[]; total?: number }) {
  const words = cats.length ? cats.map((c) => WORDS[c.slug] ?? c.name) : ['Chemicals'];
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-paper pt-28">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <img src="/images/plant.webp" alt="" className="h-full w-full object-cover object-[58%_42%]" />
        <div className="absolute inset-0 bg-paper/80 lg:bg-gradient-to-r lg:from-paper lg:via-paper/95 lg:via-55% lg:to-paper/15" />
      </div>
      <Container className="grid flex-1 items-center gap-12 pb-24 pt-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal y={10}><p className="pill !px-3.5 !py-1.5 text-[13px] !text-ink-soft"><span className="h-2 w-2 rounded-full bg-emerald" aria-hidden="true" />Chemical distribution · Ankleshwar GIDC</p></Reveal>
          <h1 className="display mt-7"><Lines lines={['Linking chemistry', 'with lives.']} lastClass="text-ink-soft" delay={0.15} /></h1>
          <Reveal delay={0.7} className="mt-9">
            <p className="mb-5 text-xl font-medium text-ink-soft">We distribute</p>
            <FlipWord words={words} />
          </Reveal>
          <Reveal delay={0.9} className="mt-10 flex flex-wrap items-center gap-3">
            <Link to="/request-quote" className="group inline-flex items-center gap-4 rounded-full bg-graphite py-1.5 pl-7 pr-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald">Request a quote<span className="grid h-11 w-11 place-items-center rounded-full bg-white text-navy"><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span></Link>
            <Link to="/products" className="pill !px-7 !py-3.5 hover:!bg-white">Browse the catalogue</Link>
          </Reveal>
        </div>
        <div className="relative flex items-end lg:col-span-5 lg:justify-end">
          <div className="rounded-full bg-graphite py-3 pl-6 pr-7 text-white shadow-xl">
            <p className="flex items-baseline gap-2 text-sm"><span className="font-display text-3xl font-bold leading-none">{total ? <RollingNumber value={total} /> : '—'}</span> products<span className="text-white/40" aria-hidden="true">·</span>{cats.length || '—'} families</p>
          </div>
        </div>
      </Container>
      <div className="border-t border-navy/15">
        <Container className="flex items-center justify-between gap-4 py-4 text-[12px] font-medium uppercase tracking-[0.12em] text-navy/70">
          <span>Supply by quotation</span><span className="hidden sm:block">Ankleshwar GIDC · Gujarat · India</span><a href="#intro" className="hover:text-emerald">Scroll to explore ↓</a>
        </Container>
      </div>
    </section>
  );
}

export default function Home() {
  const cats = useApi<{ items: Category[] }>('/categories');
  const all = useApi<Paged<Product>>('/products?pageSize=100');
  const { testimonials } = useSite();
  const total = all.data?.total;
  const featured = (all.data?.items.filter((p) => p.featured).length ? all.data!.items.filter((p) => p.featured) : all.data?.items.slice(0, 3)) ?? [];

  useSEO({
    title: 'Chemilinx',
    description: 'Chemilinx distributes fragrance chemicals, solvents, plasticizers, paint thinners, industrial acids and minerals from Ankleshwar GIDC, Gujarat. Request a quotation.',
    jsonLd: { '@context': 'https://schema.org', '@type': 'Organization', name: 'Chemilinx', url: window.location.origin, address: { '@type': 'PostalAddress', streetAddress: '315, Golden Square, Ankleshwar - Valia Rd, GIDC', addressRegion: 'Gujarat', postalCode: '393002', addressCountry: 'IN' }, telephone: '+91 8866865578', email: 'info@chemilinx.in' },
  });

  return (
    <>
      <Hero cats={cats.data?.items ?? []} total={total} />

      {all.data && (
        <div className="border-b border-navy/15 bg-paper py-5 font-mono text-[12px] uppercase tracking-[0.18em] text-navy/70">
          <Marquee items={all.data.items.map((p) => p.name)} />
        </div>
      )}

      {/* INTRO — asymmetrical */}
      <section id="intro" className="overflow-hidden py-24 sm:py-36">
        <Container className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow index="01">Who we are</Eyebrow>
            <ScrollWords className="display-sm mt-8 !text-[clamp(1.9rem,4vw,3.6rem)] !leading-[1.12] text-navy"
              text="Chemilinx is not just a chemical distribution company. We are a trusted partner in the world of chemicals — pairing seasoned experience with fresh perspective, to move steadily and sustainably." />
            <Reveal delay={0.1} className="mt-10 flex flex-wrap gap-x-10 gap-y-4"><ArrowLink to="/about">Our story</ArrowLink><ArrowLink to="/why-chemilinx">Why Chemilinx</ArrowLink></Reveal>
          </div>
          <div className="relative lg:col-span-4 lg:col-start-9 lg:mt-24">
            <Wipe><ParallaxImage src="/images/flask.webp" alt="Laboratory flask containing green liquid" width={1000} height={1333} className="aspect-[3/4]" speed={8} /></Wipe>
            <p className="label mt-3">Fig. 01 — Illustrative image</p>
            <div className="absolute -left-10 -top-10 -z-10 hidden h-40 w-40 border border-emerald/40 lg:block" aria-hidden="true" />
          </div>
        </Container>
      </section>

      {/* FAMILIES — doors */}
      <section className="border-y border-navy/10 bg-bone py-24 sm:py-32" aria-labelledby="families-h">
        <Container>
          <div className="mb-16 flex flex-wrap items-end justify-between gap-8">
            <div><Eyebrow index="02">The catalogue</Eyebrow><h2 id="families-h" className="display-md mt-6 max-w-[16ch]">Open a door to a product family.</h2><p className="mt-5 max-w-md text-ink-soft">Choose a door to see the products behind it.</p></div>
            <ArrowLink to="/products">Full catalogue</ArrowLink>
          </div>
          {cats.error && <ErrorState message={cats.error} onRetry={cats.reload} />}
          {cats.data && all.data && <Doors cats={cats.data.items} products={all.data.items} />}
        </Container>
      </section>

      {/* FEATURED — editorial index */}
      <section className="py-24 sm:py-36">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4"><div className="lg:sticky lg:top-32"><Eyebrow index="03">Featured</Eyebrow><h2 className="display-md mt-6">From the catalogue.</h2><p className="mt-6 max-w-xs text-ink-soft">Selected products. Every product is supplied against a quotation.</p></div></div>
            <ol className="border-t border-navy lg:col-span-8">
              {featured.map((p, i) => (
                <li key={p.id}>
                  <Reveal delay={i * 0.05}>
                    <Link to={`/products/${p.slug}`} className="group grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-4 border-b border-navy/20 py-8 transition-colors hover:bg-mist/70 sm:px-3">
                      <span className="label tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      <span>
                        <span className="display-sm block !text-[clamp(1.8rem,3.6vw,3.2rem)] transition-transform duration-500 group-hover:translate-x-2">{p.name}</span>
                        <span className="mt-2 block max-w-xl text-[15px] leading-relaxed text-ink-soft">{p.description}</span>
                        <span className="label mt-3 block !text-emerald-dark">{p.category.name}</span>
                      </span>
                      <ArrowUpRight className="h-7 w-7 text-navy/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-emerald" aria-hidden="true" />
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* WHY — sticky split */}
      <section className="on-dark relative overflow-hidden bg-navy py-24 text-white sm:py-36">
        <div className="grid-lines absolute inset-0 opacity-70" aria-hidden="true" />
        <Container className="relative grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5"><div className="lg:sticky lg:top-32"><Eyebrow dark index="04">Why Chemilinx</Eyebrow><h2 className="display-md mt-6 text-white">What you can rely on.</h2><div className="mt-8"><ArrowLink to="/why-chemilinx" light>How we work</ArrowLink></div></div></div>
          <ol className="lg:col-span-7">
            {[
              ['One supplier, six families', `Aroma chemicals, solvents, plasticizers, thinners, acids and minerals${total ? ` — ${total} named products` : ''} through a single point of contact.`],
              ['Quotation-based supply', 'No published list prices. Tell us the product, quantity and unit, and we respond with a quotation.'],
              ['Dedicated channels', 'Separate sales and exports mailboxes, plus a direct phone line.'],
              ['Rooted in Ankleshwar', 'Operating from the GIDC industrial estate in Gujarat.'],
            ].map(([t, d], i) => (
              <li key={t}><Reveal className="grid grid-cols-[4rem_1fr] gap-4 border-t border-white/20 py-9"><span className="outline-text font-display text-5xl leading-none">{String(i + 1).padStart(2, '0')}</span><div><h3 className="display-sm text-white">{t}</h3><p className="mt-3 max-w-lg leading-relaxed text-white/70">{d}</p></div></Reveal></li>
            ))}
          </ol>
        </Container>
      </section>

      {/* VALUES */}
      <section className="py-24 sm:py-36">
        <Container>
          <Eyebrow index="05">Core values</Eyebrow>
          <h2 className="display-md mt-6 max-w-3xl">The principles behind every order.</h2>
          <dl className="mt-16 grid border-t border-navy md:grid-cols-4 md:divide-x md:divide-navy/20">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.07} className="py-8 md:px-7 md:first:pl-0 md:last:pr-0">
                <dt className="outline-text-dark font-display text-7xl leading-none">{String(i + 1).padStart(2, '0')}</dt>
                <dd><span className="display-sm mt-6 block !text-[1.9rem]">{v.title}</span><span className="mt-3 block text-[15px] leading-relaxed text-ink-soft">{v.text}</span></dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {testimonials.length > 0 && (
        <section className="border-t border-navy/15 py-24 sm:py-32">
          <Container>
            <Eyebrow>Customer voices</Eyebrow>
            <div className="mt-12 grid gap-12 md:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.name}><blockquote className="display-sm !text-[1.5rem] !leading-snug">“{t.quote}”</blockquote><figcaption className="mt-6 text-sm"><span className="font-semibold text-navy">{t.name}</span><br /><span className="text-ink-soft">{t.role}, {t.company}</span></figcaption></figure>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
