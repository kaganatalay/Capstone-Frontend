/**
 * Saved gifts persistence layer.
 *
 * Saved gift entries are stored in localStorage under SAVED_GIFTS_KEY.
 * Each entry contains the full GiftItem plus context about when/why it was saved.
 */
import type { GiftItem } from "@/types/recommendation";

export const SAVED_GIFTS_KEY = "gifty_saved_gifts_v2";
const LEGACY_SAVED_KEY = "gift_recommender_saved"; // old format — IDs only

export interface SavedGift {
  gift: GiftItem;
  savedAt: string; // ISO timestamp
  context?: {
    recipient?: string;
    occasion?: string;
    budget?: string;
  };
}

export function loadSavedGifts(): SavedGift[] {
  try {
    const raw = localStorage.getItem(SAVED_GIFTS_KEY);
    if (raw) return JSON.parse(raw) as SavedGift[];
    return [];
  } catch {
    return [];
  }
}

export function persistSavedGifts(gifts: SavedGift[]): void {
  try {
    localStorage.setItem(SAVED_GIFTS_KEY, JSON.stringify(gifts));
    // Keep legacy key in sync (ID set) for backwards compat
    const ids = gifts.map((g) => g.gift.id);
    localStorage.setItem(LEGACY_SAVED_KEY, JSON.stringify(ids));
  } catch { /* noop */ }
}

export function saveGift(
  gift: GiftItem,
  context?: SavedGift["context"],
): SavedGift[] {
  const current = loadSavedGifts();
  // Avoid duplicates
  if (current.some((s) => s.gift.id === gift.id)) return current;
  const next: SavedGift[] = [
    { gift, savedAt: new Date().toISOString(), context },
    ...current,
  ];
  persistSavedGifts(next);
  return next;
}

export function unsaveGift(id: string): SavedGift[] {
  const current = loadSavedGifts();
  const next = current.filter((s) => s.gift.id !== id);
  persistSavedGifts(next);
  return next;
}

export function isGiftSaved(id: string): boolean {
  return loadSavedGifts().some((s) => s.gift.id === id);
}

export function clearAllSaved(): void {
  try {
    localStorage.removeItem(SAVED_GIFTS_KEY);
    localStorage.removeItem(LEGACY_SAVED_KEY);
  } catch { /* noop */ }
}

/** Backwards-compat: load legacy saved IDs and return them */
export function loadLegacySavedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LEGACY_SAVED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}
