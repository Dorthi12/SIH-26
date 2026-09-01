/**
 * Landing page primitives — ported from agrisense-insights.
 * Replaced @tanstack/react-router with react-router-dom.
 * Replaced @/ alias with relative paths.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { useLanguage } from "../../context/LanguageContext";

/* ---------------- Reveal on scroll ---------------- */

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setShown(true);
      return;
    }
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("transition-none", className)}
      style={
        shown
          ? { animation: `landing-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`, animationDelay: `${delay}ms` }
          : armed
            ? { opacity: 0 }
            : undefined
      }
    >
      {children}
    </div>
  );
}

/* ---------------- CTAButton ---------------- */

type CTAProps = {
  children: ReactNode;
  to?: string;
  href?: string;
  variant?: "primary" | "secondary" | "amber" | "onDark";
  size?: "md" | "lg";
  withArrow?: boolean;
  className?: string;
};

const ctaBase =
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const ctaVariants: Record<NonNullable<CTAProps["variant"]>, string> = {
  primary:
    "bg-landing-primary text-landing-primary-fg shadow-landing-soft hover:shadow-landing-lift hover:-translate-y-0.5 hover:bg-landing-forest-deep",
  secondary:
    "border border-landing-hairline bg-landing-card/70 text-landing-fg backdrop-blur-sm hover:border-landing-primary/40 hover:bg-landing-card hover:-translate-y-0.5",
  amber:
    "bg-landing-accent text-landing-accent-fg shadow-landing-soft hover:shadow-landing-lift hover:-translate-y-0.5 hover:brightness-105",
  onDark:
    "border border-landing-on-dark/25 bg-landing-on-dark/10 text-landing-on-dark backdrop-blur-sm hover:bg-landing-on-dark/20 hover:-translate-y-0.5",
};

export function CTAButton({
  children,
  to,
  href,
  variant = "primary",
  size = "md",
  withArrow = false,
  className,
}: CTAProps) {
  const cls = cn(
    ctaBase,
    ctaVariants[variant],
    size === "lg" ? "px-7 py-3.5 text-[0.95rem]" : "px-5 py-2.5 text-sm",
    className,
  );
  const inner = (
    <>
      {children}
      {withArrow && (
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );
  if (to)
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  return (
    <a href={href ?? "#"} className={cls}>
      {inner}
    </a>
  );
}

/* ---------------- Section shell ---------------- */

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 px-5 py-12 sm:px-8 md:py-16", className)}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  hindi,
  title,
  sub,
  align = "left",
  onDark = false,
  badgeTheme = "emerald",
}: {
  eyebrow: string;
  hindi?: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: "left" | "center";
  onDark?: boolean;
  badgeTheme?: "emerald" | "indigo" | "amber" | "purple" | "teal";
}) {
  const { language } = useLanguage();

  const themeClasses = {
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
    purple: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
    teal: "border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300",
  }[badgeTheme];

  const showHindiBadge = (language === "both" || language === "hi") && hindi;
  const showEyebrow = language === "en" || language === "both" || !hindi;

  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p
        className={cn(
          "flex flex-wrap items-center gap-2.5",
          align === "center" && "justify-center",
          onDark ? "text-landing-accent" : "text-landing-olive",
        )}
      >
        {showEyebrow && <span className="landing-eyebrow font-bold uppercase tracking-wider">{eyebrow}</span>}
        {showHindiBadge && (
          <span
            className={cn(
              "landing-hindi rounded-full border px-3 py-0.5 text-xs font-semibold shadow-xs transition-colors",
              themeClasses
            )}
          >
            {hindi}
          </span>
        )}
      </p>
      <h2
        className={cn(
          "mt-3 text-3xl leading-[1.15] font-extrabold sm:text-4xl md:text-[2.65rem] tracking-tight",
          onDark ? "text-landing-on-dark" : "text-landing-fg",
        )}
      >
        {title}
      </h2>
      {sub && (
        <p
          className={cn(
            "mt-3 text-base leading-relaxed font-medium",
            onDark ? "text-landing-on-dark-muted" : "text-landing-fg-muted",
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
