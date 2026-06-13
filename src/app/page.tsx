import Link from "next/link";
import type { Metadata } from "next";
import { AnimatedGiftBox } from "@/components/design/AnimatedGiftBox";
import { SavedBadge } from "@/components/design/SavedBadge";
import { ArrowRight } from "@/components/design/Icons";

export const metadata: Metadata = {
  title: "Gifty — Mükemmel Hediyeyi Bul",
  description:
    "14 kısa soruyu yanıtla, yapay zeka sevdiklerine özel hediyeler önersin.",
};

const FEATURES = [
  { icon: "⚡", label: "60 saniyede tamamlanır" },
  { icon: "🎯", label: "Kişiye özel öneriler" },
  { icon: "🤖", label: "Yapay zeka destekli" },
] as const;

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-16">
      {/* ── Multi-layer ambient background ───────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Top crown glow */}
        <div
          className="absolute -top-40 left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.30 0.08 310 / 0.7) 0%, transparent 65%)",
          }}
        />
        {/* Bottom-right warm gold accent */}
        <div
          className="absolute -bottom-32 -right-32 h-[460px] w-[460px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.48 0.13 75 / 0.22) 0%, transparent 65%)",
          }}
        />
        {/* Bottom-left rose accent */}
        <div
          className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.42 0.12 340 / 0.18) 0%, transparent 65%)",
          }}
        />
        {/* Subtle center shimmer strip */}
        <div
          className="absolute left-1/2 top-1/2 h-px w-[380px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.78 0.14 75 / 0.18), transparent)",
          }}
        />
      </div>

      {/* ── Brand wordmark ────────────────────────────────────── */}
      <div
        className="absolute top-6 left-1/2 -translate-x-1/2 animate-fade-in"
        style={{ animationDelay: "0ms" }}
      >
        <span
          className="font-display text-sm font-semibold tracking-widest uppercase"
          style={{ color: "oklch(0.78 0.14 75 / 0.6)", letterSpacing: "0.22em" }}
        >
          Gifty
        </span>
      </div>

      {/* Saved gifts badge (top right — shows when gifts are saved) */}
      <SavedBadge />

      {/* ── Main card ─────────────────────────────────────────── */}
      <div
        className="relative flex w-full max-w-sm flex-col items-center gap-10 text-center"
      >
        {/* Animated gift logo */}
        <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
          <AnimatedGiftBox size={148} />
        </div>

        {/* Headline block */}
        <div
          className="space-y-4 animate-fade-up"
          style={{ animationDelay: "140ms" }}
        >
          <h1
            className="font-display text-[2.6rem] font-bold leading-[1.1] tracking-[-0.02em]"
            style={{
              color: "oklch(0.82 0.14 75)",
              textWrap: "balance",
            }}
          >
            Mükemmel{" "}
            <em style={{ fontStyle: "italic" }}>Hediyeyi</em>{" "}
            Bul
          </h1>
          <p
            className="text-base leading-relaxed max-w-[28ch] mx-auto"
            style={{ color: "oklch(0.70 0.025 60)" }}
          >
            14 kısa soruyu yanıtla,{" "}
            <span style={{ color: "oklch(0.92 0.01 65)", fontWeight: 500 }}>
              yapay zekâ
            </span>{" "}
            sevdiklerine özel hediyeleri bulsun.
          </p>
        </div>

        {/* CTA block */}
        <div
          className="w-full space-y-4 animate-fade-up"
          style={{ animationDelay: "220ms" }}
        >
          <Link
            id="start-recommendation-btn"
            href="/wizard"
            className="group relative block w-full overflow-hidden rounded-2xl px-6 py-4 text-center text-base font-semibold transition-all duration-300 active:scale-[0.97]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.84 0.14 78), oklch(0.70 0.18 65))",
              color: "#1a0f2e",
              boxShadow:
                "0 4px 24px oklch(0.78 0.14 75 / 0.35), inset 0 1px 0 oklch(1 0 0 / 0.18)",
            }}
          >
            {/* Shimmer sweep on hover */}
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full transition-transform duration-500 group-hover:translate-x-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.25), transparent)",
              }}
            />
            <span className="relative flex items-center justify-center gap-2">Hediye Bul <ArrowRight size={15} /></span>
          </Link>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {FEATURES.map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  background: "oklch(0.20 0.04 310 / 60%)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                  color: "oklch(0.65 0.022 60)",
                }}
              >
                <span aria-hidden="true">{icon}</span>
                {label}
              </span>
            ))}
          </div>

          <p
            className="text-xs"
            style={{ color: "oklch(0.44 0.015 260)" }}
          >
            Hesap gerekmez · Verileriniz saklanmaz
          </p>
        </div>
      </div>

      {/* ── Decorative floating dots ──────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute animate-float"
          style={{
            top: "18%",
            left: "8%",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "oklch(0.78 0.14 75 / 0.4)",
            animationDelay: "0s",
            animationDuration: "4s",
          }}
        />
        <div
          className="absolute animate-float"
          style={{
            top: "28%",
            right: "10%",
            width: 3.5,
            height: 3.5,
            borderRadius: "50%",
            background: "oklch(0.78 0.14 75 / 0.3)",
            animationDelay: "0.8s",
            animationDuration: "5s",
          }}
        />
        <div
          className="absolute animate-float"
          style={{
            bottom: "22%",
            left: "14%",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "oklch(0.65 0.12 340 / 0.35)",
            animationDelay: "1.4s",
            animationDuration: "4.5s",
          }}
        />
        <div
          className="absolute animate-float"
          style={{
            bottom: "30%",
            right: "8%",
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "oklch(0.78 0.14 75 / 0.25)",
            animationDelay: "2s",
            animationDuration: "6s",
          }}
        />
      </div>
    </main>
  );
}
