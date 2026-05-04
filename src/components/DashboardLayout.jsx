import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

// ─── Page transition key ───────────────────────────────────────────────────────
// We key the Outlet wrapper on the current pathname so React unmounts/remounts
// the content area on every route change, triggering the fade-slide-in animation.
// This is intentionally lightweight — no external animation library needed.

const TRANSITION_DURATION_MS = 180;

// ─── Scrollbar polish ─────────────────────────────────────────────────────────
// Injected once as a <style> tag so the custom scrollbar applies only to the
// main scroll container and nowhere else. Tailwind's arbitrary [&::-webkit-*]
// selectors work for simple cases but can't target pseudo-element widths cleanly
// across all browsers, so a scoped style tag is more reliable here.

const SCROLLBAR_STYLES = `
  .noyon-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .noyon-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .noyon-scroll::-webkit-scrollbar-thumb {
    background: #2a2a36;
    border-radius: 9999px;
  }
  .noyon-scroll::-webkit-scrollbar-thumb:hover {
    background: #3a3a4a;
  }
  /* Firefox */
  .noyon-scroll {
    scrollbar-width: thin;
    scrollbar-color: #2a2a36 transparent;
  }

  @keyframes noyonPageIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .noyon-page-enter {
    animation: noyonPageIn ${TRANSITION_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) both;
  }
`;

// ─── Animated content region ──────────────────────────────────────────────────
// Re-mounts (and therefore re-animates) on every pathname change.
// Keeping it as a separate component means React sees a genuine unmount/mount
// boundary rather than a prop change, which is what triggers the CSS animation.

function AnimatedPage({ children }) {
  return (
    <div className="noyon-page-enter h-full">
      {children}
    </div>
  );
}

// ─── DashboardLayout ──────────────────────────────────────────────────────────

export default function DashboardLayout() {
  const location = useLocation();
  const scrollRef = useRef(null);

  // ── Scroll to top on every route change
  // Using a ref instead of window.scrollTo keeps this scoped to the content
  // panel — the sidebar never scrolls with the page.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // ── Inject scrollbar + animation styles once
  useEffect(() => {
    const id = 'noyon-layout-styles';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = SCROLLBAR_STYLES;
      document.head.appendChild(style);
    }
    return () => {
      // Intentionally not removing on unmount — the layout is a root-level
      // component that persists for the app's lifetime. Removing would cause
      // a flash if React strict-mode double-invokes the effect.
    };
  }, []);

  return (
    /*
     * Root shell
     * ─────────────────────────────────────────────────────────────────────────
     * `h-screen` + `overflow-hidden` on the root means the viewport never
     * scrolls as a whole — only the content panel scrolls. This prevents the
     * classic "sidebar scrolls with content" bug and keeps the sidebar fixed
     * without needing `position: fixed` (which would pull it out of flow and
     * cause layout width miscalculation).
     *
     * `isolate` creates a new stacking context so the Sidebar's z-indexed
     * elements (collapse button z-30, mobile drawer z-50) are correctly layered
     * relative to this layout root rather than the document.
     */
    <div
      className={[
        'flex h-screen w-full overflow-hidden',
        'bg-[#0e0e14]',          // Slightly deeper than sidebar bg for depth contrast
        'font-sans antialiased', // Subpixel rendering polish
        'isolate',               // New stacking context
      ].join(' ')}
    >
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      {/*
       * The Sidebar component renders:
       *  • Desktop: `hidden md:flex` aside — participates in flex layout normally
       *  • Mobile:  `fixed` topbar (h-14, z-30) + `fixed` drawer (z-50)
       *
       * No wrapper needed — Sidebar manages its own positioning contract.
       */}
      <Sidebar />

      {/* ── Main column ────────────────────────────────────────────────────── */}
      {/*
       * `min-w-0` is critical. Without it, a flex child's minimum width is
       * its content width, which can cause the main area to overflow the
       * viewport when the content is wide (tables, kanban boards, code blocks).
       * `min-w-0` allows the column to shrink below its content width and
       * lets overflow-hidden / overflow-y-auto take proper effect.
       */}
      <div className="relative flex min-w-0 flex-1 flex-col">

        {/*
         * Mobile top-offset spacer
         * ───────────────────────────────────────────────────────────────────
         * The Sidebar renders a `fixed` topbar on mobile (h-14, z-30).
         * Because fixed elements are out of normal flow, we need a spacer to
         * push content below it — otherwise the first ~56px of content sits
         * behind the topbar.
         *
         * On md+ screens the fixed topbar isn't rendered, so we remove the
         * spacer with `md:hidden`.
         *
         * Using a discrete element rather than padding on the scroll container
         * means `scrollTop = 0` still shows content from the very top of the
         * padded area — no accidental clipping.
         */}
        <div className="h-14 flex-shrink-0 md:hidden" aria-hidden="true" />

        {/* ── Scrollable content panel ──────────────────────────────────────── */}
        {/*
         * `flex-1` + `overflow-y-auto` makes this the only scrolling region.
         * `overflow-x-hidden` prevents horizontal scroll from overflowing
         * children (wide tables, kanban) while still allowing them to use
         * their own internal horizontal scroll if wrapped correctly.
         *
         * We deliberately avoid `overflow-x-auto` here — that would make the
         * entire page horizontally scrollable, which is never the right UX for
         * a SaaS dashboard.
         */}
        <main
          ref={scrollRef}
          id="main-content"
          tabIndex={-1}           // Allows programmatic focus for skip-links
          className={[
            'noyon-scroll',
            'flex-1 overflow-y-auto overflow-x-hidden',
            // Subtle inner top gradient to reinforce depth against the topbar
            'relative',
          ].join(' ')}
          // Accessibility: skip-link target
          aria-label="Ana içerik"
        >
          {/*
           * Subtle radial depth vignette
           * Renders as a fixed-position pseudo-layer behind content.
           * Gives the content area a slight atmospheric depth that separates
           * it from the flat sidebar — the kind of detail that reads as
           * "premium" without being obvious.
           *
           * `pointer-events-none` and `aria-hidden` ensure it is invisible
           * to interaction and screen readers.
           */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 60% 0%, rgba(108,106,246,0.04) 0%, transparent 70%)',
            }}
          />

          {/*
           * Animated page region
           * ─────────────────────────────────────────────────────────────────
           * Keyed on `location.key` (not pathname) so even navigating to the
           * same route (e.g. clicking the active nav item) still triggers the
           * animation — consistent feel regardless of destination.
           *
           * `location.key` is a unique string React Router assigns to every
           * navigation entry, including programmatic pushes and browser back/
           * forward — more precise than pathname alone.
           *
           * z-10 ensures page content stacks above the vignette layer.
           */}
          <div className="relative z-10 h-full">
            <AnimatedPage key={location.key}>
              <Outlet />
            </AnimatedPage>
          </div>
        </main>
      </div>
    </div>
  );
}
