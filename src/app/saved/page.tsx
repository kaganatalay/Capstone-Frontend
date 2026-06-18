"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  loadSavedGifts,
  unsaveGift,
  clearAllSaved,
  type SavedGift,
} from "@/lib/saved-gifts";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── SavedCard ────────────────────────────────────────────────────────────────

function SavedCard({
  entry,
  onRemove,
  style,
}: {
  entry: SavedGift;
  onRemove: (id: string) => void;
  style?: React.CSSProperties;
}) {
  const { gift, savedAt, context } = entry;
  const [imgError, setImgError] = useState(false);
  const hasImage = !!gift.photoUrl && !imgError;

  return (
    <article
      className="saved-card group relative flex flex-col overflow-hidden rounded-2xl"
      style={{
        background: "rgba(255,253,243,0.92)",
        border: "1px solid oklch(0 0 0 / 7%)",
        boxShadow: "0 4px 20px oklch(0 0 0 / 0.06), 0 1px 0 oklch(1 0 0 / 0.5) inset",
        ...style,
      }}
    >
      {/* Product image area */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: 180,
          background: "#F0EDD8",
          borderBottom: "1px solid oklch(0 0 0 / 6%)",
        }}
      >
        {hasImage ? (
          <Image
            src={gift.photoUrl!}
            alt={gift.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl transition-transform duration-300 group-hover:scale-110">
            {gift.imageEmoji}
          </div>
        )}

        {/* Remove button */}
        <button
          type="button"
          aria-label="Kaydedilenden çıkar"
          onClick={() => onRemove(gift.id)}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-90 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            background: "rgba(252,249,234,0.82)",
            backdropFilter: "blur(8px)",
            border: "1px solid oklch(0 0 0 / 8%)",
            color: "oklch(0.45 0.18 22)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Saved date tag */}
        <div
          className="absolute left-2 bottom-2 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: "rgba(252,249,234,0.75)",
            backdropFilter: "blur(8px)",
            border: "1px solid oklch(0 0 0 / 7%)",
            color: "oklch(0.55 0.03 40)",
          }}
        >
          🔖 {formatDate(savedAt)}
        </div>
      </div>

      {/* Text content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Name + brand */}
        <div>
          <h2
            className="text-sm font-semibold leading-snug line-clamp-2"
            style={{ color: "oklch(0.22 0.04 30)" }}
          >
            {gift.name}
          </h2>
          {(gift.brand || gift.category) && (
            <p className="mt-0.5 text-[11px] line-clamp-1" style={{ color: "oklch(0.55 0.03 40)" }}>
              {[gift.brand, gift.category?.split(">").pop()?.trim()]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>

        {/* Context pills */}
        {context && (
          <div className="flex flex-wrap gap-1">
            {context.recipient && (
              <span className="saved-pill">{context.recipient}</span>
            )}
            {context.occasion && (
              <span className="saved-pill">{context.occasion}</span>
            )}
            {context.budget && (
              <span className="saved-pill">{context.budget}</span>
            )}
          </div>
        )}

        {/* Reason snippet */}
        {gift.reason && (
          <p className="text-[11px] leading-snug line-clamp-2" style={{ color: "oklch(0.50 0.03 40)" }}>
            ✦ {gift.reason.split(" · ")[0]}
          </p>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-base font-bold" style={{ color: "#FFBDBD" }}>
            ₺{gift.price.toLocaleString("tr-TR")}
          </span>
          <a
            href={gift.productUrl ?? gift.affiliateUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="saved-buy-btn"
            onClick={(e) => { if (!(gift.productUrl ?? gift.affiliateUrl)) e.preventDefault(); }}
          >
            Trendyol&apos;da Gör
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 8L8 2M8 2H3M8 2v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-3xl text-5xl animate-float"
        style={{
          background: "#F0EDD8",
          border: "1px solid oklch(0 0 0 / 7%)",
        }}
      >
        🔖
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold" style={{ color: "oklch(0.22 0.04 30)" }}>
          Henüz kaydedilen hediye yok
        </h2>
        <p className="text-sm max-w-[28ch] mx-auto" style={{ color: "oklch(0.50 0.03 40)" }}>
          Öneriler sayfasında beğendiğin hediyeleri kaydet, burada toplu görebilirsin.
        </p>
      </div>
      <Link
        href="/wizard"
        className="mt-2 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: "#FFA4A4",
          color: "#2D2D2D",
          boxShadow: "0 4px 16px rgba(255,164,164,0.20)",
        }}
      >
        Hediye Ara
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SavedPage() {
  const [saved, setSaved] = useState<SavedGift[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [removedId, setRemovedId] = useState<string | null>(null);

  useEffect(() => {
    setSaved(loadSavedGifts());
    setHydrated(true);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setRemovedId(id);
    setTimeout(() => {
      setSaved(unsaveGift(id));
      setRemovedId(null);
    }, 260);
  }, []);

  const handleClearAll = useCallback(() => {
    if (!confirmClear) { setConfirmClear(true); return; }
    clearAllSaved();
    setSaved([]);
    setConfirmClear(false);
  }, [confirmClear]);

  if (!hydrated) {
    return (
      <main className="min-h-dvh">
        <div className="mx-auto max-w-5xl px-4 pt-8">
          <div className="h-8 w-48 rounded-xl animate-pulse" style={{ background: "oklch(0 0 0 / 6%)" }} />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: "oklch(0 0 0 / 5%)" }} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(186,223,219,0.08), transparent 55%)",
        }}
      />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 backdrop-blur-xl"
        style={{
          background: "rgba(252,249,234,0.96)",
          borderBottom: "1px solid oklch(0 0 0 / 12%)",
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/results"
              aria-label="Geri dön"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-150 hover:bg-black/5 active:scale-90"
              style={{ color: "oklch(0.50 0.03 40)" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold" style={{ color: "#FFBDBD" }}>
                Kaydedilen Hediyeler
              </h1>
              {saved.length > 0 && (
                <p className="text-xs" style={{ color: "oklch(0.55 0.03 40)" }}>
                  {saved.length} hediye kaydedildi
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saved.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                onBlur={() => setConfirmClear(false)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                style={
                  confirmClear
                    ? {
                        background: "oklch(0.65 0.22 22 / 0.15)",
                        border: "1px solid oklch(0.65 0.22 22 / 0.4)",
                        color: "oklch(0.72 0.18 22)",
                      }
                    : {
                        background: "#F0EDD8",
                        border: "1px solid oklch(0 0 0 / 8%)",
                        color: "oklch(0.50 0.03 40)",
                      }
                }
              >
                {confirmClear ? "Emin misin? Hepsini sil" : "Tümünü temizle"}
              </button>
            )}
            <Link
              href="/wizard"
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "#FFA4A4",
                color: "#2D2D2D",
              }}
            >
              Yeni Arama
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        {saved.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((entry, i) => (
              <div
                key={entry.gift.id}
                className="transition-all duration-260"
                style={{
                  opacity: removedId === entry.gift.id ? 0 : 1,
                  transform: removedId === entry.gift.id ? "scale(0.94)" : "scale(1)",
                }}
              >
                <SavedCard
                  entry={entry}
                  onRemove={handleRemove}
                  style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
