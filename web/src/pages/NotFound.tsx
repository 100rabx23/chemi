import { Link } from 'react-router-dom';
import { useSEO } from '../lib/seo';
import { Container } from '../components/ui';
import { Lines, Reveal } from '../components/motion';

export default function NotFound() {
  useSEO({ title: 'Page not found', description: 'The page you are looking for could not be found.', noindex: true });
  return (
    <section className="on-dark relative isolate min-h-[88vh] overflow-hidden bg-navy pt-44 text-white">
      <div className="grid-lines absolute inset-0 -z-10" aria-hidden="true" />
      <p className="outline-text pointer-events-none absolute -bottom-10 right-0 -z-10 select-none font-display font-semibold leading-none" style={{ fontSize: '38vw' }} aria-hidden="true">404</p>
      <Container className="pb-24">
        <p className="label !text-mint">Error 404</p>
        <h1 className="display mt-6 max-w-[14ch] text-white"><Lines lines={['This compound', 'doesn’t exist.']} /></h1>
        <Reveal delay={0.5} className="mt-8 max-w-md text-lg text-white/70">The page you’re looking for has moved or never existed. Try the catalogue, or head back home.</Reveal>
        <Reveal delay={0.6} className="mt-10 flex flex-wrap gap-3"><Link to="/" className="btn-primary">Home</Link><Link to="/products" className="btn-ghost-light">Browse products</Link><Link to="/contact" className="btn-ghost-light">Contact us</Link></Reveal>
      </Container>
    </section>
  );
}
