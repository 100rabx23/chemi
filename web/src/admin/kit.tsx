import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Spinner, ErrorState } from '../components/ui';

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="display-md !text-[clamp(2rem,3.6vw,3.2rem)]">{title}</h1>{sub && <p className="mt-2 text-ink-soft">{sub}</p>}</div>{action}
    </div>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden rounded-2xl border border-navy/10 bg-bone ${className}`}>{children}</div>;
}

export function Pager({ page, total, pageSize, onPage }: { page: number; total: number; pageSize: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between border-t border-navy/10 px-4 py-3 text-sm">
      <span className="label">{total} total</span>
      <div className="flex items-center gap-2">
        <button className="btn-ghost !px-3 !py-1.5" disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</button>
        <span className="label">{page} / {pages}</span>
        <button className="btn-ghost !px-3 !py-1.5" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus(); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-graphite/70 p-4 backdrop-blur-sm sm:p-10" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={`w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} overflow-hidden rounded-3xl bg-paper outline-none`}>
        <div className="flex items-center justify-between border-b border-navy/15 px-6 py-4"><h2 className="display-sm !text-[1.7rem]">{title}</h2><button onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-navy/10"><X className="h-5 w-5" /></button></div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ title, message, confirmLabel = 'Delete', busy, onConfirm, onCancel }: { title: string; message: ReactNode; confirmLabel?: string; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="leading-relaxed text-ink-soft">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn bg-red-800 text-white hover:bg-red-900" onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</button>
      </div>
    </Modal>
  );
}

export function Async({ loading, error, onRetry, children }: { loading: boolean; error: string | null; onRetry: () => void; children: ReactNode }) {
  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  return <>{children}</>;
}

export function Badge({ children, tone = 'grey' }: { children: ReactNode; tone?: 'grey' | 'green' | 'amber' | 'blue' | 'red' }) {
  const c = { grey: 'bg-mist text-charcoal', green: 'bg-emerald/15 text-emerald-dark', amber: 'bg-amber-100 text-amber-900', blue: 'bg-sky-100 text-sky-900', red: 'bg-red-100 text-red-900' }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${c}`}>{children}</span>;
}

export const fmtDate = (s: string) => new Date(s).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

/** Ankleshwar local time + date, like the site header. */
export function Clock() {
  const fmt = () => {
    const d = new Date();
    return {
      time: d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase(),
      date: d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'long' }),
    };
  };
  const [v, setV] = useState(fmt);
  useEffect(() => { const t = setInterval(() => setV(fmt()), 20_000); return () => clearInterval(t); }, []);
  return <span className="pill !py-2 !text-ink-soft">Ankleshwar <b className="font-semibold text-navy">{v.time}</b><span aria-hidden="true">·</span>{v.date}</span>;
}
