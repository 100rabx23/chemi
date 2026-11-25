import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApi, type Product } from '../lib/api';
import { useSEO } from '../lib/seo';
import { CategoryArt, toneFor } from '../lib/art';
import { Container, ErrorState, Eyebrow, ProductTile, Spinner } from '../components/ui';
import { Lines, Reveal } from '../components/motion';
import NotFound from './NotFound';

export default function ProductDetail() {
  const { slug } = useParams();
  const res = useApi<{ product: Product; related: Product[] }>(`/products/${encodeURIComponent(slug ?? '')}`);
  const p = res.data?.product;

  useSEO({
    title: p?.name ?? 'Product',
    description: p ? `${p.name} — ${p.description} Request a quotation from Chemilinx.` : 'Chemilinx product details.',
    image: p?.imageUrl ?? undefined,
    jsonLd: p ? { '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description, category: p.category.name, brand: { '@type': 'Brand', name: 'Chemilinx' } } : undefined,
  });

  if (res.loading) return <div className="bg-navy pt-40"><Spinner label="Loading product" /></div>;
  if (res.error?.toLowerCase().includes('not found')) return <NotFound />;
  if (res.error || !p) return <Container className="pb-20 pt-44"><ErrorState message={res.error ?? 'Something went wrong'} onRetry={res.reload} /></Container>;
  const tone = toneFor(p.category.slug);

  return (
    <>
      <section className="on-dark relative isolate overflow-hidden pb-16 pt-36 text-white sm:pb-24 sm:pt-44" style={{ background: tone.bg }}>
        <div className="grid-lines absolute inset-0 -z-10" aria-hidden="true" />
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[55%] lg:block" style={{ color: tone.fg }}>
          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover opacity-70" /> : <CategoryArt slug={p.category.slug} className="h-full w-full opacity-30" />}
        </div>
        <Container>
          <nav aria-label="Breadcrumb" className="label flex flex-wrap items-center gap-2">
            <Link to="/products" className="hover:text-white">Products</Link><span aria-hidden="true">/</span>
            <Link to={`/products?category=${p.category.slug}`} className="hover:text-white">{p.category.name}</Link>
          </nav>
          <h1 className="display mt-8 max-w-[14ch] !text-[clamp(2.5rem,7vw,7rem)] text-white"><Lines lines={[p.name]} /></h1>
          <Reveal delay={0.4} className="mt-8 max-w-xl text-xl leading-relaxed text-white/80">{p.description}</Reveal>
          <Reveal delay={0.55} className="mt-10 flex flex-wrap items-center gap-6">
            <Link to={`/request-quote?product=${p.slug}`} className="btn-primary !px-8 !py-4 uppercase tracking-[0.12em]">Request quotation <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <span className="label">Price on request</span>
          </Reveal>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4"><Eyebrow index="01">Specifications</Eyebrow></div>
          <div className="lg:col-span-8">
            {p.specifications.length > 0 ? (
              <dl className="border-t border-navy">
                {p.specifications.map((s) => (
                  <div key={s.label} className="grid grid-cols-1 gap-1 border-b border-navy/20 py-5 sm:grid-cols-[16rem_1fr]"><dt className="label self-center">{s.label}</dt><dd className="display-sm !text-[1.7rem]">{s.value}</dd></div>
                ))}
              </dl>
            ) : (
              <p className="display-sm !text-[clamp(1.5rem,2.6vw,2.2rem)] text-navy">Grade, purity and packaging details are provided with your quotation.</p>
            )}
            <p className="mt-6 max-w-xl text-sm text-ink-soft">Only information confirmed by Chemilinx is shown. For technical documents or a specific grade, mention it in your quotation request.</p>
          </div>
        </Container>
      </section>

      {res.data && res.data.related.length > 0 && (
        <section className="border-t border-navy/15 bg-mist/50 py-20 sm:py-28">
          <Container>
            <div className="mb-10 flex items-end justify-between gap-6"><div><Eyebrow index="02">Related</Eyebrow><h2 className="display-md mt-5">More in {p.category.name}.</h2></div></div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {res.data.related.map((r) => <div key={r.id} className="flex min-h-[380px] [&>*]:w-full"><ProductTile p={r} /></div>)}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
