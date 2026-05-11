/**
 * Vite entry point. Replaces the Next.js App Router root.
 *
 * Mount order matches the original `src/app/layout.tsx`:
 *   <BrowserRouter>
 *     <Providers> (Toast + EnquiryModal)
 *       <ClientAppShell>
 *         <Routes /> from src/router.tsx
 *       </ClientAppShell>
 *     </Providers>
 *   </BrowserRouter>
 *
 * Per-page `<title>` / `<meta>` tags are emitted by individual pages — React 19 hoists those
 * elements into `<head>` automatically, so we don't need a Helmet provider.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app/globals.css';
import App from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container `#root` is missing in index.html');
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
