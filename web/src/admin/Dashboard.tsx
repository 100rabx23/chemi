import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useApi } from '../lib/api';
import { RollingNumber } from '../components/motion';
import { Async, Badge, fmtDate, PageTitle, Panel } from './kit';
import { statusTone, statusLabel, type InquiryRow } from './InquiriesAdmin';
import { useAuth } from './AdminApp';

interface Stats { products: number; categories: number; newInquiries: number; pendingInquiries: number; newMessages: number; recentInquiries: InquiryRow[] }

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi<Stats>('/admin/stats');
  const tiles = data ? [
    ['Total products', data.products, '/admin/products', false],
    ['Total categories', data.categories, '/admin/categories', false],
    ['New inquiries', data.newInquiries, '/admin/inquiries?status=NEW', data.newInquiries > 0],
    ['Pending inquiries', data.pendingInquiries, '/admin/inquiries', false],
    ['New messages', data.newMessages, '/admin/messages', data.newMessages > 0],
  ] as const : [];
  return (
    <>
      <PageTitle title={`Hello, ${user?.name.split(' ')[0] ?? 'there'}.`} sub="Live data from the database." />
      <Async loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {tiles.map(([l, n, to, hot]) => (
                <Link key={l} to={to} className={`group relative rounded-2xl border p-5 transition-colors ${hot ? 'border-transparent bg-graphite text-white hover:bg-emerald' : 'border-navy/10 bg-bone hover:border-navy/40'}`}>
                  <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 opacity-40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
                  <p className={`label ${hot ? '!text-white/65' : ''}`}>{l}</p>
                  <p className="mt-5 font-display text-6xl font-bold leading-none tracking-tighter"><RollingNumber value={n} /></p>
                </Link>
              ))}
            </div>
            <Panel className="mt-8">
              <div className="flex items-center justify-between border-b border-navy/10 px-6 py-5"><h2 className="display-sm !text-[1.5rem]">Recent customer inquiries</h2><Link to="/admin/inquiries" className="pill !py-1.5 text-[13px] hover:!bg-white">View all <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></div>
              {data.recentInquiries.length === 0 ? <p className="p-8 text-ink-soft">No inquiries yet. New quotation requests will appear here.</p> : (
                <ul className="divide-y divide-navy/10">
                  {data.recentInquiries.map((i) => (
                    <li key={i.id}><Link to={`/admin/inquiries?open=${i.id}`} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-mist/60">
                      <span><span className="font-semibold text-navy">{i.companyName}</span> <span className="text-ink-soft">· {i.customerName}</span><span className="block text-sm text-ink-soft">{i.items.map((x) => x.productName).join(', ')}</span></span>
                      <span className="flex items-center gap-3"><Badge tone={statusTone[i.status]}>{statusLabel[i.status]}</Badge><span className="label">{fmtDate(i.createdAt)}</span></span>
                    </Link></li>
                  ))}
                </ul>
              )}
            </Panel>
          </>
        )}
      </Async>
    </>
  );
}
