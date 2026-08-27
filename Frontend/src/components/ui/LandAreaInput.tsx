import { useId } from "react";
import { Ruler } from "lucide-react";
import { cn } from "../../utils/cn";

// ---------------------------------------------------------------------------
// LandAreaInput
// ---------------------------------------------------------------------------

interface LandAreaInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
}

export function LandAreaInput({
  value,
  onChange,
  error,
  label = "Land Area",
  required,
  id: externalId,
  disabled,
}: LandAreaInputProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow empty, digits, and a single decimal point
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      onChange(raw);
    }
  };

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <label htmlFor={id} className="block text-sm font-medium text-charcoal">
        {label}
        {required && (
          <span className="ml-1 text-amber-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {/* Input group */}
      <div className="relative flex items-stretch">
        {/* Left icon */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Ruler
            className={cn(
              "h-4 w-4 transition-colors",
              value ? "text-forest/70" : "text-charcoal-muted/40"
            )}
          />
        </div>

        {/* Number input */}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="e.g. 2.5"
          aria-required={required}
          aria-describedby={[error ? errorId : "", hintId].filter(Boolean).join(" ")}
          aria-invalid={error ? "true" : undefined}
          className={cn(
            "flex-1 pl-10 pr-20 py-2.5 rounded-xl border text-sm text-charcoal bg-white",
            "placeholder:text-charcoal-muted/50",
            "transition-all duration-150 outline-none",
            "focus:ring-2 focus:ring-forest/20 focus:border-forest",
            error
              ? "border-red-400 focus:ring-red-200 focus:border-red-400"
              : "border-ivory-300 hover:border-forest/40",
            disabled && "opacity-50 cursor-not-allowed bg-ivory-200"
          )}
        />

        {/* Unit badge — always visible */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1">
          <span className="flex items-center h-[calc(100%-8px)] px-3 text-sm font-medium text-charcoal-muted bg-ivory-100 border-l border-ivory-300 rounded-r-lg">
            acres
          </span>
        </div>
      </div>

      {/* Hint */}
      <p id={hintId} className="text-xs text-charcoal-muted">
        Used to estimate total production from predicted yield.
      </p>

      {/* Error */}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600 flex items-center gap-1">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}
