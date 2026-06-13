"use client";

import { cn } from "@/lib/utils";

type Direction = "forward" | "back" | "none";

interface AnimatedContainerProps {
  children: React.ReactNode;
  direction?: Direction;
  className?: string;
  /** @deprecated pass `key={animationKey}` on the element instead — React remount triggers the CSS animation */
  animationKey?: string | number;
}

/**
 * AnimatedContainer — remount-based step transitions.
 *
 * Use with `key={step}` on the element; React remounts the component on each
 * key change, which re-runs the CSS entrance animation. No JS timers, no dead
 * zones — the new content appears in a single 220ms slide+fade.
 */
export function AnimatedContainer({
  children,
  direction = "forward",
  className,
}: AnimatedContainerProps) {
  const enterClass =
    direction === "back" ? "step-enter-back" : "step-enter-forward";

  return (
    <div className={cn(enterClass, className)}>
      {children}
    </div>
  );
}
