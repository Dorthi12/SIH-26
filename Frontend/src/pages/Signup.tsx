/**
 * Signup.tsx — AgriSense Sign Up Page
 *
 * Features:
 *  - Same farmer/farmland background as Login (consistent brand)
 *  - Google OAuth button (integration boundary)
 *  - Full Name, Email, Password, Confirm Password
 *  - Inline password requirements (live validation)
 *  - Passwords match indicator
 *  - Success state (frontend-ready)
 *  - Link to /login
 *  - Accessible, reduced-motion-aware, responsive
 */

import { useState, useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, X, ArrowRight, CheckCircle2, Sprout } from "lucide-react";
import {
  AuthLayout, AuthLogo, AuthInput, GoogleButton,
  AuthDivider, AuthErrorBanner, AuthInfoBanner,
} from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";
import {
  signupWithEmail, loginWithGoogle,
  type AuthErrorCode,
} from "../services/authService";

/* ── Friendly error messages ─────────────────────────────────────────────── */

function friendlyMessage(code: AuthErrorCode): string {
  switch (code) {
    case "EMAIL_TAKEN": return "An account with that email already exists. Try signing in instead.";
    case "WEAK_PASSWORD": return "Your password is too weak. Please use at least 8 characters.";
    case "NETWORK_ERROR": return "Network error. Please check your connection and try again.";
    case "GOOGLE_CANCELLED": return "Google sign-in was cancelled.";
    case "GOOGLE_ERROR": return "Google sign-in couldn't be completed. Please try again.";
    case "SERVER_ERROR": return "Something went wrong on our end. Please try again in a moment.";
    case "NOT_IMPLEMENTED": return "Authentication backend is not yet connected. This is a UI preview.";
    default: return "Something went wrong. Please try again.";
  }
}

