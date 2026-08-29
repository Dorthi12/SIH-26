/**
 * Landing page Footer — ported from agrisense-insights.
 */
import { Logo } from "./Navbar";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Crop Guide",          href: "#crop-guide" },
      { label: "Government Schemes",  href: "#schemes" },
      { label: "Weather",             href: "#weather" },
      { label: "Farming Knowledge",   href: "#knowledge" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#about" },
      { label: "Privacy",  href: "#about" },
      { label: "Terms",    href: "#about" },
    ],
  },
];

export function Footer() {
  return (
    <footer id="about" className="scroll-mt-24 border-t border-landing-border bg-landing-secondary/40">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo tagline />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-landing-fg-muted">
            AgriSense helps farmers with crop guidance, weather updates, government schemes and
            practical farming knowledge — all in one place.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold text-landing-fg">{c.title}</p>
            <ul className="mt-4 space-y-3">
              {c.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-landing-fg-muted transition-colors hover:text-landing-primary"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-landing-border px-5 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-xs leading-relaxed text-landing-fg-muted">
            Information shown here is general farming guidance and should be used alongside local
            agricultural advice.
          </p>
          <p className="text-xs text-landing-fg-muted">© 2026 AgriSense</p>
        </div>
      </div>
    </footer>
  );
}
