"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchQuestions, getRecommendations, parseBudgetMax } from "@/lib/api";
import { StepQuestion } from "@/components/design/StepQuestion";
import { ProgressBar } from "@/components/design/ProgressBar";
import { AnimatedContainer } from "@/components/design/AnimatedContainer";
import { TypewriterText } from "@/components/design/TypewriterText";
import { ArrowRight } from "@/components/design/Icons";
import { AnimatedGiftBox } from "@/components/design/AnimatedGiftBox";
import type { Question, WizardAnswers, WizardSubmission } from "@/types/recommendation";

const BUDGET_Q_ID = "bütçe_aralığın_nedir";
const MULTI_Q_ID  = "temel_ilgi_alanları_neler";

/** Hint text below the question heading */
function stepHint(question: Question): string {
  if (question.id === MULTI_Q_ID) return "Birden fazla seçebilirsin";
  return "Bir seçenek seç";
}

function isValid(question: Question, value: string | string[] | undefined): boolean {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value.trim().length > 0;
}

// How long to wait after a single-select tap before auto-advancing (ms).
const AUTO_ADVANCE_DELAY = 180;

// Rotating loading messages specific to what the product actually does
const LOADING_MESSAGES = [
  "Kişilik analizi yapılıyor...",
  "Trendyol kataloğu taranıyor...",
  "Bütçeye göre filtreleniyor...",
  "En uygun hediyeler sıralanıyor...",
  "Son dokunuşlar yapılıyor...",
];

