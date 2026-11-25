import { useEffect, useState } from 'react';
import { api, FALLBACK_CONTACT, type Category, type SiteInfo } from './api';

let sitePromise: Promise<SiteInfo> | null = null;
let catPromise: Promise<Category[]> | null = null;

export function useSite() {
  const [site, setSite] = useState<SiteInfo>({ contact: FALLBACK_CONTACT, testimonials: [] });
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    sitePromise ??= api<SiteInfo>('/site').catch((e) => { sitePromise = null; throw e; });
    sitePromise.then((s) => { setSite({ contact: s.contact ?? FALLBACK_CONTACT, testimonials: s.testimonials }); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);
  return { ...site, contact: site.contact ?? FALLBACK_CONTACT, loaded };
}

export function useCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  useEffect(() => {
    catPromise ??= api<{ items: Category[] }>('/categories').then((r) => r.items).catch((e) => { catPromise = null; throw e; });
    catPromise.then(setCats).catch(() => undefined);
  }, []);
  return cats;
}
