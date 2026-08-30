/**
 * Login.tsx — AgriSense Login Page
 *
 * - Farmer/farmland background (light, softened)
 * - Google OAuth button (integration boundary)
 * - Email + password with show/hide, validation, error states
 * - Remember me + Forgot password
 * - Sets AuthContext session on success → redirects to intended page
 * - Link to /signup
 */

import { useState, useId } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Sprout } from "lucide-react";
import {
  AuthLayout, AuthLogo, AuthInput, GoogleButton,
  AuthDivider, AuthErrorBanner, AuthInfoBanner,
} from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";
import {
  loginWithEmail, loginWithGoogle, requestPasswordReset,
  type AuthErrorCode,
} from "../services/authService";

/* ── helpers ── */

function friendlyMessage(code: AuthErrorCode): string {
  switch (code) {
    case "INVALID_CREDENTIALS": return "Incorrect email or password. Please try again.";
    case "NETWORK_ERROR":       return "Network error. Please check your connection and try again.";
    case "GOOGLE_CANCELLED":    return "Google sign-in was cancelled. Please try again.";
    case "GOOGLE_ERROR":        return "Google sign-in couldn't be completed. Please try again.";
    case "SERVER_ERROR":        return "Something went wrong on our end. Please try again in a moment.";
    case "NOT_IMPLEMENTED":     return ""; // handled separately
    default:                    return "Something went wrong. Please try again.";
  }
}

function validateEmail(v: string) {
  if (!v.trim()) return "Please enter your email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please enter a valid email address.";
  return "";
}
function validatePassword(v: string) {
  if (!v) return "Please enter your password.";
  return "";
}

/* ── Component ── */

export function Login() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { setSession } = useAuth();
  const uid        = useId();

  // Redirect to intended page after login, or /dashboard by default
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/dashboard";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  const [emailErr, setEmailErr] = useState("");
  const [passErr,  setPassErr]  = useState("");

  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error,    setError]    = useState("");
  const [infoMsg,  setInfoMsg]  = useState("");

  const busy = loading || gLoading;

  /* ── Email login ── */
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailErr(eErr); setPassErr(pErr);
    if (eErr || pErr) return;

    setError(""); setInfoMsg(""); setLoading(true);
    const result = await loginWithEmail(email, password);
    setLoading(false);

    if (result.ok) {
      setSession(result.user);
      navigate(from, { replace: true });
    } else if (result.code === "NOT_IMPLEMENTED") {
      // Demo mode: no backend yet — log in locally so the app is usable
      setSession({ name: email.split("@")[0], email, provider: "email" });
      navigate(from, { replace: true });
    } else {
      setError(result.message || friendlyMessage(result.code));
    }
  }

  /* ── Google login ── */
  async function handleGoogle() {
    setError(""); setInfoMsg(""); setGLoading(true);
    const result = await loginWithGoogle();
    setGLoading(false);

    if (result.ok) {
      setSession(result.user);
      navigate(from, { replace: true });
    } else if (result.code === "NOT_IMPLEMENTED") {
      // Demo mode
      setSession({ name: "Google User", email: "user@gmail.com", provider: "google" });
      navigate(from, { replace: true });
    } else {
      setError(result.message || friendlyMessage(result.code));
    }
  }

  /* ── Forgot password ── */
  async function handleForgotPassword() {
    const eErr = validateEmail(email);
    if (!email.trim()) { setEmailErr("Enter your email above, then click 'Forgot password?'"); return; }
    if (eErr) { setEmailErr(eErr); return; }
    setError(""); setInfoMsg("");
    const result = await requestPasswordReset(email);
    if (result.ok) {
      setInfoMsg("If that email exists, you'll receive a reset link shortly.");
    } else if (result.code === "NOT_IMPLEMENTED") {
      setInfoMsg("Password reset is not yet available. Please contact support.");
    } else {
      setError(result.message || friendlyMessage(result.code));
    }
  }

  return (
    <AuthLayout>
      {/* Branding */}
      <div className="flex justify-center">
        <AuthLogo />
      </div>

      {/* Heading */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-charcoal tracking-tight">Welcome back</h1>
        <p className="text-sm text-charcoal-muted">Sign in to continue to your AgriSense dashboard.</p>
      </div>

      {/* Banners */}
      {error   && <AuthErrorBanner message={error} onDismiss={() => setError("")} />}
      {infoMsg && <AuthInfoBanner  message={infoMsg} />}

      {/* Google */}
      <GoogleButton onClick={handleGoogle} loading={gLoading} disabled={busy} label="Continue with Google" />

      {/* Divider */}
      <AuthDivider />

      {/* Form */}
      <form onSubmit={handleEmailLogin} noValidate className="space-y-4">
        <AuthInput id={`${uid}-email`} label="Email" type="email" autoComplete="email"
          placeholder="you@example.com" value={email} disabled={busy} required
          onChange={(e) => { setEmail(e.target.value); if (emailErr) setEmailErr(""); }}
          error={emailErr} />

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor={`${uid}-pw`} className="text-sm font-semibold text-charcoal">Password</label>
            <button type="button" onClick={handleForgotPassword} disabled={busy}
              className="text-xs font-medium text-forest hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 rounded disabled:opacity-50">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input id={`${uid}-pw`} type={showPw ? "text" : "password"} autoComplete="current-password"
              placeholder="••••••••" value={password} disabled={busy} required
              onChange={(e) => { setPassword(e.target.value); if (passErr) setPassErr(""); }}
              aria-invalid={!!passErr} aria-describedby={passErr ? `${uid}-pw-err` : undefined}
              className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-charcoal placeholder:text-charcoal-muted/50 bg-ivory/60 outline-none transition-all duration-150
                ${passErr ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                          : "border-ivory-300 focus:border-forest/60 focus:ring-2 focus:ring-forest/15 hover:border-forest/30"}`} />
            <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal transition-colors focus-visible:outline-none">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passErr && <p id={`${uid}-pw-err`} role="alert" className="text-xs font-medium text-red-500">{passErr}</p>}
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2.5 cursor-pointer group select-none">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} disabled={busy}
            className="h-4 w-4 rounded border-ivory-300 accent-forest cursor-pointer focus:ring-forest/30 focus:ring-2" />
          <span className="text-sm text-charcoal-muted group-hover:text-charcoal transition-colors">Remember me</span>
        </label>

        {/* Submit */}
        <button type="submit" disabled={busy}
          className="group w-full flex items-center justify-center gap-2 rounded-xl bg-forest text-white px-4 py-3 text-sm font-bold hover:bg-forest-600 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed">
          {loading ? (
            <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>Signing in…</>
          ) : (
            <>Sign In<ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></>
          )}
        </button>
      </form>

      {/* Switch to signup */}
      <p className="text-center text-sm text-charcoal-muted">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-forest hover:underline focus-visible:outline-none">
          Create an account
        </Link>
      </p>

      {/* Demo note */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setSession({ name: email ? email.split("@")[0] : "Demo Farmer", email: email || "farmer@agrisense.io", provider: "guest" });
            navigate(from, { replace: true });
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-forest hover:text-forest-600 hover:underline focus-visible:outline-none py-1 px-2.5 rounded-lg hover:bg-forest/5 transition-colors"
        >
          <Sprout className="h-3.5 w-3.5" />
          Quick Preview: Continue in Demo Mode
        </button>
      </div>
    </AuthLayout>
  );
}
