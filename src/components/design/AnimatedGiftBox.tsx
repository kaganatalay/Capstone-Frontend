"use client";

import "./AnimatedGiftBox.css";

/**
 * AnimatedGiftBox
 *
 * SVG gift box that performs a load sequence:
 *   1. Box breathes with a slow gold glow pulse (idle state)
 *   2. On mount, lid lifts open (ribbon arcs up + separates)
 *   3. Inner golden shimmer bursts out
 *   4. Lid slowly descends back closed
 *
 * Pure CSS keyframes — no animation library needed.
 * Respects prefers-reduced-motion: static box with soft glow instead.
 */

export function AnimatedGiftBox({
  className = "",
  size = 96,
  variant = "idle",
}: {
  className?: string;
  size?: number;
  variant?: "idle" | "loading" | "blast";
}) {
  return (
    <div
      className={`animated-gift-root gift-variant-${variant} ${className}`}
      aria-hidden="true"
      role="img"
      style={{ width: size, height: size }}
    >
      {/* Ambient under-glow */}
      <div className="gift-glow" />

      {/* Blast-only overlays */}
      {variant === "blast" && (
        <>
          <div className="gift-flash" />
          <div className="gift-shockwave gift-shockwave-1" />
          <div className="gift-shockwave gift-shockwave-2" />
          <div className="gift-shockwave gift-shockwave-3" />
        </>
      )}

      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="gift-svg"
        aria-hidden="true"
        style={{ width: size, height: size, overflow: "visible" }}
      >
        <defs>
          {/* Inner shimmer gradient */}
          <radialGradient id="innerShimmer" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.55 0.14 10)" stopOpacity="1" />
            <stop offset="60%" stopColor="oklch(0.38 0.14 10)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="oklch(0.38 0.14 10)" stopOpacity="0" />
          </radialGradient>

          {/* Box body gradient — warm off-white/krem */}
          <linearGradient id="boxGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.94 0.022 80)" />
            <stop offset="100%" stopColor="oklch(0.88 0.030 80)" />
          </linearGradient>

          {/* Lid gradient — slightly lighter krem */}
          <linearGradient id="lidGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.97 0.018 80)" />
            <stop offset="100%" stopColor="oklch(0.91 0.025 80)" />
          </linearGradient>

          {/* Bordo ribbon */}
          <linearGradient id="ribbonGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.50 0.16 10)" />
            <stop offset="50%" stopColor="oklch(0.38 0.14 10)" />
            <stop offset="100%" stopColor="oklch(0.28 0.12 10)" />
          </linearGradient>

          <clipPath id="boxClip">
            <rect x="14" y="54" width="92" height="54" rx="4" />
          </clipPath>
        </defs>

        {/* ── Box body ─────────────────────────────────────── */}
        <rect
          x="14" y="54" width="92" height="54" rx="4"
          fill="url(#boxGrad)"
          stroke="oklch(0 0 0 / 8%)"
          strokeWidth="0.75"
        />

        {/* Vertical ribbon stripe on body */}
        <rect
          x="54" y="54" width="12" height="54"
          fill="url(#ribbonGrad)"
          opacity="0.9"
        />

        {/* Horizontal ribbon stripe on body */}
        <rect
          x="14" y="78" width="92" height="10"
          fill="url(#ribbonGrad)"
          opacity="0.9"
        />

        {/* ── Inner shimmer (revealed when lid opens) ───────── */}
        <g className="gift-shimmer" clipPath="url(#boxClip)">
          <ellipse
            cx="60" cy="54"
            rx="38" ry="28"
            fill="url(#innerShimmer)"
            opacity="0"
          />
        </g>

        {/* ── Lid group — lifts and closes ──────────────────── */}
        <g className="gift-lid">
          {/* Lid body */}
          <rect
            x="10" y="44" width="100" height="18" rx="4"
            fill="url(#lidGrad)"
            stroke="oklch(0 0 0 / 10%)"
            strokeWidth="0.75"
          />
          {/* Lid ribbon vertical */}
          <rect
            x="54" y="44" width="12" height="18"
            fill="url(#ribbonGrad)"
            opacity="0.9"
          />
        </g>

        {/* ── Bow group — lifts and separates ──────────────── */}
        <g className="gift-bow">
          {/* Left loop */}
          <path
            d="M60 44 C48 34, 32 32, 34 40 C36 46, 52 44, 60 44Z"
            fill="url(#ribbonGrad)"
            stroke="oklch(0.28 0.12 10)"
            strokeWidth="0.5"
          />
          {/* Right loop */}
          <path
            d="M60 44 C72 34, 88 32, 86 40 C84 46, 68 44, 60 44Z"
            fill="url(#ribbonGrad)"
            stroke="oklch(0.28 0.12 10)"
            strokeWidth="0.5"
          />
          {/* Knot */}
          <circle
            cx="60" cy="44" r="5"
            fill="oklch(0.48 0.15 10)"
            stroke="oklch(0.28 0.12 10)"
            strokeWidth="0.5"
          />
          {/* Left tail */}
          <path
            d="M57 49 C52 52, 46 55, 42 60"
            stroke="url(#ribbonGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Right tail */}
          <path
            d="M63 49 C68 52, 74 55, 78 60"
            stroke="url(#ribbonGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* ── Sparkle particles (burst on open) ─────────────── */}
        <g className="gift-particles">
          <circle cx="60" cy="40" r="2.2" fill="oklch(0.50 0.14 10)" className="particle p1" />
          <circle cx="42" cy="36" r="1.6" fill="oklch(0.38 0.14 10)" className="particle p2" />
          <circle cx="78" cy="36" r="1.6" fill="oklch(0.38 0.14 10)" className="particle p3" />
          <circle cx="34" cy="50" r="1.2" fill="oklch(0.38 0.09 145)" className="particle p4" />
          <circle cx="86" cy="50" r="1.2" fill="oklch(0.38 0.09 145)" className="particle p5" />
          <circle cx="52" cy="28" r="1.4" fill="oklch(0.45 0.12 10)" className="particle p6" />
          <circle cx="68" cy="28" r="1.4" fill="oklch(0.45 0.12 10)" className="particle p7" />
        </g>
      </svg>

    </div>
  );
}
