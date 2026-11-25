import { useApi, type Category } from '../lib/api';
import { useSEO } from '../lib/seo';
import { ArrowLink, Container, Eyebrow, PageHero } from '../components/ui';
import { Reveal, ScrollWords } from '../components/motion';

export default function Why() {
  useSEO({ title: 'Why Chemilinx', description: 'Why work with Chemilinx: a single chemical distributor for six product families, quotation-based supply, dedicated sales and export contacts, based in Ankleshwar GIDC.' });
  const cats = useApi<{ items: Category[] }>('/categories');
  const total = cats.data?.items.reduce((n, c) => n + (c.productCount ?? 0), 0);

  const ledger = [
    ['One distributor, six product families', `Aroma chemicals, solvents, plasticizers, paint thinners, industrial acids and minerals${total ? ` — ${total} named products` : ''} through one relationship.`, 'The live product catalogue.'],
    ['Quotation-based, no list prices', 'Tell us the product, quantity and unit; we respond with a quotation tailored to the request.', 'Every catalogue entry is “price on request”.'],
    ['Dedicated contact channels', 'General, sales and export enquiries each have their own mailbox, plus a direct phone line.', 'info@, sales@ and exports@chemilinx.in; +91 8866865578.'],
    ['Based in Ankleshwar GIDC', 'Our office is in the GIDC industrial estate at Ankleshwar, Gujarat.', 'Registered contact address: 315 Golden Square, Ankleshwar - Valia Rd.'],
    ['A focus on partnership', 'We work closely with clients, suppliers and partners, and name collaboration as a core value.', 'Chemilinx’s stated core values.'],
  ];
  const steps = [['Choose', 'Pick the products you need from the catalogue.'], ['Specify', 'Give quantities, units and any requirements.'], ['Receive', 'We respond with a quotation.']];

  return (
    <>
      <PageHero eyebrow="Why Chemilinx" lines={['Built around', 'how you buy.']} intro="Only claims we can point to are made on this page. Each states what it rests on." />

      <section className="py-24 sm:py-36">
        <Container>
          <Eyebrow index="01">Manifesto</Eyebrow>
          <ScrollWords className="display-md mt-10 max-w-5xl !text-[clamp(2rem,5vw,4.6rem)] !leading-[1.08]" text="We are a chemical distributor, not a catalogue of promises. Tell us what you need, and we will answer with a quotation." />
        </Container>
      </section>

      <section className="border-y border-navy/15 bg-white py-24 sm:py-32">
        <Container>
          <div className="flex items-end justify-between gap-6"><div><Eyebrow index="02">The ledger</Eyebrow><h2 className="display-md mt-6">Claim and evidence.</h2></div></div>
          <div className="mt-14 hidden grid-cols-12 gap-6 border-b border-navy pb-3 md:grid"><span className="label col-span-5">Claim</span><span className="label col-span-4">What it means</span><span className="label col-span-3">Evidence</span></div>
          <ol>
            {ledger.map(([claim, means, evidence], i) => (
              <li key={claim}>
                <Reveal className="group grid gap-3 border-b border-navy/20 py-8 transition-colors hover:bg-mist/70 md:grid-cols-12 md:gap-6 md:px-0">
                  <h3 className="display-sm !text-[clamp(1.5rem,2.6vw,2.4rem)] md:col-span-5"><span className="label mr-3 tabular-nums">{String(i + 1).padStart(2, '0')}</span>{claim}</h3>
                  <p className="leading-relaxed text-ink-soft md:col-span-4">{means}</p>
                  <p className="text-sm leading-relaxed text-navy md:col-span-3"><span className="label !text-emerald-dark md:hidden">Evidence · </span>{evidence}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="on-dark relative overflow-hidden bg-navy py-24 text-white sm:py-32">
        <div className="grid-lines absolute inset-0 opacity-70" aria-hidden="true" />
        <Container className="relative">
          <Eyebrow dark index="03">How to buy</Eyebrow>
          <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-0">
            {steps.map(([t, d], i) => (
              <li key={t} className="relative md:pr-10">
                <Reveal delay={i * 0.1}>
                  <span className="outline-text font-display text-[8rem] font-light leading-[0.8]">{i + 1}</span>
                  <div className="mt-6 h-px bg-white/25" aria-hidden="true" />
                  <h3 className="display-sm mt-6 text-white">{t}</h3>
                  <p className="mt-3 max-w-xs leading-relaxed text-white/70">{d}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          <div className="mt-16"><ArrowLink to="/request-quote" light>Start a quotation request</ArrowLink></div>
        </Container>
      </section>
    </>
  );
}
