"use client";

import { cn } from "@/lib/utils";

interface ChipOption {
  id: string;
  label: string;
  emoji?: string;
}

interface ChipSelectProps {
  options: ChipOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
  className?: string;
}

export function ChipSelect({
  options,
  selected,
  onChange,
  max,
  className,
}: ChipSelectProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      if (max !== undefined && selected.length >= max) return;
      onChange([...selected, id]);
    }
  }

  return (
    <div
      role="group"
      aria-label="İlgi alanlarını seç"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        const isDisabled = !isSelected && max !== undefined && selected.length >= max;

        return (
          <button
            key={opt.id}
            id={`chip-${opt.id}`}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            disabled={isDisabled}
            onClick={() => toggle(opt.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(opt.id); }
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-2",
              "text-sm font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "active:scale-95",
              isDisabled && "opacity-30 cursor-not-allowed"
            )}
            style={
              isSelected
                ? {
                    background: "oklch(0.26 0.065 75 / 0.45)",
                    border: "1.5px solid oklch(0.78 0.14 75 / 0.55)",
                    color: "oklch(0.94 0.012 65)",
                  }
                : {
                    background: "oklch(0.2 0.04 310 / 55%)",
                    border: "1px solid oklch(1 0 0 / 7%)",
                    color: "oklch(0.68 0.018 65)",
                  }
            }
          >
            {opt.emoji && (
              <span
                aria-hidden="true"
                className={cn("transition-transform duration-150", isSelected && "scale-110")}
              >
                {opt.emoji}
              </span>
            )}
            {opt.label}
            {isSelected && (
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full"
                style={{ background: "oklch(0.78 0.14 75)", color: "#1a0f2e" }}
                aria-hidden="true"
              >
                <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                  <path d="M1 3.5l1.8 1.8L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
