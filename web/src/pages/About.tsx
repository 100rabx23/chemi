import { founders, values } from '../lib/content';
import { useSEO } from '../lib/seo';
import { ArrowLink, Container, Eyebrow, PageHero } from '../components/ui';
import { ParallaxImage, Reveal, ScrollWords } from '../components/motion';

export default function About() {
  useSEO({ title: 'About', description: 'Chemilinx is a chemical distribution company based in Ankleshwar GIDC, Gujarat — our story, mission, global vision and core values.' });
  return (
    <>
      <PageHero eyebrow="Company" lines={['Youth meets', 'experience.']}
        intro="Our journey is a testament to the synergy of youth and experience, fueled by a shared vision to propel Chemilinx towards global success." />

      {/* Story */}
      <section className="py-24 sm:py-36">
        <Container className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4"><div className="lg:sticky lg:top-32"><Eyebrow index="01">Company story</Eyebrow><p className="label mt-4">Ankleshwar GIDC, Gujarat</p></div></div>
          <div className="lg:col-span-8">
            <Reveal><p className="display-sm !text-[clamp(1.6rem,3vw,2.6rem)] !leading-[1.2] first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[5.5rem] first-letter:leading-[0.8] first-letter:text-emerald">
              Founded with a commitment to dynamic growth and unwavering stability, Chemilinx has set its sights on becoming a prominent force in the chemical distribution landscape worldwide.</p></Reveal>
            <Reveal delay={0.1}><p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-soft">At Chemilinx, we’re not just a chemical distribution company; we’re your trusted partner in the world of chemicals. With a relentless commitment to excellence, innovation, and exceeding your expectations, we strive to lead in our industry.</p></Reveal>
          </div>
        </Container>
      </section>

      {/* Photographic band */}
      <section className="on-dark relative isolate h-[78vh] min-h-[520px] overflow-hidden bg-navy text-white" aria-label="Mission">
        <div className="absolute inset-0 -z-10 grain">
          <ParallaxImage src="/images/plant.webp" alt="" className="h-full" imgClassName="grayscale contrast-110" speed={10} />
          <div className="absolute inset-0 bg-navy/80 mix-blend-multiply" /><div className="absolute inset-0 bg-navy/40" />
        </div>
        <Container className="flex h-full flex-col justify-end pb-16">
          <Eyebrow dark index="02">Our mission</Eyebrow>
          <p className="display mt-6 max-w-[18ch] !text-[clamp(2.4rem,6.5vw,6.5rem)] text-white">Redefine chemical distribution.</p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">Our dynamic team, comprised of seasoned experts and vibrant youth, steers toward new heights — blending experience with fresh perspectives, for a journey that is not just fast, but steady and sustainable.</p>
        </Container>
      </section>

      {/* Vision */}
      <section className="grid lg:grid-cols-2">
        <div className="on-dark bg-[#123a31] px-5 py-20 text-white sm:px-12 lg:py-32">
          <Eyebrow dark index="03">Global vision</Eyebrow>
          <h2 className="display-md mt-6 text-white">Beyond borders.</h2>
        </div>
        <div className="bg-mist px-5 py-20 sm:px-12 lg:py-32">
          <Reveal><p className="max-w-xl text-lg leading-relaxed text-charcoal/85">Chemilinx aspires to be a global leader, transcending geographical boundaries to provide innovative chemical solutions to industries worldwide. We believe in the transformative power of chemistry, and our journey is guided by a commitment to unlocking possibilities on a global scale.</p></Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 sm:py-36">
        <Container>
          <Eyebrow index="04">Core values</Eyebrow>
          <h2 className="display-md mt-6">Our guiding principles.</h2>
          <ul className="mt-16 border-t border-navy">
            {values.map((v, i) => (
              <li key={v.title}>
                <Reveal className="group grid gap-4 border-b border-navy/20 py-10 transition-colors hover:bg-mist/60 md:grid-cols-12 md:items-baseline md:px-3">
                  <span className="label tabular-nums md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="display-md !text-[clamp(2rem,4.5vw,4.2rem)] transition-transform duration-500 group-hover:translate-x-3 md:col-span-6">{v.title}</h3>
                  <p className="leading-relaxed text-ink-soft md:col-span-5">{v.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Philosophy */}
      <section className="bg-graphite py-24 text-white sm:py-36">
        <Container className="on-dark">
          <Eyebrow dark index="05">Business philosophy</Eyebrow>
          <ScrollWords className="display-md mt-10 max-w-5xl !text-[clamp(2rem,5vw,4.6rem)] !leading-[1.08]text-white" text="Crafting possibilities, fueling innovation — where chemistry meets global excellence." />
          <p className="mt-10 max-w-xl leading-relaxed text-white/65">We work closely with clients, suppliers, and partners to create a synergy that drives mutual success — treating environmental and social responsibility as integral to how we do business.</p>
        </Container>
      </section>

      {/* Founders */}
      <section className="py-24 sm:py-36">
        <Container>
          <Eyebrow index="06">Leadership</Eyebrow>
          <ul className="mt-12 border-t border-navy">
            {founders.map((f) => (
              <li key={f.name}><Reveal className="grid gap-2 border-b border-navy/20 py-10 md:grid-cols-12 md:items-baseline"><h3 className="display-md !text-[clamp(2.2rem,5vw,4.6rem)] md:col-span-7">{f.name}</h3><p className="label md:col-span-5 md:text-right">{f.role}</p></Reveal></li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4"><ArrowLink to="/products">View the catalogue</ArrowLink><ArrowLink to="/contact">Get in touch</ArrowLink></div>
        </Container>
      </section>
    </>
  );
}
