import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useSite } from '../lib/site';
import { useSEO } from '../lib/seo';
import { Container, Eyebrow, Field, PageHero } from '../components/ui';
import { Reveal } from '../components/motion';

export default function Contact() {
  const { contact } = useSite();
  useSEO({ title: 'Contact', description: 'Contact Chemilinx — 315, Golden Square, Ankleshwar - Valia Rd, GIDC, Gujarat. Phone +91 8866865578. Email info@chemilinx.in.' });
  const [f, setF] = useState({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');
  const on = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  const inv = (k: string) => (errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `${k}-err` } : {});

  async function submit(e: FormEvent) {
    e.preventDefault(); setServerError('');
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) er.email = 'Enter a valid email address.';
    if (f.message.trim().length < 10) er.message = 'Please write at least 10 characters.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try { await api('/contact', { method: 'POST', body: f }); setSent(true); }
    catch (err) {
      if (err instanceof ApiError && err.details) setErrors(Object.fromEntries(Object.entries(err.details).map(([k, v]) => [k, v[0]])));
      setServerError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally { setBusy(false); }
  }

  const tel = contact.phone.replace(/\s/g, '');
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(contact.mapQuery || contact.address)}&output=embed`;

  return (
    <>
      <PageHero eyebrow="Contact" lines={['Let’s talk', 'chemistry.']} intro="Whether you’re seeking chemical solutions, exploring partnership opportunities, or simply want to learn more about Chemilinx — reach out." />

      <Container className="grid gap-16 py-20 sm:py-28 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow index="01">Reach us</Eyebrow>
          <dl className="mt-8 border-t border-navy">
            <div className="border-b border-navy/20 py-6"><dt className="label">Address</dt><dd className="mt-2"><address className="display-sm not-italic !text-[1.55rem] !leading-snug">{contact.address}</address></dd></div>
            <div className="border-b border-navy/20 py-6"><dt className="label">Phone</dt><dd className="mt-2"><a href={`tel:${tel}`} className="display-sm underline-grow !text-[1.9rem]">{contact.phone}</a></dd></div>
            <div className="border-b border-navy/20 py-6"><dt className="label">Email</dt>
              <dd className="mt-2 space-y-1.5 text-lg">
                {[[contact.emailGeneral, 'General'], [contact.emailSales, 'Sales'], [contact.emailExports, 'Exports']].map(([e, l]) => <p key={e}><a href={`mailto:${e}`} className="underline-grow">{e}</a> <span className="label ml-2">{l}</span></p>)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-7">
          {sent ? (
            <div role="status"><CheckCircle2 className="h-12 w-12 text-emerald-dark" aria-hidden="true" /><h2 className="display-md mt-6">Message sent.</h2><p className="mt-4 text-lg text-ink-soft">Thank you for writing to us. We’ll get back to you shortly.</p></div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              <h2 className="display-sm sm:col-span-2 !text-[1.8rem]">Send us a message</h2>
              <Field line id="c-name" label="Name" error={errors.name}><input id="c-name" autoComplete="name" className="field-line" value={f.name} onChange={on('name')} {...inv('name')} /></Field>
              <Field line id="c-email" label="Email" error={errors.email}><input id="c-email" type="email" autoComplete="email" className="field-line" value={f.email} onChange={on('email')} {...inv('email')} /></Field>
              <Field line id="c-phone" label="Phone (optional)"><input id="c-phone" type="tel" autoComplete="tel" className="field-line" value={f.phone} onChange={on('phone')} /></Field>
              <Field line id="c-subject" label="Subject (optional)"><input id="c-subject" className="field-line" value={f.subject} onChange={on('subject')} /></Field>
              <div className="sm:col-span-2"><Field line id="c-message" label="Message" error={errors.message}><textarea id="c-message" rows={5} className="field-line resize-none" value={f.message} onChange={on('message')} {...inv('message')} /></Field></div>
              <div className="absolute -left-[9999px]" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={on('website')} /></label></div>
              {serverError && <p role="alert" className="border border-red-800/30 bg-red-50 p-4 text-red-900 sm:col-span-2">{serverError}</p>}
              <Reveal className="sm:col-span-2"><button className="btn-primary !px-10 !py-4 uppercase tracking-[0.14em]" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button></Reveal>
            </form>
          )}
        </div>
      </Container>

      <section aria-label="Map" className="border-t border-navy/20">
        <iframe title="Chemilinx location, Ankleshwar GIDC" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[420px] w-full border-0 grayscale contrast-125" />
        <Container className="py-3 text-xs text-ink-soft">Map shows the Golden Square area, Ankleshwar GIDC. <a className="underline" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapQuery || contact.address)}`}>Open in Google Maps</a></Container>
      </section>
    </>
  );
}