/* ── Password requirement pill ───────────────────────────────────────────── */

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${met ? "text-forest" : "text-charcoal-muted/60"}`}>
      {met
        ? <Check className="h-3 w-3 shrink-0" />
        : <X className="h-3 w-3 shrink-0 text-charcoal-muted/40" />
      }
      {label}
    </span>
  );
}

/* ── Validation ──────────────────────────────────────────────────────────── */

function validateName(v: string) { return v.trim() ? "" : "Please enter your full name."; }
function validateEmail(v: string) {
  if (!v.trim()) return "Please enter your email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please enter a valid email address.";
  return "";
}
function validateRole(v: string) {
  return v ? "" : "Please select your role.";
}

function validateGender(v: string) {
  return v ? "" : "Please select your gender.";
}

function validateDob(v: string) {
  if (!v) return "Please select your date of birth.";

  const selectedDate = new Date(v);
  const today = new Date();

  if (selectedDate > today) {
    return "Date of birth cannot be in the future.";
  }

  return "";
}
/* ── Component ───────────────────────────────────────────────────────────── */

export function Signup() {
  const navigate = useNavigate();
  const uid = useId();
  const { setSession } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);

  const [nameErr, setNameErr] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [roleErr, setRoleErr] = useState("");
  const [genderErr, setGenderErr] = useState("");
  const [dobErr, setDobErr] = useState("");
  const [passErr, setPassErr] = useState("");
  const [confirmErr, setConfirmErr] = useState("");

  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [success, setSuccess] = useState(false);

  /* ── Password requirements ── */
  const pwReqs = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const pwStrong = Object.values(pwReqs).every(Boolean);
  const pwMatch = password === confirmPw && confirmPw.length > 0;
  const pwNoMatch = confirmPw.length > 0 && password !== confirmPw;

  /* ── Handlers ── */

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const rErr = validateRole(role);
    const gErr = validateGender(gender);
    const dErr = validateDob(dob);

    const pErr = !password
      ? "Please choose a password."
      : !pwStrong
        ? "Password doesn't meet all requirements."
        : "";
    const cErr = !confirmPw ? "Please confirm your password."
      : !pwMatch ? "Passwords do not match."
        : "";
    setNameErr(nErr);
    setEmailErr(eErr);
    setRoleErr(rErr);
    setGenderErr(gErr);
    setDobErr(dErr);
    setPassErr(pErr);
    setConfirmErr(cErr);

    if (nErr || eErr || rErr || gErr || dErr || pErr || cErr) return;
    setError(""); setInfoMsg(""); setLoading(true);
    const result = await signupWithEmail(name, email, password, role, dob, gender);
    setLoading(false);

    if (result.ok) {
      setSession(result.user);
      setSuccess(true);
    } else if (result.code === "NOT_IMPLEMENTED") {
      // Demo mode — create local session
      setSession({ name, email, provider: "email" });
      setSuccess(true);
    } else {
      setError(result.message || friendlyMessage(result.code));
    }
  }

  async function handleGoogle() {
    setError(""); setInfoMsg(""); setGLoading(true);
    const result = await loginWithGoogle();
    setGLoading(false);
    if (result.ok) {
      setSession(result.user);
      navigate("/dashboard", { replace: true });
    } else if (result.code === "NOT_IMPLEMENTED") {
      // Demo mode
      setSession({ name: "Google User", email: "user@gmail.com", provider: "google" });
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.message || friendlyMessage(result.code));
    }
  }

  const busy = loading || gLoading;

  /* ── Success screen ── */

  if (success) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center gap-5 py-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-forest to-olive shadow-card-glow">
              <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={1.5} />
            </div>
            <div className="absolute -inset-3 rounded-full border-2 border-forest/15 animate-ping" style={{ animationDuration: "2s" }} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-charcoal">Account created!</h1>
            <p className="text-sm text-charcoal-muted leading-relaxed max-w-xs">
              Welcome to AgriSense, {name.split(" ")[0]}. Continue to your dashboard to get started.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard", { replace: true })}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-forest text-white text-sm font-bold hover:bg-forest-600 transition-all shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
          >
            Continue to AgriSense
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </AuthLayout>
    );
  }

  /* ── Main form ── */

  return (
    <AuthLayout>
      {/* Branding */}
      <div className="flex flex-col items-center gap-1 text-center">
        <AuthLogo />
      </div>

      {/* Heading */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-charcoal tracking-tight">Create your account</h1>
        <p className="text-sm text-charcoal-muted leading-relaxed">
          Start making smarter agricultural decisions.
        </p>
      </div>

      {/* Error / Info banners */}
      {error && <AuthErrorBanner message={error} onDismiss={() => setError("")} />}
      {infoMsg && <AuthInfoBanner message={infoMsg} />}

      {/* Google button */}
      <GoogleButton
        onClick={handleGoogle}
        loading={gLoading}
        disabled={busy}
        label="Sign up with Google"
      />

      {/* Divider */}
      <AuthDivider />

      {/* Form */}
      <form onSubmit={handleSignup} noValidate className="space-y-4">

        {/* Full Name */}
        <AuthInput
          id={`${uid}-name`}
          label="Full Name"
          type="text"
          autoComplete="name"
          placeholder="Ramesh Kumar"
          value={name}
          onChange={(e) => { setName(e.target.value); if (nameErr) setNameErr(""); }}
          error={nameErr}
          disabled={busy}
          required
        />

        {/* Email */}
        <AuthInput
          id={`${uid}-email`}
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (emailErr) setEmailErr(""); }}
          error={emailErr}
          disabled={busy}
          required
        />
        {/* Role */}
        <div className="space-y-1.5">
          <label
            htmlFor={`${uid}-role`}
            className="block text-sm font-semibold text-charcoal"
          >
            Role
          </label>

          <select
            id={`${uid}-role`}
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (roleErr) setRoleErr("");
            }}
            disabled={busy}
            className={`
      w-full rounded-xl border px-4 py-3 text-sm text-charcoal
      bg-ivory/60 transition-all duration-150 outline-none
      ${roleErr
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                : "border-ivory-300 focus:border-forest/60 focus:ring-2 focus:ring-forest/15 hover:border-forest/30"
              }
    `}
          >
            <option value="">Select your role</option>
            <option value="USER">User</option>
            <option value="LEADER">Leader</option>
            <option value="ADMINISTRATOR">Administrator</option>
            <option value="REPRESENTATIVE">Representative</option>
          </select>

          {roleErr && (
            <p className="text-xs font-medium text-red-500">
              {roleErr}
            </p>
          )}
        </div>

        {/* Gender and Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Gender */}
          <div className="space-y-1.5">
            <label
              htmlFor={`${uid}-gender`}
              className="block text-sm font-semibold text-charcoal"
            >
              Gender
            </label>

            <select
              id={`${uid}-gender`}
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                if (genderErr) setGenderErr("");
              }}
              disabled={busy}
              className={`
        w-full rounded-xl border px-4 py-3 text-sm text-charcoal
        bg-ivory/60 transition-all duration-150 outline-none
        ${genderErr
                  ? "border-red-400"
                  : "border-ivory-300 focus:border-forest/60 focus:ring-2 focus:ring-forest/15"
                }
      `}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
              <option value="Prefer not to say">
                Prefer not to say
              </option>
            </select>

            {genderErr && (
              <p className="text-xs font-medium text-red-500">
                {genderErr}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label
              htmlFor={`${uid}-dob`}
              className="block text-sm font-semibold text-charcoal"
            >
              Date of Birth
            </label>

            <input
              id={`${uid}-dob`}
              type="date"
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                if (dobErr) setDobErr("");
              }}
              disabled={busy}
              max={new Date().toISOString().split("T")[0]}
              className={`
        w-full rounded-xl border px-4 py-3 text-sm text-charcoal
        bg-ivory/60 transition-all duration-150 outline-none
        ${dobErr
                  ? "border-red-400"
                  : "border-ivory-300 focus:border-forest/60 focus:ring-2 focus:ring-forest/15"
                }
      `}
            />

            {dobErr && (
              <p className="text-xs font-medium text-red-500">
                {dobErr}
              </p>
            )}
          </div>

        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor={`${uid}-password`} className="block text-sm font-semibold text-charcoal">
            Password
          </label>
          <div className="relative">
            <input
              id={`${uid}-password`}
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (passErr) setPassErr(""); }}
              disabled={busy}
              required
              aria-invalid={!!passErr}
              aria-describedby={passErr ? `${uid}-password-error` : `${uid}-password-req`}
              className={`
                w-full rounded-xl border px-4 py-3 pr-11 text-sm text-charcoal placeholder:text-charcoal-muted/50
                bg-ivory/60 transition-all duration-150 outline-none
                ${passErr
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                  : "border-ivory-300 focus:border-forest/60 focus:ring-2 focus:ring-forest/15 hover:border-forest/30"
                }
              `}
            />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal transition-colors focus-visible:outline-none">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passErr && (
            <p id={`${uid}-password-error`} role="alert" className="text-xs font-medium text-red-500">{passErr}</p>
          )}
          {/* Live requirements */}
          {password.length > 0 && (
            <div id={`${uid}-password-req`} className="flex flex-wrap gap-x-4 gap-y-1 pt-1" aria-live="polite">
              <Req met={pwReqs.length} label="8+ characters" />
              <Req met={pwReqs.upper} label="Uppercase letter" />
              <Req met={pwReqs.number} label="Number" />
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor={`${uid}-confirm`} className="block text-sm font-semibold text-charcoal">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id={`${uid}-confirm`}
              type={showCPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); if (confirmErr) setConfirmErr(""); }}
              disabled={busy}
              required
              aria-invalid={!!confirmErr || pwNoMatch}
              aria-describedby={confirmErr ? `${uid}-confirm-error` : pwMatch ? `${uid}-confirm-ok` : undefined}
              className={`
                w-full rounded-xl border px-4 py-3 pr-11 text-sm text-charcoal placeholder:text-charcoal-muted/50
                bg-ivory/60 transition-all duration-150 outline-none
                ${confirmErr || pwNoMatch
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                  : pwMatch
                    ? "border-forest/50 focus:border-forest/60 focus:ring-2 focus:ring-forest/15"
                    : "border-ivory-300 focus:border-forest/60 focus:ring-2 focus:ring-forest/15 hover:border-forest/30"
                }
              `}
            />
            <button type="button" onClick={() => setShowCPw((v) => !v)}
              aria-label={showCPw ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal transition-colors focus-visible:outline-none">
              {showCPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmErr && (
            <p id={`${uid}-confirm-error`} role="alert" className="text-xs font-medium text-red-500">{confirmErr}</p>
          )}
          {!confirmErr && pwNoMatch && (
            <p role="alert" className="text-xs font-medium text-red-500">Passwords do not match.</p>
          )}
          {!confirmErr && pwMatch && (
            <p id={`${uid}-confirm-ok`} aria-live="polite" className="flex items-center gap-1 text-xs font-medium text-forest">
              <Check className="h-3 w-3" /> Passwords match
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={busy}
          className="
            group w-full flex items-center justify-center gap-2 rounded-xl
            bg-forest text-white px-4 py-3 text-sm font-bold
            hover:bg-forest-600 active:scale-[0.98]
            transition-all duration-200 shadow-sm hover:shadow-md
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2
            disabled:opacity-55 disabled:cursor-not-allowed
          "
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account…
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Switch to login */}
      <p className="text-center text-sm text-charcoal-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-forest hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 rounded"
        >
          Sign in
        </Link>
      </p>

      {/* Demo note */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setSession({ name: name || "Demo Farmer", email: email || "farmer@agrisense.io", provider: "guest" });
            navigate("/dashboard", { replace: true });
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
