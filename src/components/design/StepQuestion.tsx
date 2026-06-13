"use client";

import { cn } from "@/lib/utils";
import { ChipSelect } from "@/components/design/ChipSelect";
import type { Question } from "@/types/recommendation";

// ─── Question IDs ─────────────────────────────────────────────────────────────
const MULTI_SELECT    = new Set(["temel_ilgi_alanları_neler"]);
const ZODIAC_QUESTION = new Set(["onun_burcu_nedir"]);

const ZODIAC_EMOJI: Record<string, string> = {
  Koç: "♈", Boğa: "♉", İkizler: "♊", Yengeç: "♋",
  Aslan: "♌", Başak: "♍", Terazi: "♎", Akrep: "♏",
  Yay: "♐", Oğlak: "♑", Kova: "♒", Balık: "♓",
};

const QUESTION_DEFAULT_ICON: Record<string, string> = {
  kime_hediye_alıyorsun: "👤",
  cinsiyeti_nedir: "🧑",
  "hangi_yaş_aralığında": "🎂",
  "bu_hediyeyi_hangi_özel_durum_için_alıyorsun": "🎉",
  "bütçe_aralığın_nedir": "💰",
  "temel_ilgi_alanları_neler": "⭐",
  "onun_tarzını__estetik_anlayışını_bir_renk_paletiyle_seçsen_hangisi_olurdu": "🎨",
  "onun_mükemmel_pazar_gününü_nasıl_özetlersin": "🌅",
  "onun_en_belirgin_tatlı_zararlı": "⚡",
  "onun_burcu_nedir": "✨",
  "beklenmedik_bir_yerden_eline_biraz_para_geçse_ilk_nereye_harcar": "💸",
  "onu_en_çok_mutlu_eden_o_koku_hangisi": "🌸",
  "bir_mağazada_eli_önce_hangi_dokuya_gider": "🤲",
  "onun_için_hangisi_daha_değerlidir": "❤️",
};

const INTEREST_EMOJI: [string, string][] = [
  ["Teknoloji", "💻"], ["Moda", "👗"], ["Kozmetik", "💄"],
  ["Ev Dekorasyonu", "🏠"], ["Ev", "🏠"],
  ["Spor", "⚽"], ["Kitap", "📚"],
  ["Kahve", "☕"], ["Müzik", "🎵"],
  ["Oyun", "🎮"], ["Gurme", "🍳"],
];

function displayLabel(option: string): string {
  return option.replace(/\s*\(Algoritma[\s\S]*?\)/gi, "").trim();
}

