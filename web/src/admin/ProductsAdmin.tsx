import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { api, ApiError, useApi, type Category, type Paged, type Product } from '../lib/api';
import { Async, Badge, Confirm, Modal, PageTitle, Pager, Panel, useDebounced } from './kit';
import { Field } from '../components/ui';
import { useAuth } from './AdminApp';

type Form = { id?: string; name: string; description: string; categoryId: string; imageUrl: string; featured: boolean; published: boolean; sortOrder: number; specifications: { label: string; value: string }[] };
const blank = (categoryId = ''): Form => ({ name: '', description: '', categoryId, imageUrl: '', featured: false, published: true, sortOrder: 0, specifications: [] });

export default function ProductsAdmin() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounced(search);
  const qs = new URLSearchParams({ page: String(page), pageSize: '15' });
  if (q) qs.set('search', q);
  if (category) qs.set('category', category);
  const list = useApi<Paged<Product>>(`/admin/products?${qs}`);
  const cats = useApi<{ items: Category[] }>('/admin/categories');
  const [editing, setEditing] = useState<Form | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState('');

  async function doDelete() {
    if (!deleting) return;
    setDelBusy(true); setDelErr('');
    try { await api(`/admin/products/${deleting.id}`, { method: 'DELETE' }); setDeleting(null); list.reload(); }
    catch (e) { setDelErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setDelBusy(false); }
  }

  return (
    <>
      <PageTitle title="Products" sub="Create, edit and publish catalogue entries." action={<button className="btn-primary" onClick={() => setEditing(blank(cats.data?.items[0]?.id))}><Plus className="h-4 w-4" aria-hidden="true" /> New product</button>} />
      <Panel>
        <div className="flex flex-wrap gap-3 border-b border-navy/10 p-4">
          <div className="min-w-56 flex-1"><label className="sr-only" htmlFor="ps">Search products</label><input id="ps" type="search" placeholder="Search by name…" className="field" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
          <div><label className="sr-only" htmlFor="pc">Filter by category</label><select id="pc" className="field" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}><option value="">All categories</option>{cats.data?.items.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </div>
        <Async loading={list.loading} error={list.error} onRetry={list.reload}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="label border-b border-navy/10"><tr><th className="px-4 py-3 font-normal">Product</th><th className="px-4 py-3 font-normal">Category</th><th className="px-4 py-3 font-normal">Status</th><th className="px-4 py-3 text-right font-normal">Actions</th></tr></thead>
              <tbody className="divide-y divide-navy/10">
                {list.data?.items.map((p) => (
                  <tr key={p.id} className="hover:bg-mist/40">
                    <td className="px-4 py-3"><span className="font-semibold text-navy">{p.name}</span> {p.featured && <Badge tone="blue">Featured</Badge>}<span className="block text-xs text-ink-soft">/{p.slug}</span></td>
                    <td className="px-4 py-3">{p.category.name}</td>
                    <td className="px-4 py-3">{p.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}</td>
                    <td className="px-4 py-3 text-right">
                      <button aria-label={`Edit ${p.name}`} className="p-2 hover:text-emerald" onClick={() => setEditing({ id: p.id, name: p.name, description: p.description, categoryId: p.categoryId, imageUrl: p.imageUrl ?? '', featured: p.featured, published: p.published, sortOrder: p.sortOrder, specifications: p.specifications })}><Pencil className="h-4 w-4" /></button>
                      {user?.role === 'ADMIN' && <button aria-label={`Delete ${p.name}`} className="p-2 hover:text-red-800" onClick={() => { setDelErr(''); setDeleting(p); }}><Trash2 className="h-4 w-4" /></button>}
                    </td>
                  </tr>
                ))}
                {list.data?.items.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-ink-soft">No products found.</td></tr>}
              </tbody>
            </table>
          </div>
          {list.data && <Pager page={page} total={list.data.total} pageSize={15} onPage={setPage} />}
        </Async>
      </Panel>
      {editing && cats.data && <ProductForm initial={editing} cats={cats.data.items} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); list.reload(); }} />}
      {deleting && <Confirm title="Delete product?" busy={delBusy} onCancel={() => setDeleting(null)} onConfirm={doDelete} message={<>This permanently deletes <b>{deleting.name}</b>. Existing inquiries keep the product name. To hide it without deleting, unpublish it instead.{delErr && <span className="mt-2 block text-red-800">{delErr}</span>}</>} />}
    </>
  );
}

