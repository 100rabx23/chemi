import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, useApi, type Paged } from '../lib/api';
import { Async, Badge, fmtDate, Modal, PageTitle, Pager, Panel, useDebounced } from './kit';

export type Status = 'NEW' | 'IN_PROGRESS' | 'QUOTED' | 'CLOSED' | 'SPAM';
export interface InquiryRow {
  id: string; reference: string; customerName: string; companyName: string; email: string; phone: string; message: string | null;
  status: Status; internalNotes: string | null; emailStatus: string; createdAt: string;
  items: { id?: string; productName: string; quantity: string; unit: string }[];
}
export const statusLabel: Record<Status, string> = { NEW: 'New', IN_PROGRESS: 'In progress', QUOTED: 'Quoted', CLOSED: 'Closed', SPAM: 'Spam' };
export const statusTone: Record<Status, 'blue' | 'amber' | 'green' | 'grey' | 'red'> = { NEW: 'blue', IN_PROGRESS: 'amber', QUOTED: 'green', CLOSED: 'grey', SPAM: 'red' };

export default function InquiriesAdmin() {
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounced(search);
  const qs = new URLSearchParams({ page: String(page), pageSize: '15' });
  if (status) qs.set('status', status);
  if (q) qs.set('search', q);
  const list = useApi<Paged<InquiryRow>>(`/admin/inquiries?${qs}`);
  const openId = params.get('open');
  const detail = useApi<InquiryRow>(openId ? `/admin/inquiries/${openId}` : null);

  const close = () => { const n = new URLSearchParams(params); n.delete('open'); setParams(n, { replace: true }); };

  return (
    <>
      <PageTitle title="Inquiries" sub="Quotation requests submitted through the website." />
      <Panel>
        <div className="flex flex-wrap gap-3 border-b border-navy/10 p-4">
          <div className="min-w-56 flex-1"><label className="sr-only" htmlFor="is">Search inquiries</label><input id="is" type="search" placeholder="Search name, company, email, reference…" className="field" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
          <div><label className="sr-only" htmlFor="ist">Filter by status</label><select id="ist" className="field" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{(Object.keys(statusLabel) as Status[]).map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}</select></div>
        </div>
        <Async loading={list.loading} error={list.error} onRetry={list.reload}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="label border-b border-navy/10"><tr><th className="px-4 py-3 font-normal">Reference</th><th className="px-4 py-3 font-normal">Customer</th><th className="px-4 py-3 font-normal">Products</th><th className="px-4 py-3 font-normal">Status</th><th className="px-4 py-3 font-normal">Received</th></tr></thead>
              <tbody className="divide-y divide-navy/10">
                {list.data?.items.map((i) => (
                  <tr key={i.id} className="cursor-pointer hover:bg-mist/40">
                    <td className="px-4 py-3 font-mono text-xs"><button className="underline decoration-navy/30 underline-offset-4 hover:text-emerald" onClick={() => setParams({ ...(status ? { status } : {}), open: i.id }, { replace: true })}>{i.reference}</button></td>
                    <td className="px-4 py-3"><span className="font-semibold text-navy">{i.companyName}</span><span className="block text-xs text-ink-soft">{i.customerName}</span></td>
                    <td className="max-w-xs truncate px-4 py-3">{i.items.map((x) => x.productName).join(', ')}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone[i.status]}>{statusLabel[i.status]}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-soft">{fmtDate(i.createdAt)}</td>
                  </tr>
                ))}
                {list.data?.items.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-soft">No inquiries found.</td></tr>}
              </tbody>
            </table>
          </div>
          {list.data && <Pager page={page} total={list.data.total} pageSize={15} onPage={setPage} />}
        </Async>
      </Panel>
      {openId && (
        <Modal wide title="Inquiry" onClose={close}>
          <Async loading={detail.loading} error={detail.error} onRetry={detail.reload}>
            {detail.data && <Detail key={detail.data.id} inquiry={detail.data} onSaved={() => { list.reload(); }} />}
          </Async>
        </Modal>
      )}
    </>
  );
}

function Detail({ inquiry, onSaved }: { inquiry: InquiryRow; onSaved: () => void }) {
  const [status, setStatus] = useState<Status>(inquiry.status);
  const [notes, setNotes] = useState(inquiry.internalNotes ?? '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { setStatus(inquiry.status); setNotes(inquiry.internalNotes ?? ''); }, [inquiry]);

  async function save() {
    setBusy(true); setMsg(null);
    try { await api(`/admin/inquiries/${inquiry.id}`, { method: 'PATCH', body: { status, internalNotes: notes } }); setMsg({ ok: true, text: 'Saved.' }); onSaved(); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Save failed' }); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="font-mono text-sm text-ink-soft">{inquiry.reference}</p><p className="font-display text-2xl text-navy">{inquiry.companyName}</p><p className="text-sm text-ink-soft">Received {fmtDate(inquiry.createdAt)} · Email notification: {inquiry.emailStatus.toLowerCase()}</p></div>
        <Badge tone={statusTone[inquiry.status]}>{statusLabel[inquiry.status]}</Badge>
      </div>
      <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
        <div><dt className="label">Contact</dt><dd className="mt-1">{inquiry.customerName}</dd></div>
        <div><dt className="label">Email</dt><dd className="mt-1"><a className="text-emerald underline" href={`mailto:${inquiry.email}`}>{inquiry.email}</a></dd></div>
        <div><dt className="label">Phone</dt><dd className="mt-1"><a className="text-emerald underline" href={`tel:${inquiry.phone.replace(/\s/g, '')}`}>{inquiry.phone}</a></dd></div>
      </dl>
      <table className="w-full border border-navy/15 text-left text-sm">
        <thead className="label bg-mist/60"><tr><th className="px-3 py-2 font-normal">Product</th><th className="px-3 py-2 text-right font-normal">Quantity</th><th className="px-3 py-2 font-normal">Unit</th></tr></thead>
        <tbody className="divide-y divide-navy/10">{inquiry.items.map((x, i) => <tr key={i}><td className="px-3 py-2">{x.productName}</td><td className="px-3 py-2 text-right tabular-nums">{Number(x.quantity)}</td><td className="px-3 py-2">{x.unit}</td></tr>)}</tbody>
      </table>
      {inquiry.message && <div><p className="label">Customer requirements</p><p className="mt-1 whitespace-pre-wrap border-l-2 border-emerald pl-4 text-sm leading-relaxed">{inquiry.message}</p></div>}
      <div className="grid gap-4 border-t border-navy/15 pt-5">
        <div><label htmlFor="st" className="mb-1.5 block text-sm font-semibold text-navy">Status</label><select id="st" className="field max-w-xs" value={status} onChange={(e) => setStatus(e.target.value as Status)}>{(Object.keys(statusLabel) as Status[]).map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}</select></div>
        <div><label htmlFor="notes" className="mb-1.5 block text-sm font-semibold text-navy">Internal notes <span className="font-normal text-ink-soft">(never shown to the customer)</span></label><textarea id="notes" rows={4} className="field" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        <div className="flex items-center gap-4"><button className="btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>{msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-dark' : 'text-red-800'}`}>{msg.text}</p>}</div>
      </div>
    </div>
  );
}
