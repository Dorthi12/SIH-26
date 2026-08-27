/**
 * AssistantInput.tsx
 *
 * Polished multi-line text input + send button for the assistant chat.
 * - Enter sends; Shift+Enter inserts a newline.
 * - Disabled when empty or while a message is pending.
 * - Smooth focus ring using the existing design system.
 */

import { useRef, useEffect } from "react";
import { SendHorizonal } from "lucide-react";
import { cn } from "../../utils/cn";

interface AssistantInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AssistantInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Ask AgriSense anything about your farm…",
}: AssistantInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="relative flex items-end gap-2 rounded-2xl border border-ivory-300 bg-white shadow-card px-4 py-3 transition-all duration-150 focus-within:border-forest/30 focus-within:shadow-card-hover">
      <textarea
        ref={textareaRef}
        id="assistant-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder={placeholder}
        aria-label="Type your question"
        className={cn(
          "flex-1 resize-none bg-transparent text-sm text-charcoal placeholder:text-charcoal-muted/50 leading-relaxed",
          "focus:outline-none min-h-[24px] max-h-[140px] py-0.5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      <button
        type="button"
        onClick={onSend}
        disabled={!canSend}
        aria-label="Send message"
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-1",
          canSend
            ? "bg-forest text-white shadow-sm hover:bg-forest-600 active:scale-95"
            : "bg-ivory-200 text-charcoal-muted/40 cursor-not-allowed"
        )}
      >
        <SendHorizonal className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}
