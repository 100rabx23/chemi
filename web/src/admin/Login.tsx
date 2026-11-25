import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Logo } from '../components/ui';
import { useAuth, type AdminUser } from './AdminApp';

const PILLS = [['#1d2429', '#d9dedb'], ['#2f5d4e', '#d6ebe0'], ['#1d3b4a', '#cfe3ee'], ['#4a5358', '#e1e6e3'], ['#37607a', '#d9e9f3'], ['#6f8a78', '#102018']];

export default function Login() {
  const { setUser } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const r = await api<{ user: AdminUser }>('/auth/login', { method: 'POST', body: { email, password } });
      setUser(r.user); nav('/admin');
    } catch (err) { setError(err instanceof Error ? err.message : 'Login failed'); }
    finally { setBusy(false); }
  }

  return (
    <div className="admin grid min-h-screen bg-paper lg:grid-cols-2">
      <aside className="on-dark relative hidden flex-col justify-between overflow-hidden bg-graphite p-12 text-white lg:flex" aria-hidden="true">
        <Logo light />
        <ul className="mx-auto w-[300px]">
          {PILLS.map(([bg, fg], i) => <li key={bg} className="relative -mt-9 h-[64px] rounded-[32px] first:mt-0" style={{ background: bg, color: fg, zIndex: i, boxShadow: '0 -8px 24px -10px rgba(0,0,0,.5)' }} />)}
        </ul>
        <div><p className="label">Admin console</p><p className="display-md mt-3 !text-[clamp(2rem,3.4vw,3.4rem)] text-white">Products, inquiries and messages in one place.</p></div>
      </aside>
      <main id="main" className="grid place-items-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden"><Logo /></div>
          <h1 className="display-md mt-8 !text-[clamp(2.2rem,4vw,3.4rem)] lg:mt-0">Admin sign in</h1>
          <p className="mt-2 text-ink-soft">Authorised Chemilinx staff only.</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div><label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-navy">Email</label><input id="email" type="email" autoComplete="username" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-navy">Password</label><input id="password" type="password" autoComplete="current-password" required className="field" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            {error && <p role="alert" className="rounded-xl border border-red-800/30 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
            <button className="btn-primary w-full !py-3.5" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <Link to="/" className="pill mt-8 hover:!bg-white">← Back to website</Link>
        </div>
      </main>
    </div>
  );
}
