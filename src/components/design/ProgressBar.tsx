"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressBar({ currentStep, totalSteps, className }: ProgressBarProps) {
  const pct = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Adım ${currentStep} / ${totalSteps}`}
      className={cn("relative h-0.5 w-full overflow-hidden rounded-full", className)}
      style={{ background: "oklch(1 0 0 / 8%)" }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: "oklch(0.78 0.14 75)",
          transition: "width 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}
