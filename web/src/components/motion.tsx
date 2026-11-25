import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUp } from 'lucide-react';

/** Fade/translate reveal on enter. */
export function Reveal({ children, delay = 0, y = 24, className = '', as = 'div' }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'li' | 'section' | 'article' }) {
  const reduce = useReducedMotion();
  const M = motion[as] as typeof motion.div;
  return (
    <M className={className} initial={reduce ? false : { opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] }}>
      {children}
    </M>
  );
}

/** Headline revealed line by line (pass lines as separate strings). */
export function Lines({ lines, className = '', delay = 0, lastClass = '' }: { lines: string[]; className?: string; delay?: number; lastClass?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={l} className="block overflow-hidden pb-[0.08em]">
          <motion.span className={`block ${i === lines.length - 1 ? lastClass : ''}`}
            initial={reduce ? false : { y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.95, delay: delay + i * 0.12, ease: [0.22, 0.8, 0.2, 1] }}>
            {l}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Parallax image: the image is taller than its frame and drifts with scroll. */
export function ParallaxImage({ src, alt, className = '', imgClassName = '', speed = 12, width, height, priority = false }: {
  src: string; alt: string; className?: string; imgClassName?: string; speed?: number; width?: number; height?: number; priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed}%`, `${speed}%`]);
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img src={src} alt={alt} width={width} height={height} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined}
        style={reduce ? undefined : { y, scale: 1 + (speed * 2) / 100 }} className={`h-full w-full object-cover ${imgClassName}`} />
    </div>
  );
}

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.55, 1]);
  return <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">{word}</motion.span>;
}

/** Statement whose words light up as it scrolls through the viewport. */
export function ScrollWords({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = text.split(' ');
  if (reduce) return <p className={className}>{text}</p>;
  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, Math.min(1, (i + 1.5) / words.length)]} />)}
      </span>
    </p>
  );
}

/** Infinite horizontal ticker. */
export function Marquee({ items, className = '' }: { items: string[]; className?: string }) {
  const reduce = useReducedMotion();
  const row = (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={reduce ? undefined : true}>
      {items.map((t) => <li key={t} className="flex items-center gap-10 whitespace-nowrap"><span>{t}</span><span className="h-1.5 w-1.5 rotate-45 bg-emerald" aria-hidden="true" /></li>)}
    </ul>
  );
  if (reduce) return <div className={`overflow-x-auto ${className}`}>{row}</div>;
  return (
    <div className={`overflow-hidden ${className}`} role="presentation">
      <motion.div className="flex w-max" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 60, ease: 'linear', repeat: Infinity }}>{row}{row}</motion.div>
    </div>
  );
}

/** Clip-path wipe for blocks/images. */
export function Wipe({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { clipPath: 'inset(0 0 100% 0)' }} whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 1.1, delay, ease: [0.77, 0, 0.18, 1] }}>
      {children}
    </motion.div>
  );
}

/** Odometer-style number: each digit is a reel that rolls into place when scrolled into view. */
export function RollingNumber({ value, className = '' }: { value: string | number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  const chars = String(value).split('');
  return (
    <span ref={ref} role="img" className={`inline-flex tabular-nums ${className}`} aria-label={String(value)}>
      {chars.map((c, i) => /\d/.test(c) ? (
        <span key={i} aria-hidden="true" className="relative inline-block h-[1em] overflow-hidden leading-none">
          <motion.span className="flex flex-col" initial={false} animate={{ y: seen || reduce ? `${-Number(c)}em` : '0em' }} transition={{ duration: 1.4 + i * 0.25, ease: [0.16, 1, 0.3, 1] }}>
            {Array.from({ length: 10 }, (_, d) => <span key={d} className="block h-[1em] leading-none">{d}</span>)}
          </motion.span>
        </span>
      ) : <span key={i} aria-hidden="true">{c}</span>)}
    </span>
  );
}

/** Spiral-bound flip pad that cycles through words (screen readers get the full list once). */
export function FlipWord({ words, interval = 2600, className = '' }: { words: string[]; interval?: number; className?: string }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || words.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval, reduce]);
  return (
    <div className={`relative inline-block ${className}`} style={{ perspective: 900 }}>
      <span className="sr-only">{words.join(', ')}</span>
      <div aria-hidden="true" className="relative">
        <div className="absolute inset-x-5 -top-3 z-10 flex justify-between">{Array.from({ length: 11 }, (_, k) => <span key={k} className="h-5 w-2 rounded-full bg-gradient-to-b from-white to-[#aeb2ad] shadow-[0_1px_2px_rgba(0,0,0,.35)]" />)}</div>
        <div className="relative overflow-hidden border border-navy/15 bg-bone px-6 pb-4 pt-6 shadow-[0_10px_0_-4px_#d8d6cf,0_18px_30px_-12px_rgba(15,40,51,.35)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={words[i]} initial={{ rotateX: -90, opacity: 0, transformOrigin: 'top' }} animate={{ rotateX: 0, opacity: 1 }} exit={{ rotateX: 90, opacity: 0, transformOrigin: 'bottom' }}
              transition={{ duration: 0.32, ease: [0.22, 0.8, 0.2, 1] }} className="whitespace-nowrap font-display text-[clamp(1.9rem,4.6vw,4.2rem)] font-bold leading-[1.05] tracking-tight text-navy">
              {words[i]}
            </motion.div>
          </AnimatePresence>
          <p className="label mt-1 text-right tabular-nums">{String(i + 1).padStart(2, '0')} / {String(words.length).padStart(2, '0')}</p>
        </div>
      </div>
    </div>
  );
}

/** Round back-to-top button with a scroll-progress ring. */
export function ScrollTop() {
  const { scrollYProgress } = useScroll();
  const prog = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 700);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-graphite text-white shadow-lg transition-colors hover:bg-emerald">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2" /><motion.circle cx="24" cy="24" r="22" fill="none" stroke="#8fcfb2" strokeWidth="2" strokeLinecap="round" style={{ pathLength: prog }} /></svg>
          <ArrowUp className="relative h-4 w-4" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
