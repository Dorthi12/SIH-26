/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Primary palette ────────────────────────────────────────────────
        forest: {
          DEFAULT: "#1a3d2e",
          50:  "#f0f7f3",
          100: "#d8eee3",
          200: "#b3dcc8",
          300: "#82c3a5",
          400: "#4fa47e",
          500: "#2d8660",
          600: "#1e6b4c",
          700: "#1a3d2e",  // ← brand primary
          800: "#163325",
          900: "#112a1e",
        },
        olive: {
          DEFAULT: "#3d5c2f",
          50:  "#f3f7ef",
          100: "#e2ecd8",
          200: "#c5d9b2",
          300: "#9ec082",
          400: "#74a254",
          500: "#557e38",
          600: "#3d5c2f",  // ← brand secondary
          700: "#334e28",
          800: "#2a4021",
          900: "#21331a",
        },
        // ── Backgrounds ────────────────────────────────────────────────────
        ivory: {
          DEFAULT: "#f9f5ef",
          50:  "#fdfcf9",
          100: "#f9f5ef",  // ← page background
          200: "#f1ebe0",
          300: "#e6ddd0",
        },
        // ── Cards ──────────────────────────────────────────────────────────
        card: "#fefcf8",
        // ── Accent ─────────────────────────────────────────────────────────
        amber: {
          DEFAULT: "#c8922a",
          50:  "#fdf6e7",
          100: "#f9e8c1",
          200: "#f2ce83",
          300: "#e8b040",
          400: "#c8922a",  // ← accent
          500: "#a87520",
          600: "#875d18",
          700: "#664610",
        },
        // ── Text ───────────────────────────────────────────────────────────
        charcoal: {
          DEFAULT: "#1c1c1e",
          light: "#3a3a3c",
          muted: "#6b6b6e",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card:        "0 1px 3px rgba(26,61,46,0.06), 0 4px 16px rgba(26,61,46,0.06)",
        "card-hover": "0 4px 12px rgba(26,61,46,0.10), 0 8px 24px rgba(26,61,46,0.08)",
        "card-glow":  "0 0 0 1px rgba(26,61,46,0.12), 0 4px 20px rgba(26,61,46,0.14)",
        nav:         "0 1px 0 rgba(26,61,46,0.06)",
      },
      animation: {
        "fade-in":    "fadeIn 0.3s ease-out both",
        "slide-up":   "slideUp 0.35s ease-out both",
        "slide-down": "slideDown 0.25s ease-out both",
        "slide-right": "slideRight 0.25s ease-out both",
        "spin-slow":  "spin 2s linear infinite",
        "float":      "float 4s ease-in-out infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "shimmer":    "shimmer 1.8s linear infinite",
        "scale-in":   "scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "reveal":     "reveal 0.5s cubic-bezier(0.4, 0, 0.2, 1) both",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%":   { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%":   { opacity: "0", transform: "translateX(-100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.88)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(26, 61, 46, 0)" },
          "50%":      { boxShadow: "0 0 12px 3px rgba(26, 61, 46, 0.18)" },
        },
        reveal: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
