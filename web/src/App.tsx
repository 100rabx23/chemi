import { lazy, Suspense, type ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Spinner } from './components/ui';
import { Preloader } from './components/Preloader';
import Home from './pages/Home';

// Inner routes are code-split so the first paint only ships the home page.
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Industries = lazy(() => import('./pages/Industries'));
const Why = lazy(() => import('./pages/Why'));
const Contact = lazy(() => import('./pages/Contact'));
const Quote = lazy(() => import('./pages/Quote'));
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./admin/AdminApp'));

const wait = (el: ReactElement) => <Suspense fallback={<div className="min-h-[70vh] bg-navy pt-48"><Spinner /></div>}>{el}</Suspense>;

export default function App() {
  return (
    <>
      <Preloader />
      <Routes>
        <Route path="/admin/*" element={<Suspense fallback={<Spinner />}><Admin /></Suspense>} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={wait(<About />)} />
          <Route path="products" element={wait(<Products />)} />
          <Route path="products/:slug" element={wait(<ProductDetail />)} />
          <Route path="industries" element={wait(<Industries />)} />
          <Route path="why-chemilinx" element={wait(<Why />)} />
          <Route path="contact" element={wait(<Contact />)} />
          <Route path="request-quote" element={wait(<Quote />)} />
          <Route path="privacy-policy" element={wait(<Privacy />)} />
          <Route path="*" element={wait(<NotFound />)} />
        </Route>
      </Routes>
    </>
  );
}
