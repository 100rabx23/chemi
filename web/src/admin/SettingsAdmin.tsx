import { useEffect, useState, type FormEvent } from 'react';
import { api, useApi, type SiteContact, type Testimonial } from '../lib/api';
import { Async, PageTitle, Panel } from './kit';
import { Field } from '../components/ui';
import { useAuth } from './AdminApp';

interface Settings { contact?: SiteContact; notifications?: { notifyEmail: string }; testimonials?: { visible: boolean; items: Testimonial[] } }
const contactFields: [keyof SiteContact, string][] = [
  ['address', 'Address'], ['phone', 'Phone'], ['emailGeneral', 'General email'], ['emailSales', 'Sales email'], ['emailExports', 'Exports email'],
  ['linkedin', 'LinkedIn URL'], ['instagram', 'Instagram URL'], ['facebook', 'Facebook URL'], ['mapQuery', 'Map search text'],
];

export default function SettingsAdmin() {
  const { user } = useAuth();
  const res = useApi<Settings>('/admin/settings');
  const [s, setS] = useState<Settings>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { if (res.data) setS(res.data); }, [res.data]);
  const isAdmin = user?.role === 'ADMIN';

  async function save(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try { await api('/admin/settings', { method: 'PUT', body: s }); setMsg({ ok: true, text: 'Settings saved.' }); }
    catch (x) { setMsg({ ok: false, text: x instanceof Error ? x.message : 'Save failed' }); }
    finally { setBusy(false); }
  }
  const c = s.contact ?? ({} as SiteContact);
  const t = s.testimonials ?? { visible: false, items: [] };

  return (
    <>
      <PageTitle title="Website settings" sub={isAdmin ? 'Contact details, notification address and testimonials.' : 'Read-only: only administrators can change settings.'} />
      <Async loading={res.loading} error={res.error} onRetry={res.reload}>
        <form onSubmit={save} className="grid max-w-3xl gap-8">
          <fieldset disabled={!isAdmin} className="contents">
            <Panel className="p-6">
              <h2 className="text-xl">Contact details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {contactFields.map(([k, label]) => <div key={k} className={k === 'address' ? 'sm:col-span-2' : ''}><Field id={`s-${k}`} label={label}><input id={`s-${k}`} className="field" value={c[k] ?? ''} onChange={(e) => setS({ ...s, contact: { ...c, [k]: e.target.value } })} /></Field></div>)}
              </div>
              <p className="mt-3 text-xs text-ink-soft">The previous website lists the pincode as both 393002 (contact page) and 393001 (map link). Please confirm the correct one.</p>
            </Panel>
            <Panel className="p-6">
              <h2 className="text-xl">Notifications</h2>
              <div className="mt-5 max-w-md"><Field id="s-notify" label="Business notification email" hint="New quotation requests and messages are emailed here (requires SMTP to be configured on the server)."><input id="s-notify" type="email" className="field" value={s.notifications?.notifyEmail ?? ''} onChange={(e) => setS({ ...s, notifications: { notifyEmail: e.target.value } })} /></Field></div>
            </Panel>
            <Panel className="p-6">
              <h2 className="text-xl">Testimonials</h2>
              <p className="mt-1 text-sm text-ink-soft">Hidden by default. Enable only once you have confirmed each testimonial is genuine and approved for publication.</p>
              <label className="mt-4 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 accent-emerald" checked={t.visible} onChange={(e) => setS({ ...s, testimonials: { ...t, visible: e.target.checked } })} /> Show testimonials on the home page</label>
              <ul className="mt-4 space-y-3">
                {t.items.map((it, i) => <li key={i} className="border border-navy/15 p-3 text-sm"><b>{it.name}</b>, {it.role}, {it.company}<p className="mt-1 text-ink-soft">“{it.quote}”</p></li>)}
              </ul>
            </Panel>
          </fieldset>
          {isAdmin && <div className="flex items-center gap-4"><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>{msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-dark' : 'text-red-800'}`}>{msg.text}</p>}</div>}
        </form>
      </Async>
    </>
  );
}
