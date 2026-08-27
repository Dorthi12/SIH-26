import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";

interface AnalysisMessageProps {
  messages: string[];
  currentIndex: number;
  className?: string;
}

export function AnalysisMessage({ messages, currentIndex, className }: AnalysisMessageProps) {
  const [displayed, setDisplayed] = useState(messages[currentIndex] ?? "");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fade out → swap text → fade in
    setVisible(false);
    const t1 = setTimeout(() => {
      setDisplayed(messages[currentIndex] ?? "");
      setVisible(true);
    }, 220);
    return () => clearTimeout(t1);
  }, [currentIndex, messages]);

  return (
    <p
      className={cn(
        "text-sm text-charcoal-muted text-center transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {displayed}
    </p>
  );
}
