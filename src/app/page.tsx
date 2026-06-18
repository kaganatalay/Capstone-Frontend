import Link from "next/link";
import Image from "next/image";
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
      {/* ── Ambient background ────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        {/* Bottom-right green accent */}
        <div
          className="absolute -bottom-32 -right-32 h-[460px] w-[460px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(186,223,219,0.18) 0%, transparent 65%)",
          }}
        />
      </div>

      {/* ── Brand wordmark ────────────────────────────────────── */}
      <div
        className="absolute top-6 left-1/2 -translate-x-1/2 animate-fade-in"
        style={{ animationDelay: "0ms" }}
      >
        <Image
          src="/logo.png"
          alt="Gifty"
          width={160}
          height={32}
          style={{ mixBlendMode: "multiply" }}
          priority
        />
      </div>

      {/* Saved gifts badge (top right — shows when gifts are saved) */}
      <SavedBadge />

      {/* ── Main card ─────────────────────────────────────────── */}
      <div className="relative flex w-full max-w-sm flex-col items-center gap-10 text-center">
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
              color: "#FFBDBD",
              textWrap: "balance",
            }}
          >
            Mükemmel <em style={{ fontStyle: "italic" }}>Hediyeyi</em> Bul
          </h1>
          <p
            className="text-base leading-relaxed max-w-[28ch] mx-auto"
            style={{ color: "oklch(0.40 0.05 30)" }}
          >
            14 kısa soruyu yanıtla,{" "}
            <span style={{ color: "oklch(0.22 0.04 30)", fontWeight: 500 }}>
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
                "linear-gradient(160deg, #FFA4A4, #FF8E8E)",
              color: "#2D2D2D",
              boxShadow:
                "0 4px 32px rgba(255,164,164,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            {/* Shimmer sweep on hover */}
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full transition-transform duration-500 group-hover:translate-x-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.15), transparent)",
              }}
            />
            <span className="relative flex items-center justify-center gap-2">
              Hediye Bul <ArrowRight size={15} />
            </span>
          </Link>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {FEATURES.map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  background: "#F0EDD8",
                  border: "1px solid oklch(0 0 0 / 8%)",
                  color: "oklch(0.50 0.04 40)",
                }}
              >
                <span aria-hidden="true">{icon}</span>
                {label}
              </span>
            ))}
          </div>

          <p className="text-xs" style={{ color: "oklch(0.55 0.03 40)" }}>
            Hesap gerekmez · Verileriniz saklanmaz
          </p>
        </div>
      </div>

      {/* ── Decorative floating dots ──────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute animate-float"
          style={{
            top: "18%",
            left: "8%",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "rgba(255,189,189,0.50)",
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
            background: "rgba(186,223,219,0.38)",
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
            background: "rgba(186,223,219,0.40)",
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
            background: "rgba(255,189,189,0.28)",
            animationDelay: "2s",
            animationDuration: "6s",
          }}
        />
      </div>
    </main>
  );
}
