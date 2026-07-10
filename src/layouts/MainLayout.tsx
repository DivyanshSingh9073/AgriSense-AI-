import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '@/components/layout';

/**
 * Layout for public, unauthenticated pages (Home, marketing/landing pages).
 * Renders a persistent Navbar + Footer around the routed page via <Outlet>.
 */
export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a href="#main-content" className="sr-only-focusable">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
