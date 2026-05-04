import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// ─── SVG Icon Components ──────────────────────────────────────────────────────
// Inline SVGs eliminate the FontAwesome network request and give pixel-perfect
// control over stroke width, size, and colour inheritance.

const IconHome = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const IconNote = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const IconLibrary = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.396 0 2.7.39 3.8 1.063A7.967 7.967 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
  </svg>
);

const IconTask = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const IconSubscription = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
  </svg>
);

const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);


const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const IconChevronLeft = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
  </svg>
);

const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

// ─── Route Config ─────────────────────────────────────────────────────────────
// Centralised here so you only edit one place when routes change.
// The `badge` field renders a small count pill (pass null to omit).

const NAV_SECTIONS = [
  {
    label: 'Genel',
    items: [
      { name: 'Ana Sayfa',    icon: <IconHome />,         path: '/dashboard',            badge: null },
      { name: 'Notlar',       icon: <IconNote />,         path: '/dashboard/notes',      badge: 12   },
      { name: 'Görev Takibi', icon: <IconTask />,         path: '/dashboard/gorevler',   badge: null },
      { name: 'Takvim',       icon: <IconCalendar />,     path: '/dashboard/takvim',     badge: null },
    ],
  },
  {
    label: 'İçerik',
    items: [
      { name: 'Kütüphane',    icon: <IconLibrary />,      path: '/dashboard/kutuphane',  badge: null },
      { name: 'Abonelikler',  icon: <IconSubscription />, path: '/dashboard/abonelikler',badge: null },
    ],
  },
  {
    label: 'Diğer',
    items: [
      { name: 'Çöp Kutusu',   icon: <IconTrash />,        path: '/dashboard/trash',      badge: null },
      { name: 'Ayarlar',      icon: <IconSettings />,     path: '/dashboard/settings',   badge: null },
    ],
  },
];

// ─── Tooltip ─────────────────────────────────────────────────────────────────
// A tiny floating label that appears to the right of the collapsed sidebar.
// Rendered into a portal-like absolute position — no DOM portal needed since
// the sidebar is position:relative and z-indexed above page content.

function Tooltip({ label, visible }) {
  return (
    <span
      role="tooltip"
      className={[
        'pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2',
        'whitespace-nowrap rounded-md bg-[#2a2a2e] border border-[#3a3a40]',
        'px-2.5 py-1.5 text-xs font-medium text-[#e0e0e6] shadow-lg',
        'transition-all duration-150',
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 pointer-events-none',
      ].join(' ')}
    >
      {label}
      {/* Left arrow */}
      <span
        aria-hidden="true"
        className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#3a3a40]"
        style={{ marginRight: -1 }}
      />
    </span>
  );
}

// ─── NavItem ─────────────────────────────────────────────────────────────────
// A single navigation link with active indicator, tooltip, and badge.
// Wrapped in a div so the tooltip absolutely positions relative to the item.

