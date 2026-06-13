"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadSavedGifts } from "@/lib/saved-gifts";

export function SavedBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(loadSavedGifts().length);
    // Sync when localStorage changes (e.g., from another tab)
    function onStorage(e: StorageEvent) {
      if (e.key === "gifty_saved_gifts_v2") {
        setCount(loadSavedGifts().length);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (count === 0) return null;

  return (
    <Link
      href="/saved"
      className="absolute top-6 right-5 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold animate-fade-in transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        background: "oklch(0.78 0.14 75 / 0.12)",
        border: "1px solid oklch(0.78 0.14 75 / 0.25)",
        color: "oklch(0.82 0.14 75)",
        animationDelay: "300ms",
      }}
      aria-label={`${count} kaydedilen hediye`}
    >
      🔖 {count}
    </Link>
  );
}
