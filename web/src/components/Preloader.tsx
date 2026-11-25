import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const PILLS = [
  { label: 'Chemilinx', bg: '#1d2429', fg: '#d9dedb' },
  { label: 'Fragrance', bg: '#2f5d4e', fg: '#d6ebe0' },
  { label: 'Solvents', bg: '#1d3b4a', fg: '#cfe3ee' },
  { label: 'Plasticizers', bg: '#4a5358', fg: '#e1e6e3' },
  { label: 'Thinners', bg: '#37607a', fg: '#d9e9f3' },
  { label: 'Industrial', bg: '#6f8a78', fg: '#102018' },
  { label: 'Minerals', bg: '#7d7469', fg: '#f1ece4' },
];

/** First-visit intro: stacked pills + counter. Shown once per browser session, never in /admin. */
export function Preloader() {
  const reduce = useReducedMotion();
  const skip = typeof window === 'undefined' || window.location.pathname.startsWith('/admin') || sessionStorage.getItem('cx-intro') === '1';
  const [on, setOn] = useState(!skip && !reduce);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!on) return;
    document.body.style.overflow = 'hidden';
    const start = performance.now();
    const dur = 1450;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => { sessionStorage.setItem('cx-intro', '1'); document.body.style.overflow = ''; setOn(false); }, 280);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); document.body.style.overflow = ''; };
  }, [on]);

  return (
    <AnimatePresence>
      {on && (
        <motion.div key="pre" role="status" aria-label="Loading Chemilinx" exit={{ y: '-100%' }} transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] overflow-hidden bg-[#121719] text-white">
          <div className="absolute left-6 top-6 flex w-[calc(100%-3rem)] items-center justify-between text-sm"><span className="font-medium">Chemilinx <span className="text-white/50">· Catalogue</span></span><span className="hidden text-white/60 sm:block">Aroma · Solvents · Plasticizers · Thinners · Acids · Minerals</span></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ul className="relative w-[min(320px,78vw)]" aria-hidden="true">
              {PILLS.map((p, i) => (
                <motion.li key={p.label} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 + i * 0.07, duration: 0.55, ease: [0.22, 0.8, 0.2, 1] }}
                  className="relative -mt-11 flex h-[68px] items-start rounded-[34px] px-7 pt-[14px] text-[15px] font-semibold first:mt-0"
                  style={{ background: p.bg, color: p.fg, zIndex: i, boxShadow: '0 -8px 24px -10px rgba(0,0,0,.5)' }}>{p.label}</motion.li>
              ))}
            </ul>
          </div>
          <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">Opening the catalogue</p>
            <p className="font-display text-[clamp(4.5rem,13vw,10rem)] font-bold leading-[0.9] tracking-tighter tabular-nums">{String(n).padStart(3, '0')}</p>
          </div>
          <div className="absolute bottom-8 right-6 hidden h-[3px] w-48 overflow-hidden bg-white/15 sm:block sm:right-10"><div className="h-full bg-mint" style={{ width: `${n}%` }} /></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
