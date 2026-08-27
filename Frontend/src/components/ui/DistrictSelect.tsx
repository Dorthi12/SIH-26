import {
  useState,
  useRef,
  useEffect,
  useId,
  type KeyboardEvent,
} from "react";
import { MapPin, ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "../../utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DistrictOption {
  value: string;
  label: string;
}

interface DistrictSelectProps {
  options: DistrictOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// DistrictSelect — accessible searchable dropdown
// ---------------------------------------------------------------------------

export function DistrictSelect({
  options,
  value,
  onChange,
  placeholder = "Select your district",
  error,
  label = "District",
  required,
  id: externalId,
  disabled,
}: DistrictSelectProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const errorId = `${id}-error`;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
      setHighlightedIndex(-1);
    } else {
      setSearch("");
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (opt: DistrictOption) => {
    onChange(opt.value);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
          handleSelect(filtered[highlightedIndex]);
        }
        break;
      case "Escape":
        setOpen(false);
        containerRef.current?.querySelector<HTMLButtonElement>("[data-trigger]")?.focus();
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <label
        htmlFor={`${id}-trigger`}
        className="block text-sm font-medium text-charcoal"
      >
        {label}
        {required && (
          <span className="ml-1 text-amber-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {/* Control */}
      <div
        ref={containerRef}
        className="relative"
        onKeyDown={handleKeyDown}
      >
        {/* Trigger button */}
        <button
          id={`${id}-trigger`}
          type="button"
          data-trigger
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl",
            "bg-white border text-left text-sm",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-1",
            open
              ? "border-forest ring-2 ring-forest/20"
              : error
              ? "border-red-400"
              : "border-ivory-300 hover:border-forest/40",
            disabled && "opacity-50 cursor-not-allowed bg-ivory-200"
          )}
        >
          {/* Icon */}
          <MapPin
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              selectedOption ? "text-forest" : "text-charcoal-muted/50"
            )}
          />

          {/* Value / placeholder */}
          <span
            className={cn(
              "flex-1 min-w-0 truncate",
              selectedOption ? "text-charcoal" : "text-charcoal-muted/60"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {/* Clear button or chevron */}
          {selectedOption ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear district selection"
              onClick={handleClear}
              className="text-charcoal-muted/50 hover:text-charcoal transition-colors p-0.5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          ) : (
            <ChevronDown
              className={cn(
                "h-4 w-4 text-charcoal-muted/50 shrink-0 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          )}
        </button>

        {/* Dropdown panel */}
        {open && (
          <div
            className={cn(
              "absolute z-50 mt-1.5 w-full",
              "bg-white border border-ivory-300 rounded-xl shadow-card-hover",
              "animate-slide-down overflow-hidden"
            )}
          >
            {/* Search */}
            <div className="p-2 border-b border-ivory-200">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ivory-100">
                <Search className="h-3.5 w-3.5 text-charcoal-muted/50 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setHighlightedIndex(-1);
                  }}
                  placeholder="Search district…"
                  className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal-muted/50 outline-none"
                  aria-label="Search districts"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-charcoal-muted/50 hover:text-charcoal transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Options list */}
            <ul
              ref={listRef}
              id={`${id}-listbox`}
              role="listbox"
              aria-label="Districts"
              aria-activedescendant={
                highlightedIndex >= 0
                  ? `${id}-option-${highlightedIndex}`
                  : undefined
              }
              className="max-h-52 overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-charcoal-muted text-center">
                  No districts found
                </li>
              ) : (
                filtered.map((opt, idx) => {
                  const isSelected = opt.value === value;
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <li
                      key={opt.value}
                      id={`${id}-option-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={cn(
                        "flex items-center justify-between gap-3",
                        "px-4 py-2.5 cursor-pointer text-sm transition-colors duration-100",
                        isHighlighted && !isSelected && "bg-forest/5 text-charcoal",
                        isSelected
                          ? "bg-forest/8 text-forest font-medium"
                          : "text-charcoal hover:bg-forest/4"
                      )}
                    >
                      {opt.label}
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-forest shrink-0" />
                      )}
                    </li>
                  );
                })
              )}
            </ul>

            {/* Footer hint */}
            <div className="px-3 py-1.5 border-t border-ivory-200">
              <p className="text-2xs text-charcoal-muted/50">
                Showing demonstration districts. Full list available when connected to backend.
              </p>
            </div>
          </div>
        )}
      </div>

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
