"use client";

import "./results-delight.css";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GiftCard } from "@/components/design/GiftCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { GiftItem, RecommendationResult, WizardSubmission } from "@/types/recommendation";

const RECIPIENT_Q_ID = "kime_hediye_alıyorsun";
const OCCASION_Q_ID  = "bu_hediyeyi_hangi_özel_durum_için_alıyorsun";
const BUDGET_Q_ID    = "bütçe_aralığın_nedir";
const SAVED_KEY      = "gift_recommender_saved";

function stripAlgorithm(s: string) {
  return s.replace(/\s*\(Algoritma[\s\S]*?\)/gi, "").trim();
}

function loadSaved(): Set<string> {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function persistSaved(ids: Set<string>) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify([...ids])); } catch { /* noop */ }
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult]         = useState<RecommendationResult | null>(null);
  const [submission, setSubmission] = useState<WizardSubmission | null>(null);
  const [savedIds, setSavedIds]     = useState<Set<string>>(new Set());
  const [hydrated, setHydrated]     = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    const raw      = sessionStorage.getItem("gift_recommender_results");
    const rawInput = sessionStorage.getItem("gift_recommender_input");
    if (!raw) { router.replace("/"); return; }
    setResult(JSON.parse(raw));
    if (rawInput) setSubmission(JSON.parse(rawInput));
    setSavedIds(loadSaved());
    setHydrated(true);
  }, [router]);

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      persistSaved(next);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
      return next;
    });
  }

  if (!hydrated) {
    return (
      <main className="min-h-dvh">
        <div className="mx-auto max-w-5xl px-4 pt-8 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56 rounded-xl" style={{ background: "oklch(1 0 0 / 6%)" }} />
            <Skeleton className="h-4 w-80 rounded-lg" style={{ background: "oklch(1 0 0 / 4%)" }} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" style={{ background: "oklch(1 0 0 / 5%)" }} />
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

  return (
    <main className="min-h-dvh bg-background">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.25 0.07 310 / 0.5), transparent 60%)",
        }}
      />

      {/* ── Sticky header ──────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 backdrop-blur-xl"
        style={{
          background: "oklch(0.14 0.035 310 / 0.88)",
          borderBottom: "1px solid oklch(1 0 0 / 8%)",
        }}
      >
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <h1
              className="text-xl font-bold"
              style={{ color: "oklch(0.82 0.14 75)" }}
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
                      background: "oklch(0.78 0.14 75 / 0.12)",
                      border: "1px solid oklch(0.78 0.14 75 / 0.2)",
                      color: "oklch(0.78 0.14 75)",
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {savedIds.size > 0 && (
              <span
                className="hidden sm:flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: "oklch(0.78 0.14 75 / 0.1)",
                  border: "1px solid oklch(0.78 0.14 75 / 0.2)",
                  color: "oklch(0.78 0.14 75)",
                }}
              >
                🔖 {savedIds.size} kaydedildi
              </span>
            )}
            <Link
              id="results-start-over-btn"
              href="/wizard"
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "oklch(0.22 0.04 310)",
                border: "1px solid oklch(1 0 0 / 10%)",
                color: "oklch(0.8 0.015 65)",
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
                background: "linear-gradient(135deg, oklch(0.82 0.14 75), oklch(0.68 0.18 65))",
                color: "#1a0f2e",
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
                // Stagger: 0ms for first, then 55ms steps, capping at ~330ms
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
                      onSave={toggleSave}
                      saved={savedIds.has(item.id)}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Save toast */}
      {savedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full px-5 py-2.5 animate-fade-up whitespace-nowrap"
          style={{
            background: "oklch(0.22 0.05 310)",
            border: "1px solid oklch(1 0 0 / 12%)",
            boxShadow: "0 8px 24px oklch(0 0 0 / 0.3)",
            color: "oklch(0.9 0.015 65)",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          Tarayıcıya kaydedildi 🔖
        </div>
      )}
    </main>
  );
}
