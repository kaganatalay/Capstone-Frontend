"use client";

import { cn } from "@/lib/utils";

/** Soft single-wave ripple for chip toggles — subtler than the radio ripple. */
function fireChipRipple(x: number, y: number, adding: boolean) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxR = Math.max(
    Math.hypot(x, y), Math.hypot(x - vw, y),
    Math.hypot(x, y - vh), Math.hypot(x - vw, y - vh),
  );

  const el = document.createElement("div");
  // Adding = warm gold; removing = cool silver
  const color = adding
    ? "oklch(0.38 0.14 10 / 0.12)"
    : "oklch(0.38 0.09 145 / 0.08)";
  el.style.cssText = `
    position:fixed;inset:0;pointer-events:none;z-index:9999;
    background:${color};
    clip-path:circle(0px at ${x}px ${y}px);
    will-change:clip-path,opacity;
  `;
  document.body.appendChild(el);
  const anim = el.animate(
    [
      { clipPath: `circle(0px at ${x}px ${y}px)`, opacity: 1 },
      { clipPath: `circle(${maxR * 0.70}px at ${x}px ${y}px)`, opacity: 0 },
    ],
    { duration: 1100, easing: "cubic-bezier(0.14, 1, 0.22, 1)", fill: "forwards" },
  );
  anim.onfinish = () => el.remove();
}

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
            onClick={(e) => {
              fireChipRipple(e.clientX, e.clientY, !isSelected);
              toggle(opt.id);
            }}
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
                    background: "oklch(0.38 0.14 10 / 0.10)",
                    border: "1.5px solid oklch(0.38 0.14 10 / 0.50)",
                    color: "oklch(0.22 0.04 30)",
                  }
                : {
                    background: "oklch(0.94 0.022 80)",
                    border: "1px solid oklch(0 0 0 / 8%)",
                    color: "oklch(0.45 0.04 40)",
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
                style={{ background: "oklch(0.38 0.14 10)", color: "oklch(0.97 0.01 80)" }}
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
