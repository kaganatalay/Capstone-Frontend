"use client";

export const dynamic = "force-dynamic";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Body, Caption } from "@/components/design/Typography";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight } from "@/components/design/Icons";
import type { GiftItem, RecommendationResult } from "@/types/recommendation";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params: rawParams }: Props) {
  const { id } = use(rawParams);
  const router = useRouter();
  const [item, setItem] = useState<GiftItem | null>(null);
  const [rank, setRank] = useState<number>(1);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("gift_recommender_results");
    if (!raw) { router.replace("/results"); return; }
    const result: RecommendationResult = JSON.parse(raw);
    const idx = result.items.findIndex((i) => i.id === id);
    if (idx === -1) { router.replace("/results"); return; }
    setItem(result.items[idx]);
    setRank(idx + 1);
  }, [id, router]);

  if (!item) {
    return (
      <main className="min-h-dvh bg-background">
        <div className="mx-auto max-w-5xl px-4 py-6 lg:flex lg:gap-8">
          <Skeleton className="h-80 w-full rounded-2xl lg:w-1/2" />
          <div className="mt-5 space-y-3 lg:mt-0 lg:flex-1">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-7 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  const hasImage = !!item.photoUrl && !imgError;

  return (
    <main className="min-h-dvh bg-background">
      {/* ── Top nav bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link
            id="product-detail-back-btn"
            href="/results"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted"
            aria-label="Sonuçlara dön"
          >
            <ArrowLeft size={16} />
          </Link>
          <span className="text-sm font-medium text-muted-foreground">
            Öneri #{rank}
          </span>
          {item.score > 0 && (
            <span className="ml-auto rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
              %{Math.min(item.score, 99)} eşleşme
            </span>
          )}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="lg:flex lg:gap-10 lg:items-start">

          {/* ── LEFT: Product image ─────────────────────────────────── */}
          <div className="lg:w-[45%] lg:sticky lg:top-20">
            <div
              className="relative overflow-hidden rounded-2xl border border-border bg-muted"
              style={{ aspectRatio: "1 / 1" }}
            >
              {hasImage ? (
                <Image
                  src={item.photoUrl!}
                  alt={item.name}
                  fill
                  className="object-contain p-4"
                  onError={() => setImgError(true)}
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-8xl">
                  {item.imageEmoji}
                </div>
              )}
            </div>

            {/* Category breadcrumb — desktop only under image */}
            {item.category && (
              <div className="mt-3 hidden flex-wrap items-center gap-1.5 lg:flex">
                {item.category.split(">").map((seg, i, arr) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        i === arr.length - 1
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {seg.trim()}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="text-muted-foreground text-xs">›</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product info ─────────────────────────────────── */}
          <div className="mt-6 flex flex-col gap-5 lg:mt-0 lg:flex-1">

            {/* Name */}
            <div>
              <h1 className="text-2xl font-bold text-foreground leading-snug lg:text-3xl">
                {item.name}
              </h1>

              {/* Price — directly under name, like every e-shop */}
              <p className="mt-2 text-2xl font-bold text-primary">
                ₺{item.price.toLocaleString("tr-TR")}
              </p>

              {/* Brand + category (mobile) */}
              {(item.brand || item.category) && (
                <Caption className="mt-1.5 block lg:hidden">
                  {[item.brand, item.category?.split(">").pop()?.trim()]
                    .filter(Boolean)
                    .join(" · ")}
                </Caption>
              )}

              {/* Brand only on desktop (category shown under image) */}
              {item.brand && (
                <Caption className="mt-1.5 hidden lg:block">{item.brand}</Caption>
              )}
            </div>

            {/* Category breadcrumb — mobile */}
            {item.category && (
              <div className="flex flex-wrap items-center gap-1.5 lg:hidden">
                {item.category.split(">").map((seg, i, arr) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        i === arr.length - 1
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {seg.trim()}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="text-muted-foreground text-xs">›</span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Rationale */}
            {item.reason && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Neden öneriliyor?
                </p>
                <div className="space-y-2">
                  {item.reason.split(" · ").map((part, i) => {
                    const words = part.split(" ");
                    const icon = words[0];
                    const text = words.slice(1).join(" ");
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 text-base leading-none">{icon}</span>
                        <Body size="sm" className="flex-1 leading-snug">{text || icon}</Body>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trendyol CTA */}
            {item.productUrl ? (
              <a
                id="product-trendyol-link"
                href={item.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f27a1a] px-6 py-4 text-base font-bold text-white shadow transition hover:opacity-90 active:scale-[0.98]"
              >
                <span>Trendyol'da İncele</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            ) : (
              <Link
                href="/results"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition hover:opacity-90"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Tüm Önerilere Dön
              </Link>
            )}

            {/* Back link */}
            <Link
              href="/results"
              className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Tüm önerilere dön
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