function NavItem({ item, isCollapsed, onClick }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  // Active if path matches exactly, OR the route starts with the item path
  // (but guard the root /dashboard to avoid it matching everything).
  const isActive =
    location.pathname === item.path ||
    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={item.path}
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        aria-label={isCollapsed ? item.name : undefined}
        className={[
          // Layout
          'group relative flex items-center gap-2.5 rounded-lg',
          // Collapsed: icon-only square; expanded: full row
          isCollapsed ? 'justify-center w-9 h-9 mx-auto' : 'px-2.5 py-2',
          // Transitions
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c6af6]/60',
          // Active vs idle colours
          isActive
            ? 'bg-[#252530] text-white'
            : 'text-[#9090a0] hover:bg-[#1e1e26] hover:text-[#d0d0da]',
        ].join(' ')}
      >
        {/* Active pill indicator — sits on the left edge */}
        <span
          aria-hidden="true"
          className={[
            'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-[#6c6af6]',
            'transition-all duration-200',
            isActive ? 'h-[60%] opacity-100' : 'h-0 opacity-0',
          ].join(' ')}
        />

        {/* Icon — always visible */}
        <span
          className={[
            'flex-shrink-0 transition-transform duration-150',
            'group-hover:scale-110',
            isActive ? 'text-[#9d9cf8]' : '',
          ].join(' ')}
        >
          {item.icon}
        </span>

        {/* Label — slides + fades out when collapsed */}
        <span
          className={[
            'flex-1 text-[13px] font-[450] leading-none tracking-[-0.01em] whitespace-nowrap',
            'transition-all duration-200 overflow-hidden',
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
          ].join(' ')}
        >
          {item.name}
        </span>

        {/* Badge */}
        {!isCollapsed && item.badge != null && (
          <span className="ml-auto flex-shrink-0 rounded-full bg-[#6c6af6]/20 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-[#a09ff5]">
            {item.badge}
          </span>
        )}
      </Link>

      {/* Tooltip — only when sidebar is collapsed */}
      {isCollapsed && <Tooltip label={item.name} visible={hovered} />}
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ label, isCollapsed }) {
  return (
    <div
      className={[
        'overflow-hidden transition-all duration-200',
        isCollapsed ? 'h-0 opacity-0 mb-0' : 'h-5 opacity-100 mb-1',
      ].join(' ')}
    >
      <span className="block px-2 text-[10px] font-semibold uppercase tracking-widest text-[#505060] select-none">
        {label}
      </span>
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function Sidebar() {
  const navigate = useNavigate();

  // Desktop collapsed state persisted to localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true'; }
    catch { return false; }
  });

  // Mobile open/closed state (sidebar always starts hidden on mobile)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Whether the collapse-toggle button itself is hovered (for micro-animation)
  const [toggleHovered, setToggleHovered] = useState(false);

  const sidebarRef = useRef(null);

  // ── Persist desktop collapse preference
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebar-collapsed', String(next)); } catch {}
      return next;
    });
  }, []);

  // ── Keyboard: Ctrl+B toggles sidebar (Notion/Linear convention)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        // On mobile, toggle mobile drawer; on desktop, toggle collapse
        if (window.innerWidth < 768) setIsMobileOpen(prev => !prev);
        else toggleCollapsed();
      }
      // Escape closes mobile drawer
      if (e.key === 'Escape' && isMobileOpen) setIsMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileOpen, toggleCollapsed]);

  // ── Close mobile sidebar when route changes
  const handleNavClick = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // ── Close mobile sidebar when clicking the backdrop
  const handleBackdropClick = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // ── Logout
  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate('/login');
  }, [navigate]);

  // ── Sidebar width tokens (used inline so Tailwind's JIT can't purge dynamic values)
  const EXPANDED_W = '220px';
  const COLLAPSED_W = '56px';

  const sidebarStyle = {
    width: isCollapsed ? COLLAPSED_W : EXPANDED_W,
    minWidth: isCollapsed ? COLLAPSED_W : EXPANDED_W,
  };

  // ─── Sidebar inner content (shared between desktop and mobile drawer)
  const SidebarContent = ({ mobileMode = false }) => (
    <div className="flex h-full flex-col">

      {/* ── Logo row */}
      <div
        className={[
          'flex h-14 flex-shrink-0 items-center border-b border-[#1e1e26]',
          isCollapsed && !mobileMode ? 'justify-center px-0' : 'justify-between px-3',
        ].join(' ')}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Logo mark */}
          <div
            className={[
              'flex-shrink-0 flex items-center justify-center rounded-lg',
              'bg-gradient-to-br from-[#6c6af6] to-[#4e4bc7]',
              'text-white font-bold text-[13px] tracking-tight select-none shadow-md',
              'transition-all duration-200',
              isCollapsed && !mobileMode ? 'w-8 h-8' : 'w-7 h-7',
            ].join(' ')}
            aria-hidden="true"
          >
            N
          </div>

          {/* Wordmark — hidden when collapsed (desktop) */}
          <span
            className={[
              'font-semibold text-[14px] tracking-[-0.02em] text-white whitespace-nowrap overflow-hidden',
              'transition-all duration-200',
              isCollapsed && !mobileMode ? 'w-0 opacity-0' : 'w-auto opacity-100',
            ].join(' ')}
          >
            Noyon
          </span>
        </div>

        {/* Mobile close button */}
        {mobileMode && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="flex-shrink-0 rounded-md p-1 text-[#6060708] hover:bg-[#1e1e26] hover:text-[#d0d0da] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c6af6]/60"
            aria-label="Menüyü kapat"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Navigation */}
      <nav
        className={[
          'flex-1 overflow-y-auto overflow-x-hidden py-3',
          isCollapsed && !mobileMode ? 'px-1.5' : 'px-2',
          // Custom minimal scrollbar
          '[&::-webkit-scrollbar]:w-[3px]',
          '[&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-thumb]:bg-[#2e2e3a]',
          '[&::-webkit-scrollbar-thumb:hover]:bg-[#3e3e4a]',
        ].join(' ')}
        aria-label="Ana navigasyon"
      >
        {NAV_SECTIONS.map((section, si) => (
          <div
            key={section.label}
            className={si > 0 ? 'mt-4' : ''}
          >
            <SectionLabel label={section.label} isCollapsed={isCollapsed && !mobileMode} />

            <div className="flex flex-col gap-0.5">
              {section.items.map(item => (
                <NavItem
                  key={item.path}
                  item={item}
                  isCollapsed={isCollapsed && !mobileMode}
                  onClick={handleNavClick}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer: user + logout */}
      <div className="flex-shrink-0 border-t border-[#1e1e26] p-2">

        {/* User row */}
        <div
          className={[
            'mb-1 flex items-center gap-2.5 rounded-lg px-2 py-2',
            'cursor-default select-none',
            'transition-colors duration-150',
            isCollapsed && !mobileMode ? 'justify-center' : '',
          ].join(' ')}
        >
          {/* Avatar */}
          <div
            className="relative flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-[#6c6af6] to-[#4e4bc7] flex items-center justify-center text-[11px] font-bold text-white shadow-sm ring-1 ring-white/10"
            aria-hidden="true"
          >
            E
            {/* Online dot */}
            <span className="absolute -bottom-px -right-px h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#13131a]" />
          </div>

          {/* Name + email */}
          <div
            className={[
              'min-w-0 flex-1 transition-all duration-200 overflow-hidden',
              isCollapsed && !mobileMode ? 'w-0 opacity-0' : 'w-auto opacity-100',
            ].join(' ')}
          >
            <p className="truncate text-[12.5px] font-[500] leading-none text-[#d8d8e0]">
              User
            </p>
            <p className="mt-0.5 truncate text-[11px] leading-none text-[#55556a]">
              user@noyon.app
            </p>
          </div>
        </div>

        {/* Logout button */}
        <div className="relative group/logout">
          <button
            onClick={handleLogout}
            aria-label="Çıkış Yap"
            className={[
              'flex w-full items-center gap-2.5 rounded-lg',
              isCollapsed && !mobileMode ? 'justify-center w-9 h-9 mx-auto' : 'px-2.5 py-2',
              'text-[#60606e] transition-all duration-150',
              'hover:bg-[#2a1520] hover:text-[#f87171]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50',
              // Subtle icon shift on hover via group
              'group',
            ].join(' ')}
          >
            <span className="flex-shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5">
              <IconLogout />
            </span>
            <span
              className={[
                'text-[13px] font-[450] whitespace-nowrap overflow-hidden',
                'transition-all duration-200',
                isCollapsed && !mobileMode ? 'w-0 opacity-0' : 'w-auto opacity-100',
              ].join(' ')}
            >
              Çıkış Yap
            </span>
          </button>

          {/* Tooltip for collapsed logout */}
          {isCollapsed && !mobileMode && (
            <Tooltip
              label="Çıkış Yap"
              visible={toggleHovered /* reused state — see onMouseEnter below */}
            />
          )}
        </div>

        {/* Keyboard shortcut hint */}
        {!isCollapsed && (
          <p className="mt-2 px-2 text-[10px] text-[#35354a] select-none">
            Ctrl+B ile daralt
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR
          Hidden on mobile (md:flex).
          Uses CSS width transition — GPU-composited, no layout thrashing.
      ════════════════════════════════════════════════════════════════════ */}
      <aside
        ref={sidebarRef}
        style={sidebarStyle}
        className={[
          'hidden md:flex flex-col relative flex-shrink-0',
          'bg-[#13131a] border-r border-[#1e1e26]',
          'h-screen overflow-visible z-20',
          // Width transition on transform-friendly props only
          'transition-[width,min-width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
        ].join(' ')}
        aria-label="Kenar çubuğu"
      >
        <SidebarContent />

        {/* ── Collapse / Expand toggle button ── */}
        {/* Sits on the border edge, animates direction icon */}
        <button
          onClick={toggleCollapsed}
          onMouseEnter={() => setToggleHovered(true)}
          onMouseLeave={() => setToggleHovered(false)}
          aria-label={isCollapsed ? 'Kenar çubuğunu genişlet' : 'Kenar çubuğunu daralt'}
          aria-expanded={!isCollapsed}
          className={[
            'absolute -right-3 top-16 z-30',
            'flex h-6 w-6 items-center justify-center',
            'rounded-full border border-[#2e2e3a] bg-[#1a1a22] shadow-md',
            'text-[#55556a] transition-all duration-150',
            'hover:border-[#6c6af6]/40 hover:bg-[#1e1e2e] hover:text-[#9d9cf8]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c6af6]/60',
            // Fade in — only visible when hovering the sidebar area
            'opacity-0 group-hover:opacity-100',
          ].join(' ')}
          style={{
            // Always visible so user can discover it; full opacity on hover
            opacity: toggleHovered ? 1 : 0.6,
          }}
        >
          <span
            className="transition-transform duration-200"
            style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <IconChevronLeft />
          </span>
        </button>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE TOPBAR TRIGGER
          Only visible on small screens. Sits inside DashboardLayout's
          main flow — this renders the hamburger button that opens the drawer.
      ════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-3 border-b border-[#1e1e26] bg-[#13131a]/95 px-4 backdrop-blur-sm">
        <button
          onClick={() => setIsMobileOpen(true)}
          aria-label="Menüyü aç"
          aria-expanded={isMobileOpen}
          aria-controls="mobile-sidebar"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9090a0] hover:bg-[#1e1e26] hover:text-[#d0d0da] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c6af6]/60"
        >
          <IconMenu />
        </button>

        {/* Inline logo for mobile topbar */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#6c6af6] to-[#4e4bc7] text-[11px] font-bold text-white">
            N
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-white">Noyon</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE DRAWER
          Slides in from the left with a blurred backdrop overlay.
          Uses translate-x so only the compositor thread is involved.
      ════════════════════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      <div
        id="mobile-sidebar-backdrop"
        aria-hidden="true"
        onClick={handleBackdropClick}
        className={[
          'md:hidden fixed inset-0 z-40',
          'bg-black/60 backdrop-blur-[2px]',
          'transition-opacity duration-250 ease-out',
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Drawer panel */}
      <aside
        id="mobile-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Navigasyon menüsü"
        className={[
          'md:hidden fixed left-0 top-0 z-50 h-full w-[260px]',
          'bg-[#13131a] border-r border-[#1e1e26] shadow-2xl',
          'transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <SidebarContent mobileMode={true} />
      </aside>
    </>
  );
}
