"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { GiftItem } from "@/types/recommendation";

interface GiftCardProps {
  item: GiftItem;
  rank?: number;
  onSave?: (id: string) => void;
  saved?: boolean;
}

const RANK_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: {
    bg: "linear-gradient(135deg, oklch(0.82 0.14 75), oklch(0.68 0.18 65))",
    text: "#1a0f2e",
    label: "🥇",
  },
  2: {
    bg: "linear-gradient(135deg, oklch(0.75 0.04 260), oklch(0.6 0.06 260))",
    text: "#fff",
    label: "🥈",
  },
  3: {
    bg: "linear-gradient(135deg, oklch(0.68 0.1 50), oklch(0.55 0.12 45))",
    text: "#fff",
    label: "🥉",
  },
};

export function GiftCard({ item, rank, onSave, saved }: GiftCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasImage = !!item.photoUrl && !imgError;

  const rankStyle = rank && rank <= 3 ? RANK_COLORS[rank] : null;

  return (
    <Link
      id={`gift-card-${item.id}`}
      href={`/results/${item.id}`}
      className="group block overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
      style={{
        background: "oklch(0.18 0.04 310 / 85%)",
        boxShadow: "0 2px 12px oklch(0 0 0 / 0.3), 0 1px 0 oklch(1 0 0 / 0.05) inset",
      }}
    >
      <div className="flex gap-0">
        {/* Product image / emoji */}
        <div
          className="relative shrink-0"
          style={{
            width: 110,
            minHeight: 110,
            background: "oklch(0.15 0.03 310)",
            borderRight: "1px solid oklch(1 0 0 / 6%)",
          }}
        >
          {hasImage ? (
            <Image
              src={item.photoUrl!}
              alt={item.name}
              fill
              className="object-contain p-2.5 transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl transition-transform duration-300 group-hover:scale-110">
              {item.imageEmoji}
            </div>
          )}

          {/* Rank badge */}
          {rank && (
            <div
              className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
              style={
                rankStyle
                  ? { background: rankStyle.bg, color: rankStyle.text }
                  : {
                      background: "oklch(0.25 0.05 310)",
                      border: "1px solid oklch(1 0 0 / 15%)",
                      color: "oklch(0.7 0.02 65)",
                      fontSize: "9px",
                    }
              }
            >
              {rankStyle ? rankStyle.label : rank}
            </div>
          )}
        </div>

        {/* Text content */}
        <div className="flex flex-1 flex-col justify-between gap-1.5 p-3.5 min-w-0">
          <div>
            {/* Name */}
            <h2
              className="text-sm font-semibold leading-snug line-clamp-2 transition-colors duration-200"
              style={{ color: "oklch(0.95 0.01 65)" }}
            >
              {item.name}
            </h2>

            {/* Brand + category */}
            {(item.brand || item.category) && (
              <p className="mt-1 text-xs line-clamp-1" style={{ color: "oklch(0.55 0.02 65)" }}>
                {[item.brand, item.category?.split(">").pop()?.trim()]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          {/* Reason snippet */}
          {(() => {
            const parts = (item.reason ?? "").split(" · ");
            const specific = parts.find(
              (p) => !p.toLowerCase().includes("yüksek eşleşme")
            );
            return specific ? (
              <p
                className="line-clamp-1 text-xs leading-snug"
                style={{ color: "oklch(0.6 0.025 60)" }}
              >
                ✦ {specific}
              </p>
            ) : null;
          })()}

          {/* Price row */}
          <div className="mt-1 flex items-center justify-between">
            <span
              className="text-base font-bold"
              style={{ color: "oklch(0.82 0.14 75)" }}
            >
              ₺{item.price.toLocaleString("tr-TR")}
            </span>

            <div className="flex items-center gap-2">
              {/* Save button */}
              {onSave && (
                <button
                  type="button"
                  id={`save-gift-${item.id}`}
                  aria-label={saved ? "Kaydedilenlerden çıkar" : "Kaydet"}
                  onClick={(e) => {
                    e.preventDefault();
                    onSave(item.id);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 active:scale-90 hover:scale-110"
                  style={{
                    background: saved
                      ? "oklch(0.78 0.14 75 / 0.2)"
                      : "oklch(1 0 0 / 5%)",
                    border: saved
                      ? "1px solid oklch(0.78 0.14 75 / 0.4)"
                      : "1px solid oklch(1 0 0 / 10%)",
                  }}
                >
                  <span className="text-sm">{saved ? "🔖" : "☆"}</span>
                </button>
              )}

              {/* Arrow */}
              <span
                className="text-xs transition-all duration-200 group-hover:translate-x-0.5"
                style={{ color: "oklch(0.55 0.02 65)" }}
              >
                →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