function getEmoji(option: string, questionId: string): string {
  const label = displayLabel(option);
  const l = label.toLowerCase();

  if (ZODIAC_QUESTION.has(questionId)) {
    const name = label.split(" ")[0].split("(")[0].trim();
    return ZODIAC_EMOJI[name] ?? "⭐";
  }

  if (MULTI_SELECT.has(questionId)) {
    for (const [prefix, emoji] of INTEREST_EMOJI) {
      if (label.startsWith(prefix)) return emoji;
    }
    return "⭐";
  }

  if (l.startsWith("anne")) return "👩‍👦";
  if (l.startsWith("baba")) return "👨‍👦";
  if (l.startsWith("kardeş")) return "👫";
  if (l.startsWith("eş / partner") || l.startsWith("eş/partner")) return "💍";
  if (l.startsWith("sevgili")) return "💕";
  if (l.startsWith("yakın arkadaş")) return "👭";
  if (l.startsWith("iş arkadaşı")) return "💼";
  if (l.startsWith("yönetici")) return "👔";
  if (l.startsWith("öğretmen")) return "🎓";
  if (l.startsWith("sadece tanıdık") || l.startsWith("yeni birisi")) return "🤝";
  if (l.startsWith("kendime")) return "🎁";

  if (l === "kadın") return "👩";
  if (l === "erkek") return "👨";
  if (l.startsWith("belirtmek") || l.includes("unisex")) return "🌈";

  if (l.startsWith("18 yaş altı")) return "🧒";
  if (l.startsWith("18 - 24") || l.startsWith("18-24")) return "👦";
  if (l.startsWith("25 - 34") || l.startsWith("25-34")) return "👨";
  if (l.startsWith("35 - 44") || l.startsWith("35-44")) return "🧑";
  if (l.startsWith("45 - 54") || l.startsWith("45-54")) return "👩‍🦳";
  if (l.startsWith("55 - 64") || l.startsWith("55-64")) return "👨‍🦳";
  if (l.startsWith("65")) return "👴";

  if (l.startsWith("doğum günü")) return "🎂";
  if (l.startsWith("yıl dönümü")) return "💑";
  if (l.startsWith("sevgililer")) return "💝";
  if (l.startsWith("anneler")) return "👩‍👦";
  if (l.startsWith("babalar")) return "👨‍👦";
  if (l.startsWith("yılbaşı")) return "🎄";
  if (l.startsWith("yeni i̇ş") || l.startsWith("yeni iş") || l.includes("terfi")) return "💼";
  if (l.startsWith("mezuniyet")) return "🎓";
  if (l.startsWith("yeni ev")) return "🏠";
  if (l.startsWith("geçmiş olsun")) return "🌟";
  if (l.startsWith("özür")) return "💐";
  if (l.startsWith("i̇çimden") || l.startsWith("içimden")) return "💫";

  if (l.startsWith("0 - 500") || l.startsWith("0-500")) return "💵";
  if (l.startsWith("500 - 1") || l.startsWith("500-1")) return "💰";
  if (l.startsWith("1.000 - 2") || l.startsWith("1000 - 2")) return "💎";
  if (l.startsWith("2.500") || l.startsWith("2500")) return "🔮";
  if (l.includes("üzeri")) return "👑";

  if (l.startsWith("siyah") || l.includes("antrasit")) return "⬛";
  if (l.startsWith("toprak")) return "🟫";
  if (l.startsWith("canlı") || l.includes("neon")) return "🌈";
  if (l.startsWith("pastel") || l.includes("lila")) return "🌸";

  if (l.startsWith("evden hiç çıkmadan")) return "🛋️";
  if (l.startsWith("sırt çantasını")) return "🏕️";
  if (l.startsWith("şık bir mekan")) return "✨";
  if (l.startsWith("kendi köşesinde")) return "📖";

  if (l.startsWith("her zaman üşümesi")) return "🥶";
  if (l.startsWith("telefon şarjının")) return "🔋";
  if (l.startsWith("her şeyi aşırı")) return "📋";
  if (l.startsWith("kahve içmeden asla")) return "☕";
  if (l.startsWith("sürekli eşyalarını")) return "🗝️";
  if (l.startsWith("nostalji")) return "📸";
  if (l.startsWith("7/24 kulaklık")) return "🎧";
  if (l.includes("hiçbir şeyim yok") || l.includes("gardırob")) return "👗";

  if (l.includes("üstüme başıma")) return "👗";
  if (l.includes("mideme")) return "🍔";
  if (l.includes("evime")) return "🏠";
  if (l.includes("hobime")) return "🎨";

  if (l.startsWith("yeni demlenmiş")) return "☕";
  if (l.startsWith("yağmur")) return "🌊";
  if (l.startsWith("yeni yıkanmış")) return "🧺";
  if (l.startsWith("kaliteli bir parfüm")) return "🌹";

  if (l.startsWith("yumuşak")) return "🧸";
  if (l.startsWith("pürüzsüz")) return "✨";
  if (l.startsWith("doğal")) return "🪵";

  if (l.startsWith("hikayesi olan")) return "❤️";
  if (l.startsWith("son teknoloji")) return "💻";
  if (l.startsWith("prestijli")) return "👑";

  return QUESTION_DEFAULT_ICON[questionId] ?? "🎁";
}

function splitDescriptive(label: string): { main: string; sub?: string } {
  const colonIdx = label.indexOf(": ");
  if (colonIdx > 0 && colonIdx < 50) {
    return {
      main: label.slice(0, colonIdx).trim(),
      sub: label.slice(colonIdx + 2).replace(/^"|"$/g, "").trim(),
    };
  }
  return { main: label };
}

// ─── RadioRow ─────────────────────────────────────────────────────────────────

interface RadioRowProps {
  option: string;
  questionId: string;
  selected: boolean;
  onSelect: () => void;
}

