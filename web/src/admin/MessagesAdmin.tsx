import { useState } from 'react';
import { api, useApi, type Paged } from '../lib/api';
import { Async, Badge, fmtDate, PageTitle, Pager, Panel, useDebounced } from './kit';

type MStatus = 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
interface Msg { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; status: MStatus; createdAt: string }
const tone = { NEW: 'blue', READ: 'grey', REPLIED: 'green', ARCHIVED: 'grey' } as const;

export default function MessagesAdmin() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const q = useDebounced(search);
  const qs = new URLSearchParams({ page: String(page), pageSize: '15' });
  if (status) qs.set('status', status);
  if (q) qs.set('search', q);
  const list = useApi<Paged<Msg>>(`/admin/messages?${qs}`);

  async function setS(m: Msg, s: MStatus) {
    setErr('');
    try { await api(`/admin/messages/${m.id}`, { method: 'PATCH', body: { status: s } }); list.reload(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Update failed'); }
  }
  const toggle = (m: Msg) => { setOpen(open === m.id ? null : m.id); if (open !== m.id && m.status === 'NEW') void setS(m, 'READ'); };

  return (
    <>
      <PageTitle title="Messages" sub="Messages from the contact form." />
      <Panel>
        <div className="flex flex-wrap gap-3 border-b border-navy/10 p-4">
          <div className="min-w-56 flex-1"><label className="sr-only" htmlFor="ms">Search messages</label><input id="ms" type="search" placeholder="Search…" className="field" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
          <div><label className="sr-only" htmlFor="mst">Filter by status</label><select id="mst" className="field" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{['NEW', 'READ', 'REPLIED', 'ARCHIVED'].map((s) => <option key={s} value={s}>{s[0] + s.slice(1).toLowerCase()}</option>)}</select></div>
        </div>
        {err && <p role="alert" className="m-4 border border-red-800/30 bg-red-50 p-3 text-sm text-red-900">{err}</p>}
        <Async loading={list.loading} error={list.error} onRetry={list.reload}>
          <ul className="divide-y divide-navy/10">
            {list.data?.items.map((m) => (
              <li key={m.id}>
                <button onClick={() => toggle(m)} aria-expanded={open === m.id} className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-mist/40">
                  <span><span className={m.status === 'NEW' ? 'font-bold text-navy' : 'font-semibold text-navy'}>{m.name}</span> <span className="text-sm text-ink-soft">· {m.subject || m.message.slice(0, 60)}</span></span>
                  <span className="flex items-center gap-3"><Badge tone={tone[m.status]}>{m.status}</Badge><span className="label">{fmtDate(m.createdAt)}</span></span>
                </button>
                {open === m.id && (
                  <div className="border-t border-navy/10 bg-mist/30 px-5 py-5">
                    <p className="text-sm"><a className="text-emerald underline" href={`mailto:${m.email}`}>{m.email}</a>{m.phone && <> · <a className="text-emerald underline" href={`tel:${m.phone.replace(/\s/g, '')}`}>{m.phone}</a></>}</p>
                    <p className="mt-3 whitespace-pre-wrap leading-relaxed">{m.message}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(['READ', 'REPLIED', 'ARCHIVED', 'NEW'] as MStatus[]).filter((s) => s !== m.status).map((s) => <button key={s} className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => setS(m, s)}>Mark {s.toLowerCase()}</button>)}
                    </div>
                  </div>
                )}
              </li>
            ))}
            {list.data?.items.length === 0 && <li className="px-4 py-10 text-center text-ink-soft">No messages found.</li>}
          </ul>
          {list.data && <Pager page={page} total={list.data.total} pageSize={15} onPage={setPage} />}
        </Async>
      </Panel>
    </>
  );
}
