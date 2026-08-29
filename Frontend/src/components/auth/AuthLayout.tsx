/**
 * AuthLayout — Shared background + branding shell for Login & Signup pages.
 *
 * Renders:
 *   - Full-page soft farmer/farmland background (lightened)
 *   - Centered form card with AgriSense logo
 *   - Animated entrance
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

/* ── Logo ─────────────────────────────────────────────────────────────────── */

export function AuthLogo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 group" aria-label="AgriSense home">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest shadow-card group-hover:shadow-card-hover transition-all duration-200">
        <Leaf className="h-5 w-5 text-white" strokeWidth={2} />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xl font-bold tracking-tight text-charcoal">AgriSense</span>
        <span className="text-[0.65rem] font-medium text-charcoal-muted mt-0.5 tracking-wide">
          Smarter decisions for healthier farms.
        </span>
      </div>
    </Link>
  );
}

/* ── Layout ───────────────────────────────────────────────────────────────── */

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 sm:py-16 overflow-hidden">

      {/* ── Farmer background ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/auth-farmer-bg.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
          loading="eager"
          decoding="async"
        />
        {/* Very light ivory wash to soften the photo into a subtle texture */}
        <div className="absolute inset-0 bg-ivory/80" />
        {/* Soft radial vignette keeps edges warmer */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/20" />
        {/* Left-side green tint keeps brand presence */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest/[0.04] via-transparent to-transparent" />
      </div>

      {/* ── Form card ── */}
      <div
        className="relative z-10 w-full max-w-[440px] animate-slide-up"
        style={{ animationFillMode: "both" }}
      >
        {/* Glass/ivory card surface */}
        <div className="rounded-3xl border border-ivory-300/80 bg-white/92 backdrop-blur-md shadow-[0_8px_40px_rgba(26,61,46,0.10)] px-8 py-9 space-y-7">
          {children}
        </div>

        {/* Bottom note */}
        <p className="mt-5 text-center text-xs text-charcoal-muted/70 leading-relaxed px-4">
          By continuing, you agree to AgriSense's{" "}
          <a href="#" className="underline hover:text-forest transition-colors">Terms</a>
          {" "}and{" "}
          <a href="#" className="underline hover:text-forest transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

/* ── Shared input field ───────────────────────────────────────────────────── */

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  hint?: string;
}

export function AuthInput({ label, id, error, hint, className, ...props }: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-charcoal">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`
          w-full rounded-xl border px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-muted/50
          bg-ivory/60 transition-all duration-150 outline-none
          ${error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
            : "border-ivory-300 focus:border-forest/60 focus:ring-2 focus:ring-forest/15 hover:border-forest/30"
          }
          ${className ?? ""}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-charcoal-muted/70">
          {hint}
        </p>
      )}
    </div>
  );
}

/* ── Google button ───────────────────────────────────────────────────────── */

interface GoogleButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function GoogleButton({ onClick, loading = false, disabled = false, label = "Continue with Google" }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={loading ? "Connecting to Google…" : label}
      className="
        group w-full flex items-center justify-center gap-3 rounded-xl border border-ivory-300
        bg-white px-4 py-3 text-sm font-semibold text-charcoal shadow-sm
        hover:border-forest/30 hover:shadow-card hover:-translate-y-0.5
        active:scale-[0.98] active:translate-y-0
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2
        disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm
      "
    >
      {loading ? (
        /* Spinner */
        <svg className="h-4 w-4 animate-spin text-charcoal-muted" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        /* Official Google G */
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      <span>{loading ? "Connecting to Google…" : label}</span>
    </button>
  );
}

/* ── Divider ─────────────────────────────────────────────────────────────── */

export function AuthDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label={label}>
      <div className="flex-1 h-px bg-ivory-300" />
      <span className="text-xs font-medium text-charcoal-muted/60 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-ivory-300" />
    </div>
  );
}

/* ── Error banner ────────────────────────────────────────────────────────── */

interface AuthErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function AuthErrorBanner({ message, onDismiss }: AuthErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 animate-slide-down"
    >
      <svg className="h-4 w-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <p className="flex-1 text-xs font-medium text-red-700 leading-relaxed">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss error"
          className="text-red-400 hover:text-red-600 transition-colors focus-visible:outline-none">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── Info banner (not-yet-implemented notice) ───────────────────────────── */

export function AuthInfoBanner({ message }: { message: string }) {
  return (
    <div role="status" className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 animate-slide-down">
      <svg className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      <p className="flex-1 text-xs font-medium text-amber-700 leading-relaxed">{message}</p>
    </div>
  );
}
