import { useCallback, useEffect, useRef, useState } from 'react';

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: Record<string, string[]>) {
    super(message);
  }
}

export async function api<T>(path: string, opts: { method?: string; body?: unknown; form?: FormData } = {}): Promise<T> {
  const method = opts.method ?? 'GET';
  const headers: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' };
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(opts.body); }
  let res: Response;
  try {
    res = await fetch(`/api${path}`, { method, headers, body, credentials: 'include' });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Please check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`, data.details);
  return data as T;
}

export interface State<T> { data: T | null; error: string | null; loading: boolean; reload: () => void }

/** Minimal data hook with loading/error state and cancellation. */
export function useApi<T>(path: string | null): State<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  const seq = useRef(0);

  useEffect(() => {
    if (path === null) { setLoading(false); return; }
    const id = ++seq.current;
    setLoading(true); setError(null);
    api<T>(path)
      .then((d) => { if (id === seq.current) { setData(d); setLoading(false); } })
      .catch((e: Error) => { if (id === seq.current) { setError(e.message); setLoading(false); } });
    return () => { seq.current++; };
  }, [path, tick]);

  return { data, error, loading, reload };
}

export interface Category { id: string; slug: string; name: string; tagline: string | null; description: string | null; imageUrl: string | null; sortOrder: number; productCount?: number }
export interface Product {
  id: string; slug: string; name: string; description: string; imageUrl: string | null;
  specifications: { label: string; value: string }[]; featured: boolean; published: boolean; sortOrder: number;
  categoryId: string; category: { id: string; slug: string; name: string }; updatedAt: string;
}
export interface Paged<T> { items: T[]; total: number; page: number; pageSize: number }
export interface SiteContact {
  companyName: string; address: string; phone: string; emailGeneral: string; emailSales: string; emailExports: string;
  facebook: string; instagram: string; linkedin: string; mapQuery: string;
}
export interface Testimonial { name: string; role: string; company: string; quote: string }
export interface SiteInfo { contact: SiteContact | null; testimonials: Testimonial[] }

export const FALLBACK_CONTACT: SiteContact = {
  companyName: 'Chemilinx', address: '315, Golden Square, Ankleshwar - Valia Rd, GIDC, Gujarat 393002', phone: '+91 8866865578',
  emailGeneral: 'info@chemilinx.in', emailSales: 'sales@chemilinx.in', emailExports: 'exports@chemilinx.in',
  facebook: '', instagram: '', linkedin: '', mapQuery: 'Golden Square, Ankleshwar GIDC, Gujarat',
};
