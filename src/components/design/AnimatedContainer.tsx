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
 * Uses spring-physics-style entrance animations: the question slides in from
 * depth (slight scale + blur → natural → overshoot spring back).
 * Triggered by React remount via `key={step}`.
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
