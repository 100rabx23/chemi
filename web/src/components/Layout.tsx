import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react';
import { Container, Logo } from './ui';
import { ScrollTop } from './motion';
import { useCategories, useSite } from '../lib/site';

const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'Company' },
  { to: '/industries', label: 'Industries' },
  { to: '/why-chemilinx', label: 'Why Chemilinx' },
  { to: '/contact', label: 'Contact' },
];

function useIST() {
  const fmt = () => {
    const d = new Date();
    return {
      time: d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase(),
      date: d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' }),
    };
  };
  const [v, setV] = useState(fmt);
  useEffect(() => { const t = setInterval(() => setV(fmt()), 20_000); return () => clearInterval(t); }, []);
  return v;
}

function MenuOverlay({ onClose }: { onClose: () => void }) {
  const cats = useCategories();
  const { contact } = useSite();
  const { time, date } = useIST();
  return (
    <motion.div id="site-menu" role="dialog" aria-modal="true" aria-label="Site menu" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }} className="fixed inset-0 z-[60] overflow-y-auto bg-paper">
      <Container className="grid gap-14 pb-14 pt-32 lg:grid-cols-12">
        <nav aria-label="Main" className="lg:col-span-7">
          <p className="label mb-6">Navigate</p>
          <ul className="border-t border-navy/20">
            {links.map((l, i) => (
              <motion.li key={l.to} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05, duration: 0.5 }} className="border-b border-navy/20">
                <Link to={l.to} onClick={onClose} className="group flex items-baseline justify-between py-3.5">
                  <span className="display text-[clamp(2.2rem,6vw,5.2rem)] transition-transform duration-500 group-hover:translate-x-3 group-hover:text-emerald">{l.label}</span>
                  <span className="label tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
        <div className="lg:col-span-5">
          <p className="label mb-6">Product families</p>
          <ul className="border-t border-navy/20">
            {cats.map((c) => (
              <li key={c.id} className="border-b border-navy/15"><Link to={`/products?category=${c.slug}`} onClick={onClose} className="group flex items-center justify-between py-3.5 text-lg font-medium text-navy hover:text-emerald"><span>{c.name}</span><span className="label flex items-center gap-2">{c.productCount}<ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" /></span></Link></li>
            ))}
          </ul>
          <div className="mt-10 text-sm leading-relaxed text-ink-soft">
            <p className="label mb-3">Ankleshwar · {time}</p>
            <p>{date}</p>
            <p className="mt-3">{contact.address}</p>
            <p className="mt-3"><a className="underline-grow text-navy" href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a></p>
            <p><a className="underline-grow text-navy" href={`mailto:${contact.emailSales}`}>{contact.emailSales}</a></p>
          </div>
          <Link to="/request-quote" onClick={onClose} className="group mt-8 inline-flex items-center gap-3 rounded-full bg-graphite py-2 pl-7 pr-2 text-sm font-semibold text-white hover:bg-emerald">Request a quote<span className="grid h-10 w-10 place-items-center rounded-full bg-white text-navy"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span></Link>
        </div>
      </Container>
    </motion.div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { time, date } = useIST();
  useEffect(() => setOpen(false), [loc.pathname, loc.search]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[70]">
        <Container className="flex items-start justify-between pt-4">
          <Link to="/" aria-label="Chemilinx home" className="pill pointer-events-auto !py-2 !pl-3 !pr-5"><Logo /></Link>
          <div className="pointer-events-auto flex items-center gap-2.5">
            <span className="pill hidden !text-ink-soft lg:inline-flex">Ankleshwar <b className="font-semibold text-navy">{time}</b><span aria-hidden="true">·</span>{date}</span>
            <Link to="/request-quote" className="pill hidden !bg-graphite !text-white hover:!bg-emerald sm:inline-flex">Request a quote <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            <button className="pill" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((v) => !v)}>
              {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}<span className="uppercase tracking-wide">{open ? 'Close' : 'Menu'}</span>
            </button>
          </div>
        </Container>
      </header>
      <AnimatePresence>{open && <MenuOverlay onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function Footer() {
  const { contact } = useSite();
  const cats = useCategories();
  const socials = [['LinkedIn', contact.linkedin], ['Instagram', contact.instagram], ['Facebook', contact.facebook]].filter(([, u]) => u);
  return (
    <footer className="on-dark relative overflow-hidden bg-graphite text-white/75">
      <Container className="pt-20 sm:pt-28">
        <div className="flex flex-col justify-between gap-10 border-b border-white/15 pb-16 lg:flex-row lg:items-end">
          <h2 className="display-md max-w-[14ch] text-white">Tell us what you need to source.</h2>
          <Link to="/request-quote" className="group inline-flex items-center gap-4 self-start rounded-full bg-emerald py-2 pl-8 pr-2 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-mint hover:text-navy lg:self-end">
            Request a quote <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-navy"><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </Link>
        </div>
        <div className="grid gap-12 py-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo light />
            <p className="mt-5 max-w-xs text-xl font-medium leading-snug text-white">Linking chemistry with lives.</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">Chemical distribution from Ankleshwar GIDC, Gujarat. All supply is by quotation.</p>
          </div>
          <nav aria-label="Product categories" className="md:col-span-3">
            <h2 className="label">Products</h2>
            <ul className="mt-5 space-y-2.5 text-sm">{cats.map((c) => <li key={c.id}><Link className="underline-grow hover:text-white" to={`/products?category=${c.slug}`}>{c.name}</Link></li>)}</ul>
          </nav>
          <nav aria-label="Company" className="md:col-span-2">
            <h2 className="label">Company</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {[['/about', 'About'], ['/industries', 'Industries'], ['/why-chemilinx', 'Why Chemilinx'], ['/contact', 'Contact'], ['/request-quote', 'Request a quote'], ['/privacy-policy', 'Privacy policy']].map(([to, l]) => <li key={to}><Link className="underline-grow hover:text-white" to={to}>{l}</Link></li>)}
            </ul>
          </nav>
          <address className="not-italic md:col-span-3">
            <h2 className="label">Contact</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li>{contact.address}</li>
              <li><a className="underline-grow hover:text-white" href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a></li>
              <li><a className="underline-grow hover:text-white" href={`mailto:${contact.emailGeneral}`}>{contact.emailGeneral}</a></li>
              <li><a className="underline-grow hover:text-white" href={`mailto:${contact.emailSales}`}>{contact.emailSales}</a> <span className="text-white/60">sales</span></li>
              <li><a className="underline-grow hover:text-white" href={`mailto:${contact.emailExports}`}>{contact.emailExports}</a> <span className="text-white/60">exports</span></li>
            </ul>
            {socials.length > 0 && <p className="mt-5 flex gap-4 text-sm">{socials.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener noreferrer" className="underline-grow hover:text-white">{n}</a>)}</p>}
          </address>
        </div>
      </Container>
      <p className="outline-text pointer-events-none select-none whitespace-nowrap text-center font-display font-bold leading-[0.8] tracking-tighter" style={{ fontSize: '19vw' }} aria-hidden="true">CHEMILINX</p>
      <div className="border-t border-white/10">
        <Container className="flex flex-col justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} Chemilinx. All rights reserved.</span>
          <span>Prices are provided on request; all supply is by quotation.</span>
        </Container>
      </div>
    </footer>
  );
}

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <a href="#main" className="sr-only z-[80] bg-white p-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none"><Outlet /></main>
      <Footer />
      <ScrollTop />
    </>
  );
}
