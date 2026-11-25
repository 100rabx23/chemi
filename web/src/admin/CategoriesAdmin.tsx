import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api, useApi, type Category } from '../lib/api';
import { Async, Confirm, Modal, PageTitle, Panel } from './kit';
import { Field } from '../components/ui';
import { useAuth } from './AdminApp';

type Form = { id?: string; name: string; slug: string; tagline: string; description: string; sortOrder: number };

export default function CategoriesAdmin() {
  const { user } = useAuth();
  const list = useApi<{ items: Category[] }>('/admin/categories');
  const [editing, setEditing] = useState<Form | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault(); if (!editing) return; setBusy(true); setErr('');
    const { id, ...body } = editing;
    try { await api(id ? `/admin/categories/${id}` : '/admin/categories', { method: id ? 'PUT' : 'POST', body: { ...body, slug: body.slug || undefined } }); setEditing(null); list.reload(); }
    catch (x) { setErr(x instanceof Error ? x.message : 'Save failed'); } finally { setBusy(false); }
  }
  async function del() {
    if (!deleting) return; setBusy(true); setErr('');
    try { await api(`/admin/categories/${deleting.id}`, { method: 'DELETE' }); setDeleting(null); list.reload(); }
    catch (x) { setErr(x instanceof Error ? x.message : 'Delete failed'); } finally { setBusy(false); }
  }

  return (
    <>
      <PageTitle title="Categories" action={<button className="btn-primary" onClick={() => { setErr(''); setEditing({ name: '', slug: '', tagline: '', description: '', sortOrder: (list.data?.items.length ?? 0) }); }}><Plus className="h-4 w-4" aria-hidden="true" /> New category</button>} />
      <Panel>
        <Async loading={list.loading} error={list.error} onRetry={list.reload}>
          <table className="w-full text-left text-sm">
            <thead className="label border-b border-navy/10"><tr><th className="px-4 py-3 font-normal">Order</th><th className="px-4 py-3 font-normal">Name</th><th className="px-4 py-3 font-normal">Products</th><th className="px-4 py-3 text-right font-normal">Actions</th></tr></thead>
            <tbody className="divide-y divide-navy/10">
              {list.data?.items.map((c) => (
                <tr key={c.id} className="hover:bg-mist/40">
                  <td className="px-4 py-3 tabular-nums">{c.sortOrder}</td>
                  <td className="px-4 py-3"><span className="font-semibold text-navy">{c.name}</span><span className="block text-xs text-ink-soft">/{c.slug}</span></td>
                  <td className="px-4 py-3 tabular-nums">{c.productCount}</td>
                  <td className="px-4 py-3 text-right">
                    <button aria-label={`Edit ${c.name}`} className="p-2 hover:text-emerald" onClick={() => { setErr(''); setEditing({ id: c.id, name: c.name, slug: c.slug, tagline: c.tagline ?? '', description: c.description ?? '', sortOrder: c.sortOrder }); }}><Pencil className="h-4 w-4" /></button>
                    {user?.role === 'ADMIN' && <button aria-label={`Delete ${c.name}`} className="p-2 hover:text-red-800" onClick={() => { setErr(''); setDeleting(c); }}><Trash2 className="h-4 w-4" /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Async>
      </Panel>
      {editing && (
        <Modal title={editing.id ? 'Edit category' : 'New category'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4">
            <Field id="cf-name" label="Name"><input id="cf-name" required className="field" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field id="cf-slug" label="URL slug" hint="Leave blank to generate from the name"><input id="cf-slug" className="field" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
            <Field id="cf-tag" label="Tagline"><input id="cf-tag" className="field" value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} /></Field>
            <Field id="cf-order" label="Sort order"><input id="cf-order" type="number" min={0} className="field" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} /></Field>
            {err && <p role="alert" className="border border-red-800/30 bg-red-50 p-3 text-sm text-red-900">{err}</p>}
            <div className="flex justify-end gap-3"><button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button></div>
          </form>
        </Modal>
      )}
      {deleting && <Confirm title="Delete category?" busy={busy} onCancel={() => setDeleting(null)} onConfirm={del} message={<>Delete <b>{deleting.name}</b>? A category that still has products cannot be deleted.{err && <span className="mt-2 block text-red-800">{err}</span>}</>} />}
    </>
  );
}