function ProductForm({ initial, cats, onClose, onSaved }: { initial: Form; cats: Category[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Form>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [upBusy, setUpBusy] = useState(false);

  async function upload(file: File) {
    setUpBusy(true); setErr('');
    try { const fd = new FormData(); fd.append('file', file); const r = await api<{ url: string }>('/admin/uploads', { method: 'POST', form: fd }); setF((s) => ({ ...s, imageUrl: r.url })); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Upload failed'); }
    finally { setUpBusy(false); }
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr(''); setFieldErr({});
    const body = { name: f.name, description: f.description, categoryId: f.categoryId, imageUrl: f.imageUrl || null, featured: f.featured, published: f.published, sortOrder: f.sortOrder, specifications: f.specifications.filter((s) => s.label.trim() && s.value.trim()) };
    try {
      await api(f.id ? `/admin/products/${f.id}` : '/admin/products', { method: f.id ? 'PUT' : 'POST', body });
      onSaved();
    } catch (e) {
      if (e instanceof ApiError && e.details) setFieldErr(Object.fromEntries(Object.entries(e.details).map(([k, v]) => [k, v[0]])));
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally { setBusy(false); }
  }

  return (
    <Modal wide title={f.id ? 'Edit product' : 'New product'} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-5" noValidate>
        <Field id="pf-name" label="Name" error={fieldErr.name}><input id="pf-name" required className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field id="pf-cat" label="Category" error={fieldErr.categoryId}><select id="pf-cat" required className="field" value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value })}><option value="">Select…</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field id="pf-desc" label="Description (verified information only)" error={fieldErr.description}><textarea id="pf-desc" required rows={4} className="field" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-navy">Image</p>
          <div className="flex flex-wrap items-center gap-4">
            {f.imageUrl ? <img src={f.imageUrl} alt="" className="h-20 w-28 border border-navy/15 object-cover" /> : <div className="grid h-20 w-28 place-items-center border border-dashed border-navy/30 text-xs text-ink-soft">No image</div>}
            <label className="btn-ghost cursor-pointer"><Upload className="h-4 w-4" aria-hidden="true" />{upBusy ? 'Uploading…' : 'Upload'}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>
            {f.imageUrl && <button type="button" className="text-sm text-ink-soft underline" onClick={() => setF({ ...f, imageUrl: '' })}>Remove</button>}
          </div>
          <p className="mt-1 text-xs text-ink-soft">JPEG, PNG or WebP, up to 4 MB.</p>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-navy">Specifications (verified values only)</legend>
          {f.specifications.map((s, i) => (
            <div key={i} className="mb-2 grid grid-cols-[1fr_1fr_auto] gap-2">
              <input aria-label={`Specification ${i + 1} label`} placeholder="Label" className="field" value={s.label} onChange={(e) => setF({ ...f, specifications: f.specifications.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} />
              <input aria-label={`Specification ${i + 1} value`} placeholder="Value" className="field" value={s.value} onChange={(e) => setF({ ...f, specifications: f.specifications.map((x, j) => j === i ? { ...x, value: e.target.value } : x) })} />
              <button type="button" aria-label={`Remove specification ${i + 1}`} className="p-2 hover:text-red-800" onClick={() => setF({ ...f, specifications: f.specifications.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" className="text-sm font-semibold text-emerald hover:underline" onClick={() => setF({ ...f, specifications: [...f.specifications, { label: '', value: '' }] })}>+ Add specification</button>
        </fieldset>

        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} className="h-4 w-4 accent-emerald" /> Published</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} className="h-4 w-4 accent-emerald" /> Featured on home page</label>
          <label className="flex items-center gap-2 text-sm">Sort order <input type="number" min={0} className="field !w-24" value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: Number(e.target.value) })} /></label>
        </div>
        {err && <p role="alert" className="border border-red-800/30 bg-red-50 p-3 text-sm text-red-900">{err}</p>}
        <div className="flex justify-end gap-3"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button></div>
      </form>
    </Modal>
  );
}
