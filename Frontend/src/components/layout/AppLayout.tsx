import { useState, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";

import {
  AppSidebar,
  MobileHeader,
  MobileDrawer,
  DesktopPageHeader,
  usePageTitle,
} from "./AppSidebar";

// Pages that hide the top page header (they have their own rich sticky bars)
const PAGES_WITH_OWN_HEADER = ["/", "/about"];

/**
 * AppLayout — Shared authenticated application shell.
 *
 * Desktop (≥1024px):
 *   [Sidebar | [Page header][Page content]]
 *
 * Mobile (<1024px):
 *   [Mobile header]
 *   [Page content]
 *   Mobile drawer (slide-in on hamburger)
 */
export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen]             = useState(false);

  const location = useLocation();
  const pageTitle = usePageTitle();

  const toggleSidebar = useCallback(() => setSidebarCollapsed((v) => !v), []);
  const openDrawer    = useCallback(() => setDrawerOpen(true),  []);
  const closeDrawer   = useCallback(() => setDrawerOpen(false), []);

  const showPageHeader = !PAGES_WITH_OWN_HEADER.includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-ivory">

      {/* ── Desktop sidebar ── */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Mobile top header */}
        <MobileHeader onMenuOpen={openDrawer} />

        {/* Desktop page context header (restrained, under the sidebar's top) */}
        {showPageHeader && <DesktopPageHeader title={pageTitle} />}

        {/* Page content */}
        <main
          className="flex-1 w-full"
          id="main-content"
          tabIndex={-1}
        >
          <Outlet />
        </main>

      </div>

      {/* ── Mobile navigation drawer ── */}
      <MobileDrawer open={drawerOpen} onClose={closeDrawer} />

    </div>
  );
}
