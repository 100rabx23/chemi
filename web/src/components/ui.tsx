import { AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../lib/api';
import { CategoryArt, toneFor } from '../lib/art';
import { Lines, Reveal } from './motion';

export function Logo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  const navy = light ? '#ffffff' : '#0f2833';
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Chemilinx">
      <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden="true">
        <rect x="3" y="3" width="20" height="20" fill="none" stroke="#2fa57d" strokeWidth="4.5" />
        <rect x="14" y="14" width="22" height="22" fill="none" stroke={navy} strokeWidth="4.5" />
      </svg>
      <span className="font-display text-[22px] font-semibold leading-none tracking-tight" style={{ color: navy }}>
        CHEMI<span style={{ color: light ? '#8fcfb2' : '#087F5B' }}>LINX</span>
      </span>
    </span>
  );
}

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-ink-soft">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> <span>{label}…</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 border border-red-800/30 bg-red-50 p-6 text-center text-red-900">
      <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      <p>{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-dark">Try again</button>}
    </div>
  );
}

export function Eyebrow({ index, children, dark = false }: { index?: string; children: ReactNode; dark?: boolean }) {
  return (
    <p className={`label flex items-center gap-3 ${dark ? '!text-mint' : '!text-emerald-dark'}`}>
      {index && <span className="tabular-nums">{index}</span>}
      <span className={`h-px w-10 ${dark ? 'bg-mint/50' : 'bg-emerald/50'}`} aria-hidden="true" />
      {children}
    </p>
  );
}

/** Dark, full-bleed page opener with giant line-revealed title. */
export function PageHero({ eyebrow, lines, intro, children, aside }: { eyebrow: string; lines: string[]; intro?: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-navy pt-36 text-white sm:pt-44">
      <div className="grid-lines absolute inset-0 -z-10" aria-hidden="true" />
      <svg className="pointer-events-none absolute -right-40 top-10 -z-10 hidden h-[640px] w-[640px] opacity-[0.06] lg:block" viewBox="0 0 40 40" aria-hidden="true">
        <rect x="3" y="3" width="20" height="20" fill="none" stroke="#fff" strokeWidth=".5" /><rect x="14" y="14" width="22" height="22" fill="none" stroke="#fff" strokeWidth=".5" />
      </svg>
      <Container className="pb-16 sm:pb-24">
        <Eyebrow dark>{eyebrow}</Eyebrow>
        <h1 className="display mt-7 max-w-[16ch] text-white"><Lines lines={lines} delay={0.1} /></h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {intro && <Reveal delay={0.5} className="max-w-xl text-lg leading-relaxed text-white/70 lg:col-span-6">{intro}</Reveal>}
          {aside && <div className="lg:col-span-5 lg:col-start-8">{aside}</div>}
        </div>
        {children}
      </Container>
    </section>
  );
}

export function ArrowLink({ to, children, light = false }: { to: string; children: ReactNode; light?: boolean }) {
  return (
    <Link to={to} className={`group inline-flex items-center gap-2 text-sm font-semibold ${light ? 'text-white' : 'text-emerald-dark'}`}>
      <span className="underline-grow pb-0.5">{children}</span>
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

/** Catalogue tile: line-art plate + type. */
export function ProductTile({ p, index, className = '' }: { p: Product; index?: number; className?: string }) {
  const tone = toneFor(p.category.slug);
  return (
    <article className={`group relative flex h-full flex-col overflow-hidden border border-navy/15 bg-paper transition-colors duration-300 hover:border-navy ${className}`}>
      <div className="relative min-h-[190px] flex-1 overflow-hidden" style={{ background: tone.bg, color: tone.fg }}>
        {p.imageUrl
          ? <img src={p.imageUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
          : <CategoryArt slug={p.category.slug} className="absolute inset-0 m-auto h-[88%] w-[88%] opacity-60 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:opacity-90" />}
        <span className="label absolute left-4 top-4 !text-current opacity-80">{p.category.name}</span>
        {index !== undefined && <span className="label absolute right-4 top-4 !text-current tabular-nums opacity-80">№ {String(index + 1).padStart(2, '0')}</span>}
      </div>
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <h3 className="display-sm !text-[1.65rem]"><Link to={`/products/${p.slug}`} className="after:absolute after:inset-0 focus-visible:outline-offset-[-3px]">{p.name}</Link></h3>
          <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink-soft">{p.description}</p>
        </div>
        <ArrowUpRight className="mt-1 h-6 w-6 shrink-0 text-navy/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-emerald" aria-hidden="true" />
      </div>
      <Link to={`/request-quote?product=${p.slug}`} className="label relative z-10 border-t border-navy/10 px-5 py-3 !text-navy transition-colors hover:bg-navy hover:!text-white">Request quotation →</Link>
    </article>
  );
}

export function Field({ label, error, hint, children, id, line = false }: { label: string; error?: string; hint?: string; children: ReactNode; id: string; line?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className={line ? 'label block !text-navy' : 'mb-1.5 block text-sm font-semibold text-navy'}>{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-sm text-red-800">{error}</p>}
    </div>
  );
}
