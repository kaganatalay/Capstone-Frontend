"use client";

import "./results-delight.css";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GiftCard } from "@/components/design/GiftCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowLeft } from "@/components/design/Icons";
import { AiChat } from "@/components/design/AiChat";
import type { GiftItem, RecommendationResult, WizardSubmission } from "@/types/recommendation";
import {
  loadSavedGifts,
  saveGift,
  unsaveGift,
  type SavedGift,
} from "@/lib/saved-gifts";

// ─── Gift Shower ──────────────────────────────────────────────────────────────
// Fires once when results first appear. Pure CSS-variable-driven trajectories.

const SHOWER_EMOJIS = ["🎁", "🎁", "🎁", "🎀", "✨", "💫", "🌟", "⭐"];

interface ShowerParticle {
  id: number;
  emoji: string;
  tx: string;
  ty: string;
  rot: string;
  sc: number;
  size: number;
  delay: number;
  duration: number;
}

function GiftShower() {
  const [particles, setParticles] = useState<ShowerParticle[]>([]);
  const [alive, setAlive] = useState(true);

  useEffect(() => {
    const ps: ShowerParticle[] = Array.from({ length: 26 }, (_, i) => {
      const angleDeg = (i / 26) * 360 + (Math.random() - 0.5) * 28;
      const angleRad = (angleDeg * Math.PI) / 180;
      const dist = 28 + Math.random() * 46;
      return {
        id: i,
        emoji: SHOWER_EMOJIS[Math.floor(Math.random() * SHOWER_EMOJIS.length)],
        tx: `${(Math.cos(angleRad) * dist).toFixed(1)}vw`,
        ty: `${(Math.sin(angleRad) * dist * 0.75).toFixed(1)}vh`,
        rot: `${Math.round((Math.random() - 0.5) * 600)}deg`,
        sc: 0.6 + Math.random() * 1.2,
        size: 18 + Math.random() * 22,
        delay: Math.round(Math.random() * 500),
        duration: 1400 + Math.round(Math.random() * 800),
      };
    });
    setParticles(ps);
    const t = setTimeout(() => setAlive(false), 3500);
    return () => clearTimeout(t);
  }, []);

  if (!alive) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="shower-particle"
          style={{
            fontSize: p.size,
            "--tx": p.tx,
            "--ty": p.ty,
            "--rot": p.rot,
            "--sc": p.sc,
            animationDuration: `${p.duration}ms`,
            animationDelay: `${p.delay}ms`,
          } as React.CSSProperties}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

const RECIPIENT_Q_ID = "kime_hediye_alıyorsun";
const OCCASION_Q_ID  = "bu_hediyeyi_hangi_özel_durum_için_alıyorsun";
const BUDGET_Q_ID    = "bütçe_aralığın_nedir";

function stripAlgorithm(s: string) {
  return s.replace(/\s*\(Algoritma[\s\S]*?\)/gi, "").trim();
}

// ─── Mini saved drawer ────────────────────────────────────────────────────────

function MiniSavedDrawer({
  entries,
  open,
  onClose,
  onRemove,
}: {
  entries: SavedGift[];
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-xl rounded-t-2xl backdrop-blur-xl transition-transform duration-350 ease-out"
        style={{
          background: "oklch(0.98 0.010 80 / 96%)",
          border: "1px solid oklch(0 0 0 / 8%)",
          borderBottom: "none",
          boxShadow: "0 -6px 24px oklch(0 0 0 / 0.10)",
          transform: open ? "translateY(0)" : "translateY(110%)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="h-1 w-10 rounded-full"
            style={{ background: "oklch(0 0 0 / 10%)" }}
          />
        </div>

        <div className="px-4 pb-2 pt-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "oklch(0.26 0.17 10)" }}>
            Kaydedilen Hediyeler
          </h2>
          <Link
            href="/saved"
            className="text-xs font-medium transition-colors hover:text-foreground inline-flex items-center gap-1"
            style={{ color: "oklch(0.50 0.03 40)" }}
          >
            Tümünü gör <ArrowRight size={12} />
          </Link>
        </div>

        {/* Scroll list */}
        <div className="overflow-x-auto pb-safe-area-inset-bottom">
          <div className="flex gap-3 px-4 pb-5 pt-2" style={{ width: "max-content" }}>
            {entries.length === 0 && (
              <p className="text-sm py-6 px-2" style={{ color: "oklch(0.55 0.03 40)" }}>
                Henüz kaydedilen hediye yok
              </p>
            )}
            {entries.map((entry) => (
              <MiniCard
                key={entry.gift.id}
                entry={entry}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function MiniCard({ entry, onRemove }: { entry: SavedGift; onRemove: (id: string) => void }) {
  const { gift } = entry;
  const [imgError, setImgError] = useState(false);
  const hasImage = !!gift.photoUrl && !imgError;

  return (
    <div
      className="group relative flex-shrink-0 overflow-hidden rounded-xl"
      style={{
        width: 120,
        background: "oklch(0.97 0.012 80)",
        border: "1px solid oklch(0 0 0 / 7%)",
      }}
    >
      {/* Image */}
      <div
        className="relative"
        style={{ height: 90, background: "oklch(0.93 0.020 80)" }}
      >
        {hasImage ? (
          <Image
            src={gift.photoUrl!}
            alt={gift.name}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            {gift.imageEmoji}
          </div>
        )}
        {/* Remove */}
        <button
          type="button"
          aria-label="Kaydedilenden çıkar"
          onClick={() => onRemove(gift.id)}
          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-150"
          style={{
            background: "oklch(0.96 0.018 80 / 85%)",
            border: "1px solid oklch(0 0 0 / 8%)",
            color: "oklch(0.45 0.18 22)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      {/* Info */}
      <div className="p-2">
        <p className="text-[10px] font-medium leading-tight line-clamp-2" style={{ color: "oklch(0.25 0.04 30)" }}>
          {gift.name}
        </p>
        <p className="mt-1 text-[11px] font-bold" style={{ color: "oklch(0.26 0.17 10)" }}>
          ₺{gift.price.toLocaleString("tr-TR")}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult]         = useState<RecommendationResult | null>(null);
  const [submission, setSubmission] = useState<WizardSubmission | null>(null);
  const [saved, setSaved]           = useState<SavedGift[]>([]);
  const [hydrated, setHydrated]     = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [toastMsg, setToastMsg]     = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showShower, setShowShower] = useState(false);

  useEffect(() => {
    const raw      = sessionStorage.getItem("gift_recommender_results");
    const rawInput = sessionStorage.getItem("gift_recommender_input");
    if (!raw) { router.replace("/"); return; }
    setResult(JSON.parse(raw));
    if (rawInput) setSubmission(JSON.parse(rawInput));
    setSaved(loadSavedGifts());
    setHydrated(true);
  }, [router]);

  // Fire the gift shower only once per session (survives back-navigation)
  useEffect(() => {
    if (hydrated && !sessionStorage.getItem("gift_shower_fired")) {
      const parsed: RecommendationResult | null = result;
      if (parsed && parsed.items && parsed.items.length > 0) {
        sessionStorage.setItem("gift_shower_fired", "1");
        setShowShower(true);
        setTimeout(() => setShowShower(false), 3600);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  }, []);

  const toggleSave = useCallback((item: GiftItem) => {
    const isSaved = saved.some((s) => s.gift.id === item.id);
    const answers = submission?.answers ?? {};
    const context = {
      recipient: answers[RECIPIENT_Q_ID] ? stripAlgorithm(answers[RECIPIENT_Q_ID] as string) : undefined,
      occasion:  answers[OCCASION_Q_ID]  ? stripAlgorithm(answers[OCCASION_Q_ID] as string)  : undefined,
      budget:    answers[BUDGET_Q_ID]    ? stripAlgorithm(answers[BUDGET_Q_ID] as string)    : undefined,
    };

    if (isSaved) {
      setSaved(unsaveGift(item.id));
      showToast("Kaydedilenlerden çıkarıldı");
    } else {
      setSaved(saveGift(item, context));
      showToast("Kaydedildi 🔖");
    }
  }, [saved, submission, showToast]);

  const handleDrawerRemove = useCallback((id: string) => {
    setSaved(unsaveGift(id));
  }, []);

  if (!hydrated) {
    return (
      <main className="min-h-dvh">
        <div className="mx-auto max-w-5xl px-4 pt-8 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56 rounded-xl" style={{ background: "oklch(0 0 0 / 6%)" }} />
            <Skeleton className="h-4 w-80 rounded-lg" style={{ background: "oklch(0 0 0 / 4%)" }} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" style={{ background: "oklch(0 0 0 / 5%)" }} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const items: GiftItem[] = result?.items ?? [];
  const answers = submission?.answers ?? {};

  const recipient   = answers[RECIPIENT_Q_ID] as string | undefined;
  const occasion    = answers[OCCASION_Q_ID]  as string | undefined;
  const budgetRaw   = answers[BUDGET_Q_ID]    as string | undefined;
  const budgetLabel = budgetRaw ? stripAlgorithm(budgetRaw) : undefined;

  const contextPills = [
    recipient ? stripAlgorithm(recipient) : null,
    occasion  ? stripAlgorithm(occasion)  : null,
    budgetLabel,
  ].filter(Boolean) as string[];

  const savedIds = new Set(saved.map((s) => s.gift.id));

  return (
    <main className="min-h-dvh bg-background">
      {/* Gift shower — fires once when results appear */}
      {showShower && <GiftShower />}

      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.75 0.06 10 / 0.15), transparent 60%)",
        }}
      />

      {/* ── Sticky header ──────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 backdrop-blur-xl"
        style={{
          background: "oklch(0.92 0.025 80 / 0.96)",
          borderBottom: "1px solid oklch(0 0 0 / 12%)",
        }}
      >
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <h1
              className="text-xl font-bold"
              style={{ color: "oklch(0.26 0.17 10)" }}
            >
              Senin için en iyi hediyeler ✦
            </h1>
            {contextPills.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {contextPills.map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                    style={{
                      background: "oklch(0.26 0.17 10 / 0.10)",
                      border: "1px solid oklch(0.26 0.17 10 / 0.20)",
                      color: "oklch(0.26 0.17 10)",
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Saved badge — opens drawer */}
            {saved.length > 0 && (
              <button
                type="button"
                id="saved-drawer-btn"
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "oklch(0.26 0.17 10 / 0.10)",
                  border: "1px solid oklch(0.26 0.17 10 / 0.22)",
                  color: "oklch(0.26 0.17 10)",
                }}
              >
                🔖 {saved.length}
              </button>
            )}
            {/* View saved page link */}
            {saved.length > 0 && (
              <Link
                id="saved-page-link"
                href="/saved"
                className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105"
                style={{
                  background: "oklch(0.93 0.020 80)",
                  border: "1px solid oklch(0 0 0 / 8%)",
                  color: "oklch(0.40 0.04 40)",
                }}
              >
                Kaydettiklerim
              </Link>
            )}
            <Link
              id="results-start-over-btn"
              href="/wizard"
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "oklch(0.93 0.020 80)",
                border: "1px solid oklch(0 0 0 / 8%)",
                color: "oklch(0.40 0.04 40)",
              }}
            >
              Yeniden Başla
            </Link>
          </div>
        </div>
      </div>

      {/* ── Cards grid ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <span className="text-6xl">😕</span>
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-foreground">Hediye bulunamadı</p>
              <p className="text-sm text-muted-foreground">
                Bütçeni veya ilgi alanlarını değiştirerek tekrar dene.
              </p>
            </div>
            <Link
              href="/wizard"
              className="mt-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, oklch(0.32 0.17 10), oklch(0.26 0.17 10))",
                color: "oklch(0.97 0.01 80)",
              }}
            >
              Tekrar Dene
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-muted-foreground">
              {items.length} kişiselleştirilmiş öneri
            </p>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {items.map((item, i) => {
                const delay = Math.min(i * 55, 330);
                const isTop = i === 0;
                return (
                  <div
                    key={item.id}
                    className={`results-card-enter${isTop ? " results-card-top" : ""}`}
                    style={{ animationDelay: `${delay}ms` }}
                  >
                    <GiftCard
                      item={item}
                      rank={i + 1}
                      onSave={() => toggleSave(item)}
                      saved={savedIds.has(item.id)}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Mini saved drawer ───────────────────────────────────────── */}
      <MiniSavedDrawer
        entries={saved}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRemove={handleDrawerRemove}
      />

      {/* ── AI chat ─────────────────────────────────────────────────── */}
      <AiChat items={items} submission={submission} />

      {/* ── Save toast ──────────────────────────────────────────────── */}
      {savedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full px-5 py-2.5 animate-fade-up whitespace-nowrap z-50"
          style={{
            background: "oklch(0.93 0.020 80)",
            border: "1px solid oklch(0 0 0 / 10%)",
            boxShadow: "0 8px 24px oklch(0 0 0 / 0.06)",
            color: "oklch(0.25 0.04 30)",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {toastMsg}
        </div>
      )}
    </main>
  );
}