function RadioRow({ option, questionId, selected, onSelect }: RadioRowProps) {
  const label = displayLabel(option);
  const emoji = getEmoji(option, questionId);
  const { main, sub } = splitDescriptive(label);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); }
      }}
      className={cn(
        "group flex items-center gap-4 w-full rounded-xl px-4 py-3.5 text-left",
        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "active:scale-[0.985]"
      )}
      style={
        selected
          ? {
              background: "oklch(0.26 0.065 75 / 0.45)",
              border: "1.5px solid oklch(0.78 0.14 75 / 0.55)",
            }
          : {
              background: "oklch(0.2 0.04 310 / 55%)",
              border: "1px solid oklch(1 0 0 / 7%)",
            }
      }
    >
      {/* Emoji icon */}
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl",
          "transition-transform duration-150",
          selected ? "scale-110" : "group-hover:scale-105"
        )}
        style={{
          background: selected
            ? "oklch(0.78 0.14 75 / 0.18)"
            : "oklch(1 0 0 / 5%)",
        }}
        aria-hidden="true"
      >
        {emoji}
      </span>

      {/* Label */}
      <span className="flex-1 min-w-0">
        <span
          className={cn(
            "block text-sm font-medium leading-snug transition-colors duration-150",
            selected ? "text-foreground" : "text-foreground/75 group-hover:text-foreground/90"
          )}
        >
          {main}
        </span>
        {sub && (
          <span
            className="block text-xs leading-snug mt-0.5"
            style={{ color: "oklch(0.52 0.015 260)" }}
          >
            {sub}
          </span>
        )}
      </span>

      {/* Selection indicator */}
      <span
        className={cn(
          "ml-auto shrink-0 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200",
          selected ? "opacity-100 scale-100" : "opacity-0 scale-75 group-hover:opacity-25 group-hover:scale-90"
        )}
        style={
          selected
            ? { background: "oklch(0.78 0.14 75)", color: "#1a0f2e" }
            : { border: "1.5px solid oklch(0.78 0.14 75 / 0.6)" }
        }
        aria-hidden="true"
      >
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
            <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
    </button>
  );
}

// ─── ZodiacGrid ───────────────────────────────────────────────────────────────

function ZodiacGrid({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const label = displayLabel(opt);
        const name = label.split(" ")[0].split("(")[0].trim();
        const emoji = ZODIAC_EMOJI[name] ?? "⭐";
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(opt); }
            }}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl py-4 px-2",
              "min-h-[72px]",
              "transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            style={
              selected
                ? {
                    background: "oklch(0.26 0.065 75 / 0.45)",
                    border: "1.5px solid oklch(0.78 0.14 75 / 0.55)",
                  }
                : {
                    background: "oklch(0.2 0.04 310 / 55%)",
                    border: "1px solid oklch(1 0 0 / 7%)",
                  }
            }
          >
            <span className={cn("text-2xl transition-transform duration-150", selected && "scale-110")}>
              {emoji}
            </span>
            <span
              className="text-[11px] font-medium leading-tight text-center"
              style={{ color: selected ? "oklch(0.92 0.01 65)" : "oklch(0.58 0.015 260)" }}
            >
              {name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── StepQuestion ─────────────────────────────────────────────────────────────

interface StepQuestionProps {
  question: Question;
  value: string | string[];
  onChange: (v: string | string[]) => void;
}

export function StepQuestion({ question, value, onChange }: StepQuestionProps) {
  const isMulti  = MULTI_SELECT.has(question.id);
  const isZodiac = ZODIAC_QUESTION.has(question.id);

  if (isMulti) {
    const chips = question.options.map((opt) => ({
      id: opt,
      label: displayLabel(opt),
      emoji: getEmoji(opt, question.id),
    }));
    return (
      <ChipSelect
        options={chips}
        selected={Array.isArray(value) ? value : []}
        onChange={(sel) => onChange(sel)}
        className="gap-2"
      />
    );
  }

  if (isZodiac) {
    return (
      <ZodiacGrid
        options={question.options}
        value={typeof value === "string" ? value : ""}
        onChange={onChange}
      />
    );
  }

  const strValue = typeof value === "string" ? value : "";
  return (
    <div
      className="flex flex-col gap-2 stagger-children"
      role="radiogroup"
      aria-label={question.title}
    >
      {question.options.map((opt) => (
        <RadioRow
          key={opt}
          option={opt}
          questionId={question.id}
          selected={strValue === opt}
          onSelect={() => onChange(opt)}
        />
      ))}
    </div>
  );
}
