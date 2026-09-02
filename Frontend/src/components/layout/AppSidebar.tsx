import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Leaf, Sparkles, Menu, X, ChevronRight,
  LayoutDashboard, Sprout, CloudSun, History,
  GitCompare, HelpCircle, UserCircle,
  ChevronLeft, ChevronRight as ChevronRightIcon,
  Settings, MessageSquareText, FlaskConical, Map,
  MoonStar, SunMedium, LogOut, TrendingUp, ShieldAlert,
  Users, User,
  FileText, Store,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { UserAvatar } from "../ui/UserAvatar";

// ── Route definitions ─────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { to: "/dashboard",             label: "Dashboard",             icon: LayoutDashboard },
  { to: "/mandi",                 label: "Agrisense Mandi",        icon: Store },
  { to: "/complaints",            label: "Complaints",            icon: FileText },         
  { to: "/assistant",             label: "AI Assistant",           icon: MessageSquareText },
  { to: "/recommendation",        label: "Recommendation",        icon: Sprout },
  { to: "/disease-detection",     label: "Disease Detection",     icon: Leaf },
  { to: "/yield-forecast",        label: "Yield Forecast",        icon: TrendingUp },
  { to: "/zero-production-risk",  label: "Zero-Production Risk",  icon: ShieldAlert },
  { to: "/scenarios",             label: "Scenario Simulator",    icon: FlaskConical },
  { to: "/district-intelligence", label: "District Intelligence", icon: Map },
  { to: "/comparison",            label: "Compare Crops",         icon: GitCompare },
  { to: "/weather",               label: "Weather",               icon: CloudSun },
  { to: "/history",               label: "History",               icon: History },
  { to: "/explain",               label: "Why This Crop?",        icon: HelpCircle },
  { to: "/community",             label: "Community",             icon: Users },
  { to: "/profile",               label: "Profile",               icon: User },
] as const;

// Routes where /results and /analyzing count as "Recommendation" active
const RECOMMENDATION_FAMILY = ["/recommendation", "/results", "/analyzing"];

function ThemeToggleIconButton({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-ivory-300 bg-white text-charcoal-light shadow-sm transition-colors hover:border-forest/30 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30",
        className
      )}
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </button>
  );
}

// ── Brand logo ────────────────────────────────────────────────────────────

export function AgriSenseLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <NavLink
      to="/dashboard"
      className="flex items-center gap-2.5 group select-none min-w-0"
      aria-label="AgriSense — Dashboard"
    >
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-forest shadow-sm transition-transform duration-200 group-hover:scale-105">
        <Leaf className="h-4 w-4 text-white" strokeWidth={2.5} />
        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber" strokeWidth={2.5} />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <span className="block font-bold text-base tracking-tight text-charcoal leading-none">
            Agri<span className="text-forest">Sense</span>
          </span>
          <span className="block text-2xs text-charcoal-muted/70 mt-0.5 leading-none">
            Farm Intelligence
          </span>
        </div>
      )}
    </NavLink>
  );
}

// ── Sidebar nav item ──────────────────────────────────────────────────────

interface SidebarItemProps {
  to: string;
  label: string;
  icon: React.ElementType;
  collapsed: boolean;
  matchPaths?: readonly string[];
  onClick?: () => void;
}

function SidebarItem({ to, label, icon: Icon, collapsed, matchPaths, onClick }: SidebarItemProps) {
  const location = useLocation();
  const isActive = matchPaths
    ? matchPaths.some((p) => location.pathname === p || location.pathname.startsWith(p + "/"))
    : location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <NavLink
      to={to}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-1",
        collapsed ? "justify-center" : "",
        isActive
          ? "bg-forest/[0.09] text-forest"
          : "text-charcoal-muted hover:bg-forest/[0.05] hover:text-charcoal"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-forest"
          aria-hidden
        />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-forest" : "text-charcoal-muted/70 group-hover:text-charcoal"
        )}
        strokeWidth={isActive ? 2 : 1.75}
      />
      {!collapsed && (
        <span className="truncate">{label}</span>
      )}
      {/* Tooltip when collapsed */}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-lg border border-ivory-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-charcoal shadow-card opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150">
          {label}
        </span>
      )}
    </NavLink>
  );
}

