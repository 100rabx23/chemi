import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { api, ApiError, useApi, type Paged, type Product } from '../lib/api';
import { useSEO } from '../lib/seo';
import { useSite } from '../lib/site';
import { Container, ErrorState, Eyebrow, Field, PageHero, Spinner } from '../components/ui';
import { Reveal } from '../components/motion';

interface Line { key: number; productId: string; quantity: string; unit: string }
const UNITS = [['kg', 'Kilograms (kg)'], ['MT', 'Metric tonnes (MT)'], ['litre', 'Litres'], ['drum', 'Drums'], ['other', 'Other (describe below)']];
let keySeq = 1;
const newLine = (productId = ''): Line => ({ key: keySeq++, productId, quantity: '', unit: 'kg' });

export default function Quote() {
  useSEO({ title: 'Request a Quote', description: 'Request a quotation from Chemilinx. Select products, quantities and units and our team will respond.' });
  const [params] = useSearchParams();
  const { contact } = useSite();
  const products = useApi<Paged<Product>>('/products?pageSize=100');
  const [lines, setLines] = useState<Line[]>([newLine()]);
  const [form, setForm] = useState({ customerName: '', companyName: '', email: '', phone: '', message: '', website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState<{ reference: string } | null>(null);

  const preselect = params.get('product');
  useEffect(() => {
    if (!preselect || !products.data) return;
    const p = products.data.items.find((x) => x.slug === preselect);
    if (p) setLines((ls) => (ls.length === 1 && !ls[0].productId ? [{ ...ls[0], productId: p.id }] : ls));
  }, [preselect, products.data]);

  const grouped = useMemo(() => {
    const m = new Map<string, Product[]>();
    products.data?.items.forEach((p) => m.set(p.category.name, [...(m.get(p.category.name) ?? []), p]));
    return [...m.entries()];
  }, [products.data]);

  const setF = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setLine = (key: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  function validate() {
    const e: Record<string, string> = {};
    if (form.customerName.trim().length < 2) e.customerName = 'Please enter your name.';
    if (form.companyName.trim().length < 2) e.companyName = 'Please enter your company name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address.';
    if (!/^[+()\-\s\d.]{7,30}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number.';
    lines.forEach((l) => {
      if (!l.productId) e[`p${l.key}`] = 'Choose a product.';
      const n = Number(l.quantity);
      if (!l.quantity || !(n > 0)) e[`q${l.key}`] = 'Enter a quantity above 0.';
    });
    if (form.message.length > 3000) e.message = 'Please keep this under 3000 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setServerError('');
    if (!validate()) { setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0); return; }
    setSubmitting(true);
    try {
      const r = await api<{ reference: string }>('/inquiries', {
        method: 'POST',
        body: { ...form, items: lines.map((l) => ({ productId: l.productId, quantity: Number(l.quantity), unit: l.unit })) },
      });
      setDone(r);
      window.scrollTo({ top: 0 });
    } catch (err) {
      if (err instanceof ApiError && err.details) setErrors(Object.fromEntries(Object.entries(err.details).map(([k, v]) => [k, v[0]])));
      setServerError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally { setSubmitting(false); }
  }

  if (done) {
    return (
      <section className="on-dark min-h-[80vh] bg-navy pb-24 pt-44 text-white">
        <Container>
          <div role="status">
            <CheckCircle2 className="h-12 w-12 text-mint" aria-hidden="true" />
            <h1 className="display mt-8 text-white">Request received.</h1>
            <p className="mt-6 max-w-xl text-xl text-white/75">Thank you. Our team will review your request and respond with a quotation.</p>
            <p className="label mt-10">Your reference</p>
            <p className="font-mono text-3xl text-white">{done.reference}</p>
            <div className="mt-10 flex gap-3"><Link to="/products" className="btn-primary">Back to catalogue</Link><Link to="/" className="btn-ghost-light">Home</Link></div>
          </div>
        </Container>
      </section>
    );
  }

  const inv = (k: string) => (errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `${k}-err` } : {});

  return (
    <>
      <PageHero eyebrow="Request a quote" lines={['Request', 'a quote.']} intro="Select your products and quantities. Pricing is by quotation — we respond with one." />
      <Container className="grid gap-16 py-20 sm:py-28 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Eyebrow>How it works</Eyebrow>
            <ol className="mt-6 border-t border-navy">
              {['Choose products and quantities', 'Tell us about your requirements', 'Receive a quotation from our team'].map((t, i) => <li key={t} className="flex gap-4 border-b border-navy/20 py-4"><span className="label tabular-nums !text-emerald-dark">{String(i + 1).padStart(2, '0')}</span><span>{t}</span></li>)}
            </ol>
            <p className="label mt-10">Prefer to talk?</p>
            <p className="mt-2"><a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="display-sm !text-[1.6rem] underline-grow">{contact.phone}</a></p>
            <p className="mt-2 text-sm"><a href={`mailto:${contact.emailSales}`} className="underline-grow text-ink-soft hover:text-navy">{contact.emailSales}</a></p>
          </div>
        </aside>

        <div className="lg:col-span-8">
          {products.loading && <Spinner label="Loading products" />}
          {products.error && <ErrorState message={products.error} onRetry={products.reload} />}
          {products.data && (
            <form onSubmit={submit} noValidate className="grid gap-16">
              <fieldset className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                <legend className="display-sm mb-8 !text-[1.8rem]"><span className="label mr-3 !text-emerald-dark">01</span>Your details</legend>
                <Field line id="customerName" label="Your name" error={errors.customerName}><input id="customerName" autoComplete="name" className="field-line" value={form.customerName} onChange={setF('customerName')} {...inv('customerName')} /></Field>
                <Field line id="companyName" label="Company name" error={errors.companyName}><input id="companyName" autoComplete="organization" className="field-line" value={form.companyName} onChange={setF('companyName')} {...inv('companyName')} /></Field>
                <Field line id="email" label="Email" error={errors.email}><input id="email" type="email" autoComplete="email" className="field-line" value={form.email} onChange={setF('email')} {...inv('email')} /></Field>
                <Field line id="phone" label="Phone" error={errors.phone} hint="Include country code for international numbers"><input id="phone" type="tel" autoComplete="tel" className="field-line" value={form.phone} onChange={setF('phone')} {...inv('phone')} /></Field>
              </fieldset>

              <fieldset>
                <legend className="display-sm mb-8 !text-[1.8rem]"><span className="label mr-3 !text-emerald-dark">02</span>Products &amp; quantities</legend>
                <ul className="border-t border-navy">
                  {lines.map((l, i) => (
                    <li key={l.key} className="grid gap-x-6 gap-y-4 border-b border-navy/20 py-6 sm:grid-cols-[1fr_8rem_12rem_auto] sm:items-start">
                      <Field line id={`p${l.key}`} label={`Product ${i + 1}`} error={errors[`p${l.key}`]}>
                        <select id={`p${l.key}`} className="field-line" value={l.productId} onChange={(e) => setLine(l.key, { productId: e.target.value })} {...inv(`p${l.key}`)}>
                          <option value="">Select a product…</option>
                          {grouped.map(([cat, ps]) => <optgroup key={cat} label={cat}>{ps.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</optgroup>)}
                        </select>
                      </Field>
                      <Field line id={`q${l.key}`} label="Quantity" error={errors[`q${l.key}`]}><input id={`q${l.key}`} inputMode="decimal" className="field-line" value={l.quantity} onChange={(e) => setLine(l.key, { quantity: e.target.value })} {...inv(`q${l.key}`)} /></Field>
                      <Field line id={`u${l.key}`} label="Unit"><select id={`u${l.key}`} className="field-line" value={l.unit} onChange={(e) => setLine(l.key, { unit: e.target.value })}>{UNITS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></Field>
                      <button type="button" disabled={lines.length === 1} onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} className="mt-6 p-2.5 text-ink-soft hover:text-red-800 disabled:opacity-30" aria-label={`Remove product ${i + 1}`}><Trash2 className="h-5 w-5" /></button>
                    </li>
                  ))}
                </ul>
                {errors.items && <p role="alert" className="mt-2 text-sm text-red-800">{errors.items}</p>}
                {lines.length < 20 && <button type="button" onClick={() => setLines((ls) => [...ls, newLine()])} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-dark hover:underline"><Plus className="h-4 w-4" aria-hidden="true" /> Add another product</button>}
              </fieldset>

              <fieldset>
                <legend className="display-sm mb-8 !text-[1.8rem]"><span className="label mr-3 !text-emerald-dark">03</span>Additional requirements</legend>
                <Field line id="message" label="Grade, packaging, delivery location, timing (optional)" error={errors.message}><textarea id="message" rows={4} className="field-line resize-none" value={form.message} onChange={setF('message')} {...inv('message')} /></Field>
              </fieldset>

              <div className="absolute -left-[9999px]" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={setF('website')} /></label></div>

              {serverError && <p role="alert" className="border border-red-800/30 bg-red-50 p-4 text-red-900">{serverError}</p>}
              <Reveal className="flex flex-wrap items-center gap-6">
                <button className="btn-primary !px-10 !py-4 uppercase tracking-[0.14em]" disabled={submitting}>{submitting ? 'Sending…' : 'Submit request'}</button>
                <p className="max-w-md text-xs text-ink-soft">By submitting you agree to our <Link to="/privacy-policy" className="underline">privacy policy</Link>. We use your details only to respond to this request.</p>
              </Reveal>
            </form>
          )}
        </div>
      </Container>
    </>
  );
}
