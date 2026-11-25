import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Boxes, FolderTree, Inbox, LayoutDashboard, LogOut, Mail, Settings as SettingsIcon, UserCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Logo, Spinner } from '../components/ui';
import { Clock } from './kit';
import { useSEO } from '../lib/seo';
import Login from './Login';
import Dashboard from './Dashboard';
import ProductsAdmin from './ProductsAdmin';
import CategoriesAdmin from './CategoriesAdmin';
import InquiriesAdmin from './InquiriesAdmin';
import MessagesAdmin from './MessagesAdmin';
import SettingsAdmin from './SettingsAdmin';
import Profile from './Profile';

export interface AdminUser { id: string; email: string; name: string; role: 'ADMIN' | 'EDITOR' }
interface Auth { user: AdminUser | null; setUser: (u: AdminUser | null) => void }
const AuthCtx = createContext<Auth>({ user: null, setUser: () => undefined });
export const useAuth = () => useContext(AuthCtx);

const nav = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/inquiries', label: 'Inquiries', icon: Inbox },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
  { to: '/admin/profile', label: 'Profile', icon: UserCircle },
];

function Shell() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    setUser(null); navigate('/admin/login');
  }, [navigate, setUser]);

  if (!user) return <Navigate to="/admin/login" replace />;
  return (
    <div className="admin min-h-screen bg-paper lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="on-dark bg-graphite p-4 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex items-center justify-between lg:block lg:px-2 lg:pt-2"><Link to="/admin" aria-label="Dashboard home"><Logo light /></Link><p className="label mt-3 hidden lg:block">Admin console</p></div>
        <nav aria-label="Admin" className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] lg:mt-8 lg:block lg:space-y-1.5 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-bone font-semibold text-navy' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden rounded-2xl bg-white/5 p-4 text-sm lg:block">
          <p className="truncate font-semibold">{user.name}</p><p className="label">{user.role}</p>
          <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-white/25 py-2 text-white/85 transition-colors hover:bg-white hover:text-navy"><LogOut className="h-4 w-4" aria-hidden="true" /> Log out</button>
        </div>
      </aside>
      <main id="main" className="min-w-0 p-5 sm:p-8 lg:p-10">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Clock />
          <div className="flex items-center gap-2">
            <Link to="/" className="pill !py-2 hover:!bg-white">View website <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            <button onClick={logout} className="pill !py-2 hover:!bg-white lg:hidden">Log out</button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default function AdminApp() {
  useSEO({ title: 'Admin', description: 'Chemilinx administration', noindex: true });
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    api<{ user: AdminUser }>('/auth/me').then((r) => setUser(r.user)).catch(() => setUser(null)).finally(() => setReady(true));
  }, []);
  if (!ready) return <Spinner />;
  const Provider = ({ children }: { children: ReactNode }) => <AuthCtx.Provider value={{ user, setUser }}>{children}</AuthCtx.Provider>;
  return (
    <Provider>
      <Routes>
        <Route path="login" element={user ? <Navigate to="/admin" replace /> : <Login />} />
        <Route element={<Shell />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="categories" element={<CategoriesAdmin />} />
          <Route path="inquiries" element={<InquiriesAdmin />} />
          <Route path="messages" element={<MessagesAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </Provider>
  );
}