// ── Desktop sidebar ───────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 z-40",
        "bg-white border-r border-ivory-300 transition-all duration-200 ease-smooth shrink-0",
        collapsed ? "w-[60px]" : "w-56"
      )}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className={cn(
        "flex items-center border-b border-ivory-200 h-16 px-3 gap-2",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <AgriSenseLogo collapsed={collapsed} />
        {!collapsed && (
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggleIconButton />
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-charcoal-muted hover:text-forest hover:bg-forest/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
        {collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            className="absolute -right-3 top-[4.5rem] flex h-6 w-6 items-center justify-center rounded-full border border-ivory-300 bg-white text-charcoal-muted shadow-sm hover:text-forest hover:border-forest/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
          >
            <ChevronRightIcon className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            matchPaths={item.to === "/recommendation" ? RECOMMENDATION_FAMILY : undefined}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-ivory-200 p-2 space-y-1">
        {/* New Recommendation CTA */}
        <button
          type="button"
          onClick={() => navigate("/recommendation")}
          className={cn(
            "group w-full flex items-center rounded-xl bg-forest px-3 py-2.5 text-white text-sm font-semibold",
            "hover:bg-forest-600 transition-all duration-150 shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-1",
            collapsed ? "justify-center" : "gap-2"
          )}
          title={collapsed ? "New Recommendation" : undefined}
          aria-label="Start new crop recommendation"
        >
          <Sprout className="h-4 w-4 shrink-0" strokeWidth={2} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">New Recommendation</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        {/* Settings stub */}
        <SidebarItem
          to="/about"
          label="About"
          icon={Settings}
          collapsed={collapsed}
        />

        {/* Profile & Logout */}
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-ivory-100/70 dark:bg-charcoal/30 px-3 py-2 mt-1">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest font-bold text-xs uppercase overflow-hidden">
                <UserAvatar
                  src={user?.profileImageUrl || user?.preSignedUrl}
                  name={user?.name}
                  className="h-full w-full object-cover"
                  iconClassName="h-4 w-4 text-forest"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-charcoal truncate">{user?.name || "Farmer"}</p>
                <p className="text-[10px] text-charcoal-muted truncate">{user?.email || "AgriSense user"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-charcoal-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            title={`Sign Out (${user?.name || "Farmer"})`}
            aria-label="Sign Out"
            className="w-full flex justify-center items-center py-2.5 rounded-xl text-charcoal-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus-visible:outline-none"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}

// ── Mobile header ─────────────────────────────────────────────────────────

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "lg:hidden sticky top-0 z-50 w-full bg-white dark:bg-[#17211d] h-16",
        "border-b border-ivory-200 dark:border-[#26362f] transition-shadow duration-200 flex items-center",
        scrolled ? "shadow-nav" : "shadow-sm"
      )}
    >
      <div className="flex items-center justify-between w-full px-4 gap-3">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={onMenuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-ivory-300 bg-white text-charcoal-light hover:text-forest hover:border-forest/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
        >
          <Menu className="h-5 w-5" />
        </button>

        <AgriSenseLogo />

        <ThemeToggleIconButton />
      </div>
    </header>
  );
}

// ── Mobile drawer ─────────────────────────────────────────────────────────

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearSession } = useAuth();

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  if (!open) return null;

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Trap scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="lg:hidden fixed inset-0 z-50 bg-charcoal/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <div
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl flex flex-col animate-slide-right"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-ivory-200">
          <AgriSenseLogo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-ivory-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              collapsed={false}
              matchPaths={item.to === "/recommendation" ? RECOMMENDATION_FAMILY : undefined}
              onClick={onClose}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-ivory-200 p-3 space-y-2">
          <ThemeToggleIconButton className="w-full justify-start px-4" />

          <button
            type="button"
            onClick={() => { navigate("/recommendation"); onClose(); }}
            className="group w-full flex items-center gap-2 rounded-xl bg-forest px-4 py-3 text-white text-sm font-bold hover:bg-forest-600 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
            aria-label="Start new crop recommendation"
          >
            <Sprout className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">New Recommendation</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Mobile Profile & Logout */}
          <div className="flex items-center justify-between gap-2 rounded-xl bg-ivory-100/70 dark:bg-charcoal/30 px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest font-bold text-xs uppercase overflow-hidden">
                <UserAvatar
                  src={user?.profileImageUrl || user?.preSignedUrl}
                  name={user?.name}
                  className="h-full w-full object-cover"
                  iconClassName="h-5 w-5 text-forest"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-charcoal truncate">{user?.name || "Farmer"}</p>
                <p className="text-2xs text-charcoal-muted truncate">{user?.email || "AgriSense user"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { handleLogout(); onClose(); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Desktop top header (context/breadcrumb) ───────────────────────────────

export function DesktopPageHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();

  return (
    <div className="hidden lg:flex h-16 shrink-0 items-center justify-between px-6 border-b border-ivory-200 dark:border-[#26362f] bg-white dark:bg-[#17211d] shadow-sm sticky top-0 z-40">
      <p className="text-sm font-semibold text-charcoal">{title}</p>
      <div className="flex items-center gap-3">
        <ThemeToggleIconButton />
        <div className="flex items-center gap-2 rounded-full border border-ivory-300 bg-white px-3 py-1.5 shadow-sm">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest font-bold text-[10px] uppercase overflow-hidden">
            <UserAvatar
              src={user?.profileImageUrl || user?.preSignedUrl}
              name={user?.name}
              className="h-full w-full object-cover"
              iconClassName="h-3.5 w-3.5 text-charcoal-muted"
            />
          </div>
          <span className="text-xs font-semibold text-charcoal-light">{user?.name || "Farmer"}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            clearSession();
            navigate("/login", { replace: true });
          }}
          title="Sign Out"
          className="flex items-center gap-1.5 rounded-xl border border-ivory-300 bg-white px-3 py-1.5 text-xs font-medium text-charcoal-muted hover:text-red-500 hover:border-red-200 transition-all focus-visible:outline-none"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
        <button
          type="button"
          onClick={() => navigate("/recommendation")}
          className="hidden xl:flex items-center gap-1.5 rounded-xl border border-forest/20 bg-white px-3 py-1.5 text-xs font-bold text-forest shadow-sm hover:bg-forest/[0.04] hover:border-forest/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
        >
          <Sprout className="h-3.5 w-3.5" />
          New Recommendation
        </button>
      </div>
    </div>
  );
}

// ── usePageTitle ──────────────────────────────────────────────────────────

const ROUTE_TITLES: Record<string, string> = {
  "/":               "Home",
  "/dashboard":      "Dashboard",
  "/mandi":          "🌾 Agrisense Mandi",
  "/recommendation": "Crop Recommendation",
  "/analyzing":      "Analyzing...",
  "/results":        "Recommendation Results",
  "/comparison":     "Crop Comparison",
  "/explain":        "Why This Crop?",
  "/weather":        "Weather Intelligence",
  "/history":        "Historical Performance",
  "/scenarios":              "Scenario Simulator",
  "/district-intelligence":  "District Intelligence",
  "/about":                  "About",
  "/community":              "Community Feed",
  "/profile":                "User Profile",
};

export function usePageTitle(): string {
  const { pathname } = useLocation();
  return ROUTE_TITLES[pathname] ?? "AgriSense";
}
