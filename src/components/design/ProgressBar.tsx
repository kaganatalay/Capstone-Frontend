"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressBar({ currentStep, totalSteps, className }: ProgressBarProps) {
  const pct = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay so the fill animates in visibly on mount
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Adım ${currentStep} / ${totalSteps}`}
      className={cn("progress-track relative h-1 w-full overflow-visible rounded-full", className)}
      style={{ background: "oklch(1 0 0 / 6%)" }}
    >
      {/* Fill */}
      <div
        className="progress-fill h-full rounded-full"
        style={{
          width: mounted ? `${pct}%` : "0%",
          background: "linear-gradient(90deg, #BADFDB, #8ECFC6)",
          transition: "width 550ms cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative",
        }}
      >
        {/* Glowing trailing edge */}
        <span
          aria-hidden="true"
          className="progress-glow-tip"
          style={{
            position: "absolute",
            right: -4,
            top: "50%",
            transform: "translateY(-50%)",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#BADFDB",
            boxShadow:
              "0 0 6px 3px rgba(186,223,219,0.5), 0 0 14px 6px rgba(186,223,219,0.25)",
            opacity: pct > 2 ? 1 : 0,
            transition: "opacity 300ms ease",
          }}
        />
      </div>

      {/* Tick marks */}
      {Array.from({ length: totalSteps - 1 }).map((_, i) => {
        const tickPct = ((i + 1) / totalSteps) * 100;
        const isPassed = pct >= tickPct;
        return (
          <span
            key={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: `${tickPct}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: isPassed
                ? "rgba(186,223,219,0.5)"
                : "oklch(0 0 0 / 12%)",
              transition: "background 400ms ease",
            }}
          />
        );
      })}
    </div>
  );
}
