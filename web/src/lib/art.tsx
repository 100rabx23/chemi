import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Original technical line illustrations, one per product family. Colour via currentColor. */

function Draw({ d, delay = 0, w = 1.25 }: { d: string; delay?: number; w?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <path d={d} strokeWidth={w} />;
  return (
    <motion.path d={d} strokeWidth={w} initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }} transition={{ duration: 1.7, delay, ease: [0.45, 0, 0.2, 1] }} />
  );
}

const hex = (cx: number, cy: number, r: number, rot = 0) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i + rot) * Math.PI) / 180;
    return `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ') + 'Z';

const cube = (cx: number, cy: number, r: number) => {
  const p = (i: number) => [cx + r * Math.cos(((60 * i - 90) * Math.PI) / 180), cy + r * Math.sin(((60 * i - 90) * Math.PI) / 180)];
  const [a, b, c, d, e, f] = [0, 1, 2, 3, 4, 5].map(p);
  const m = (q: number[]) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  return [`M${m(a)} L${m(b)} L${m(c)} L${m(d)} L${m(e)} L${m(f)}Z`, `M${cx} ${cy} L${m(a)}`, `M${cx} ${cy} L${m(c)}`, `M${cx} ${cy} L${m(e)}`];
};

const ARTS: Record<string, () => ReactNode> = {
  'fragrance-solutions': () => (
    <>
      <Draw d={hex(150, 150, 62, 30)} /><Draw d={hex(150, 150, 44, 30)} delay={0.2} />
      <Draw d={hex(257, 212, 62, 30)} delay={0.3} /><Draw d={hex(257, 88, 38, 30)} delay={0.4} />
      <Draw d="M312 150 L360 122 M312 150 L360 178" delay={0.6} />
      <Draw d="M40 60 q30 -26 60 0 q-30 26 -60 0Z M40 250 q26 -30 52 0 q-26 30 -52 0Z" delay={0.7} />
      <circle cx="368" cy="122" r="5" /><circle cx="368" cy="178" r="5" />
    </>
  ),
  'versatile-solvents': () => (
    <>
      <Draw d="M172 36 H228 M182 36 V118 L118 238 Q108 262 134 262 H266 Q292 262 282 238 L218 118 V36" />
      <Draw d="M136 206 Q168 192 200 206 T264 206" delay={0.5} />
      <Draw d="M128 232 H272" delay={0.6} />
      <circle cx="178" cy="228" r="6" /><circle cx="206" cy="218" r="4" /><circle cx="226" cy="236" r="7" /><circle cx="196" cy="244" r="3" />
      <Draw d="M300 80 h60 M300 110 h40 M300 140 h60 M300 170 h40" delay={0.8} />
    </>
  ),
  'enhancing-plasticizers': () => (
    <>
      <Draw d="M20 130 L60 90 L100 130 L140 90 L180 130 L220 90 L260 130 L300 90 L340 130 L380 90" />
      <Draw d="M20 210 L60 170 L100 210 L140 170 L180 210 L220 170 L260 210 L300 170 L340 210 L380 170" delay={0.25} />
      <Draw d="M100 130 L100 170 M180 130 L180 170 M260 130 L260 170 M340 130 L340 170" delay={0.7} />
      <Draw d="M60 90 V50 M140 90 V50 M220 90 V50 M300 90 V50 M60 170 V250 M220 170 V250" delay={0.9} />
      {[60, 140, 220, 300].map((x) => <circle key={x} cx={x} cy="44" r="6" />)}
      {[60, 220].map((x) => <circle key={x} cy="256" cx={x} r="6" />)}
    </>
  ),
  'paint-thinners': () => (
    <>
      <Draw d="M200 28 C200 28 128 118 128 172 a72 72 0 0 0 144 0 C272 118 200 28 200 28Z" />
      <Draw d="M170 176 a32 32 0 0 0 30 32" delay={0.5} />
      <Draw d="M96 262 Q200 296 304 262" delay={0.7} /><Draw d="M60 270 Q200 318 340 270" delay={0.9} />
      <Draw d="M320 60 C320 60 292 94 292 114 a28 28 0 0 0 56 0 C348 94 320 60 320 60Z" delay={0.4} />
    </>
  ),
  'additional-products': () => (
    <>
      {Array.from({ length: 14 }, (_, i) => (
        <Draw key={i} d={`M${34 + i * 25} 250 V${210 - ((i * 37) % 11) * 12 - i * 4}`} delay={i * 0.06} w={i % 3 === 0 ? 2.5 : 1.25} />
      ))}
      <Draw d="M24 250 H376" delay={0.2} />
      <Draw d="M24 262 v10 M99 262 v10 M174 262 v10 M249 262 v10 M324 262 v10" delay={0.6} />
      <circle cx="320" cy="60" r="22" /><circle cx="360" cy="84" r="11" /><Draw d="M303 76 L350 80" delay={0.8} />
    </>
  ),
  'industrial-minerals': () => (
    <>
      {cube(150, 160, 84).map((d, i) => <Draw key={`a${i}`} d={d} delay={i * 0.15} />)}
      {cube(268, 108, 48).map((d, i) => <Draw key={`b${i}`} d={d} delay={0.4 + i * 0.15} />)}
      {cube(290, 226, 34).map((d, i) => <Draw key={`c${i}`} d={d} delay={0.8 + i * 0.15} />)}
    </>
  ),
};

const FALLBACK = ARTS['industrial-minerals'];

export function CategoryArt({ slug, className = '' }: { slug: string; className?: string }) {
  const body = (ARTS[slug] ?? FALLBACK)();
  return (
    <svg viewBox="0 0 400 300" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      {body}
    </svg>
  );
}

/** Muted background/foreground pairs, one per family. */
const TONES: Record<string, { bg: string; fg: string }> = {
  'fragrance-solutions': { bg: '#173a33', fg: '#9fd4b9' },
  'versatile-solvents': { bg: '#0f2833', fg: '#8fc3d6' },
  'enhancing-plasticizers': { bg: '#222c31', fg: '#b6c4bd' },
  'paint-thinners': { bg: '#1a3445', fg: '#9cc3d9' },
  'additional-products': { bg: '#1f2b27', fg: '#a8cbb7' },
  'industrial-minerals': { bg: '#2a3135', fg: '#c3cdc6' },
};
export const toneFor = (slug: string) => TONES[slug] ?? { bg: '#1b2327', fg: '#a8cbb7' };
