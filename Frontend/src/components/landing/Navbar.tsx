/**
 * Landing page Navbar + Logo — ported from agrisense-insights.
 * Replaced @tanstack/react-router with react-router-dom.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { CTAButton } from "./primitives";

export function Logo({ tone = "light", tagline = false }: { tone?: "light" | "dark"; tagline?: boolean }) {
  const dark = tone === "dark";
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="size-9 shrink-0" aria-hidden="true">
        <path
          d="M26 6c0 10.5-6.6 16.5-13.6 16.5-1.6 0-3.2-.3-4.6-1C8.7 12.7 15.7 6.4 26 6Z"
          className={dark ? "fill-landing-leaf" : "fill-landing-primary"}
        />
        <path
          d="M6 27c2.2-6.2 6.7-11 12.5-13.4"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          className={dark ? "stroke-landing-on-dark-muted" : "stroke-landing-olive"}
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-xl font-bold tracking-tight",
            dark ? "text-landing-on-dark" : "text-landing-fg",
          )}
        >
          AgriSense
        </span>
        {tagline && (
          <span
            className={cn(
              "mt-1 text-[0.65rem] font-medium tracking-wide",
              dark ? "text-landing-on-dark-muted" : "text-landing-fg-muted",
            )}
          >
            Smart Farming. Better Tomorrow.
          </span>
        )}
      </span>
    </span>
  );
}

const NAV = [
  { label: "Home",      href: "#top" },
  { label: "Crop Guide", href: "#crop-guide" },
  { label: "Schemes",   href: "#schemes" },
  { label: "Weather",   href: "#weather" },
  { label: "Knowledge", href: "#knowledge" },
  { label: "About Us",  href: "#about" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-landing-card/90 backdrop-blur-xl transition-shadow duration-300",
        scrolled ? "border-b border-landing-border shadow-landing-soft" : "border-b border-landing-border/60",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-3 sm:px-8">
        <Link to="/" aria-label="AgriSense home">
          <Logo tagline />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Landing page navigation">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="relative py-1 text-sm font-medium text-landing-fg-muted transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:bg-landing-primary after:transition-all after:duration-300 hover:text-landing-fg hover:after:w-full"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-full border border-landing-border px-5 py-2.5 text-sm font-semibold text-landing-fg transition-colors hover:border-landing-primary/40 hover:bg-landing-secondary/60"
          >
            Log In
          </Link>
          <CTAButton to="/signup" withArrow>
            Get Started
          </CTAButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          className="rounded-full border border-landing-border p-2 md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-landing-border bg-landing-card px-5 py-5 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-landing-fg"
              >
                {n.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-landing-fg"
            >
              Log In
            </Link>
            <CTAButton to="/signup" withArrow className="mt-1 w-full">
              Get Started
            </CTAButton>
          </nav>
        </div>
      )}
    </header>
  );
}
