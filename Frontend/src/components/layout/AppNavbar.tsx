import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Leaf, Sparkles, Menu, X, ChevronRight,
  LayoutDashboard, Sprout, CloudSun, History,
  GitCompare, HelpCircle, UserCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { ThemeToggleButton } from "./ThemeToggleButton";

// ── Nav items ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { to: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { to: "/results",      label: "Recommendation", icon: Sprout },
  { to: "/weather",      label: "Weather",      icon: CloudSun },
  { to: "/history",      label: "History",      icon: History },
  { to: "/comparison",   label: "Compare",      icon: GitCompare },
] as const;

const MOBILE_EXTRA = [
  { to: "/explain", label: "Why This Crop", icon: HelpCircle },
] as const;

// ── Logo ───────────────────────────────────────────────────────────────────

function AgriSenseLogo() {
  return (
    <NavLink
      to="/dashboard"
      className="flex items-center gap-2.5 group select-none"
      aria-label="AgriSense — Dashboard"
    >
      <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-forest shadow-sm transition-transform duration-200 group-hover:scale-105">
        <Leaf className="h-4 w-4 text-white" strokeWidth={2.5} />
        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber" strokeWidth={2.5} />
      </div>
      <span className="font-semibold text-lg tracking-tight text-charcoal leading-none">
        Agri<span className="text-forest">Sense</span>
      </span>
    </NavLink>
  );
}

// ── Desktop nav link ───────────────────────────────────────────────────────

function DesktopNavLink({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-1.5 text-sm font-medium px-1 py-0.5 transition-colors duration-150 relative",
          "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:rounded-full after:transition-all after:duration-200",
          isActive
            ? "text-forest after:w-full after:bg-forest"
            : "text-charcoal-light hover:text-forest after:w-0 hover:after:w-full after:bg-forest/50"
        )
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </NavLink>
  );
}

// ── AppNavbar ──────────────────────────────────────────────────────────────

export function AppNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-ivory/95 backdrop-blur-sm",
        "border-b border-ivory-300 transition-shadow duration-200",
        scrolled ? "shadow-nav" : ""
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <AgriSenseLogo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <DesktopNavLink key={link.to} to={link.to} label={link.label} icon={link.icon} />
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <ThemeToggleButton className="hidden sm:inline-flex" />

            {/* Farm avatar chip */}
            <div className="hidden md:flex items-center gap-2 rounded-full border border-ivory-300 bg-white px-3 py-1.5 shadow-sm">
              <UserCircle className="h-4 w-4 text-charcoal-muted" />
              <span className="text-xs font-semibold text-charcoal-light">Prayagraj Farm</span>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex group"
              icon={<ChevronRight className="h-3.5 w-3.5" />}
              iconPosition="right"
              onClick={() => navigate("/recommendation")}
            >
              New Recommendation
            </Button>

            {/* Mobile toggle */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                "md:hidden flex h-8 w-8 items-center justify-center rounded-lg",
                "text-charcoal-light hover:text-charcoal hover:bg-forest/6",
                "transition-colors duration-150"
              )}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-ivory-300 bg-ivory animate-slide-down"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 space-y-1">
            <ThemeToggleButton className="w-full justify-start mb-2" showLabel />

            {[...NAV_LINKS, ...MOBILE_EXTRA].map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
                    "transition-colors duration-150",
                    isActive
                      ? "bg-forest/8 text-forest"
                      : "text-charcoal-light hover:bg-forest/5 hover:text-forest"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}

            <NavLink
              to="/about"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
                  "transition-colors duration-150",
                  isActive
                    ? "bg-forest/8 text-forest"
                    : "text-charcoal-light hover:bg-forest/5 hover:text-forest"
                )
              }
            >
              About
            </NavLink>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full group"
                icon={<ChevronRight className="h-4 w-4" />}
                iconPosition="right"
                onClick={() => navigate("/recommendation")}
              >
                New Recommendation
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
