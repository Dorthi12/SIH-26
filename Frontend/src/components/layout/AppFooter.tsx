import { Link } from "react-router-dom";
import { Leaf, Sparkles } from "lucide-react";

const FOOTER_LINKS = [
  { to: "/recommendation", label: "Recommendation" },
  { to: "/weather",        label: "Weather" },
  { to: "/history",        label: "History" },
  { to: "/about",          label: "About" },
];

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ivory-300 bg-card mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-1.5">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-forest">
                <Leaf className="h-3 w-3 text-white" strokeWidth={2.5} />
                <Sparkles
                  className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-amber"
                  strokeWidth={2.5}
                />
              </div>
              <span className="font-semibold text-sm text-charcoal">
                Agri<span className="text-forest">Sense</span>
              </span>
            </div>
            <p className="text-xs text-charcoal-muted">
              Agricultural Intelligence Platform
            </p>
          </div>

          {/* Nav links */}
          <nav
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1"
            aria-label="Footer navigation"
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs text-charcoal-muted hover:text-forest transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-charcoal-muted">
            &copy; {year} AgriSense
          </p>
        </div>
      </div>
    </footer>
  );
}