export default function WizardPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>({});
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const [submitting, setSubmitting] = useState(false);
  const [blasting, setBlasting]     = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Track the furthest step the user has reached — used to detect back-navigation
  const [maxStep, setMaxStep] = useState(0);

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingInterval  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchQuestions()
      .then((qs) => {
        if (qs.length === 0) throw new Error("Sorular yüklenemedi.");
        setQuestions(qs);
      })
      .catch((e) => setQuestionsError(e.message ?? "Bir hata oluştu."))
      .finally(() => setLoadingQuestions(false));
  }, []);

  // Cycle loading messages while submitting
  useEffect(() => {
    if (submitting) {
      loadingInterval.current = setInterval(() => {
        setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
      }, 1800);
    } else {
      if (loadingInterval.current) clearInterval(loadingInterval.current);
      setLoadingMsgIdx(0);
    }
    return () => { if (loadingInterval.current) clearInterval(loadingInterval.current); };
  }, [submitting]);

  // Cancel pending auto-advance when step changes
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, [step]);

  const currentQuestion = questions[step];
  const currentValue    = currentQuestion ? answers[currentQuestion.id] ?? "" : "";
  const stepValid       = currentQuestion ? isValid(currentQuestion, currentValue) : false;
  const isLastStep      = step === questions.length - 1;
  const isMulti         = currentQuestion?.id === MULTI_Q_ID;

  function setAnswer(value: string | string[]) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));

    // Auto-advance on single-select questions only
    if (!isMulti) {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = setTimeout(() => {
        const newIsLast = step === questions.length - 1;
        if (newIsLast) {
          submitWithAnswers({ ...answers, [currentQuestion.id]: value });
        } else {
          setDirection("forward");
          setStep((s) => {
            const next = s + 1;
            setMaxStep((m) => Math.max(m, next));
            return next;
          });
        }
      }, AUTO_ADVANCE_DELAY);
    }
  }

  function goBack() {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    if (step === 0) { router.push("/"); return; }
    setDirection("back");
    setStep((s) => s - 1);
  }

  const submitWithAnswers = useCallback(async (finalAnswers: WizardAnswers) => {
    setSubmitting(true);
    setError(null);
    try {
      const budgetAnswer = finalAnswers[BUDGET_Q_ID] as string | undefined;
      const budget = budgetAnswer ? parseBudgetMax(budgetAnswer) : undefined;
      const submission: WizardSubmission = { answers: finalAnswers, budget };
      sessionStorage.setItem("gift_recommender_input", JSON.stringify(submission));
      const result = await getRecommendations(submission);
      sessionStorage.setItem("gift_recommender_results", JSON.stringify(result));
      sessionStorage.removeItem("gift_shower_fired"); // reset so this new result set gets the shower
      // Trigger blast sequence, then navigate after animation completes
      setBlasting(true);
      await new Promise<void>((resolve) => setTimeout(resolve, 3450));
      router.push("/results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu. Lütfen tekrar deneyin.");
      setSubmitting(false);
      setBlasting(false);
    }
  }, [router]);

  const submit = useCallback(() => submitWithAnswers(answers), [answers, submitWithAnswers]);

  function goNext() {
    if (!stepValid) return;
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    if (isLastStep) { submit(); return; }
    setDirection("forward");
    setStep((s) => {
      const next = s + 1;
      setMaxStep((m) => Math.max(m, next));
      return next;
    });
  }

  // Keyboard shortcut: Enter advances (for power users)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.shiftKey && stepValid && !submitting) {
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepValid, submitting, step, isLastStep]);

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loadingQuestions) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5">
        <div className="flex flex-col items-center gap-5 text-center animate-fade-up">
          <AnimatedGiftBox size={108} variant="loading" />
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{
                  background: "oklch(0.38 0.14 10)",
                  animationDelay: `${i * 220}ms`,
                }}
              />
            ))}
          </div>
          <p className="text-sm" style={{ color: "oklch(0.58 0.02 60)" }}>
            Sorular yükleniyor...
          </p>
        </div>
      </main>
    );
  }

  if (questionsError) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-5 text-center">
        <span className="text-5xl">😕</span>
        <p className="text-sm" style={{ color: "oklch(0.50 0.03 40)" }}>{questionsError}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:brightness-105 active:scale-95"
          style={{
              background: "oklch(0.40 0.15 25)",
              color: "oklch(0.98 0.005 95)",
          }}
        >
          Tekrar dene
        </button>
      </main>
    );
  }

  // ─── Submitting ────────────────────────────────────────────────────────────

  if (submitting) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-5 overflow-hidden">
        {/* Ambient glow — intensifies during blast */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 transition-all duration-700"
          style={{
            background: blasting
              ? "radial-gradient(ellipse 80% 70% at 50% 50%, oklch(0.40 0.15 25 / 0.18), transparent 60%)"
              : "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.40 0.15 25 / 0.08), transparent 65%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-6 text-center animate-fade-up">
          {/* Gift box — shakes while loading, blasts when done */}
          <AnimatedGiftBox
            size={148}
            variant={blasting ? "blast" : "loading"}
          />

          {/* Copy swaps on blast */}
          <div
            className="transition-all duration-300"
            style={{ opacity: blasting ? 0 : 1, transform: blasting ? "translateY(8px)" : "translateY(0)" }}
          >
            <p className="text-xl font-semibold" style={{ color: "oklch(0.40 0.15 25)" }}>
              En iyi hediyeler aranıyor...
            </p>
            <p
              className="mt-2 text-sm transition-all duration-500"
              style={{ color: "oklch(0.50 0.03 40)" }}
            >
              {LOADING_MESSAGES[loadingMsgIdx]}
            </p>
          </div>

          {/* Blast reveal text — appears at zoom peak */}
          {blasting && (
            <p
              className="absolute animate-fade-up text-2xl font-semibold"
              style={{
                color: "oklch(0.40 0.15 25)",
                animationDelay: "2300ms",
                animationFillMode: "both",
                top: "calc(100% + 1.5rem)",
                whiteSpace: "nowrap",
                textShadow: "0 0 40px oklch(0.40 0.15 25 / 0.45)",
              }}
            >
              Hediyeler hazır ✦
            </p>
          )}


          {/* Progress dots — hidden during blast */}
          {!blasting && (
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: "oklch(0.40 0.15 25)",
                    animation: "pulse-dot 1.4s ease-in-out infinite",
                    animationDelay: `${i * 200}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // ─── Wizard step ──────────────────────────────────────────────────────────

  return (
    <main className="flex min-h-dvh flex-col">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-10 backdrop-blur-xl"
        style={{
          background: "oklch(0.98 0.005 95 / 0.92)",
          borderBottom: "1px solid oklch(0 0 0 / 8%)",
        }}
      >
        <div className="mx-auto max-w-2xl px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            {/* Back */}
            <button
              id="wizard-back-btn"
              type="button"
              onClick={goBack}
              aria-label="Geri dön"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-150 hover:bg-black/5 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ color: "oklch(0.50 0.03 40)" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Progress bar */}
            <div className="flex-1">
              <ProgressBar currentStep={step + 1} totalSteps={questions.length} />
            </div>

            {/* Step counter */}
            <span
              className="text-xs font-semibold tabular-nums whitespace-nowrap shrink-0"
              style={{ color: "oklch(0.50 0.03 40)" }}
            >
              {step + 1}<span style={{ color: "oklch(0.68 0.02 40)" }}>/{questions.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Question body */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="mx-auto max-w-2xl px-4 pt-8">
          <AnimatedContainer
            key={step}
            direction={direction}
            className="flex flex-col gap-7"
          >
            {/* Heading block */}
            <div className="space-y-2">
              <h1
                className="text-[1.375rem] font-semibold leading-snug text-foreground"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                <TypewriterText
                  key={`${step}-title`}
                  text={currentQuestion.title}
                  speed={10}
                />
              </h1>
              {isMulti && (
                <p className="text-sm animate-fade-in" style={{ color: "oklch(0.50 0.03 40)", animationDelay: "120ms" }}>
                  {stepHint(currentQuestion)}
                </p>
              )}
            </div>

            {/* Options */}
            <StepQuestion
              question={currentQuestion}
              value={currentValue}
              onChange={setAnswer}
            />
          </AnimatedContainer>
        </div>
      </div>

      {/* Sticky footer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 backdrop-blur-xl"
        style={{
          background: "oklch(0.96 0.025 80 / 0.95)",
          borderTop: "1px solid oklch(0 0 0 / 8%)",
        }}
      >
        <div className="mx-auto max-w-2xl px-4 py-4 flex flex-col gap-2.5">
          {error && (
            <p role="alert" className="text-center text-sm" style={{ color: "oklch(0.45 0.18 22)" }}>
              {error}
            </p>
          )}

          {isMulti ? (
            /* Multi-select: explicit continue button */
            <button
              id="wizard-next-btn"
              type="button"
              onClick={goNext}
              disabled={!stepValid}
              aria-disabled={!stepValid}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
              style={
                stepValid
                  ? {
                      background: "oklch(0.38 0.14 10)",
                      color: "oklch(0.97 0.01 80)",
                      boxShadow: "0 2px 12px oklch(0.38 0.14 10 / 0.20)",
                    }
                  : {
                      background: "oklch(0.93 0.020 80)",
                      color: "oklch(0.60 0.02 40)",
                      cursor: "not-allowed",
                    }
              }
            >
              {isLastStep ? "Hediyeleri bul" : "Devam et"}
            </button>
          ) : (
            /* Single-select: auto-advances, button is a fallback/skip affordance */
            <div className="flex items-center justify-between gap-3">
              {/* Only show the hint when the user has navigated back to a completed step */}
              {(step < maxStep && stepValid) && (
                <p className="text-xs" style={{ color: "oklch(0.42 0.01 260)" }}>
                  Seçimin kaydedildi, devam ediliyor...
                </p>
              )}
              {!stepValid && (
                <p className="text-xs" style={{ color: "oklch(0.42 0.01 260)" }}>
                  Bir seçenek seç
                </p>
              )}
              {stepValid && (
                <button
                  id="wizard-next-btn"
                  type="button"
                  onClick={goNext}
                  className="shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-150 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    background: "oklch(0.38 0.14 10)",
                    color: "oklch(0.97 0.01 80)",
                  }}
                >
                  {isLastStep ? "Hediyeleri bul" : <span className="flex items-center justify-center gap-1.5">İleri <ArrowRight size={14} /></span>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
