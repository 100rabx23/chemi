import { useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { Field } from '../components/ui';
import { PageTitle, Panel } from './kit';
import { useAuth, type AdminUser } from './AdminApp';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try {
      const body: Record<string, string> = { name };
      if (next) { body.currentPassword = cur; body.newPassword = next; }
      const u = await api<AdminUser>('/admin/profile', { method: 'PATCH', body });
      setUser({ ...user!, name: u.name }); setCur(''); setNext(''); setMsg({ ok: true, text: next ? 'Profile and password updated. Other sessions were signed out.' : 'Profile updated.' });
    } catch (x) { setMsg({ ok: false, text: x instanceof Error ? x.message : 'Update failed' }); }
    finally { setBusy(false); }
  }

  return (
    <>
      <PageTitle title="Profile" sub={`${user?.email} · ${user?.role}`} />
      <Panel className="max-w-lg p-6">
        <form onSubmit={save} className="grid gap-4">
          <Field id="pr-name" label="Display name"><input id="pr-name" required minLength={2} className="field" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <h2 className="mt-3 text-xl">Change password</h2>
          <Field id="pr-cur" label="Current password"><input id="pr-cur" type="password" autoComplete="current-password" className="field" value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
          <Field id="pr-new" label="New password" hint="At least 10 characters with upper-case, lower-case and a number."><input id="pr-new" type="password" autoComplete="new-password" className="field" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
          {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-dark' : 'text-red-800'}`}>{msg.text}</p>}
          <div><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button></div>
        </form>
      </Panel>
    </>
  );
}
