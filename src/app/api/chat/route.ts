import { NextRequest } from "next/server";

// ─── ✏️  PUT YOUR KEY HERE ────────────────────────────────────────────────────
// Get one at https://openrouter.ai — this never leaves the server.
const OPENROUTER_API_KEY =
  "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";

// Cheapest model that speaks coherent Turkish and gives grounded answers.
// Swap to "google/gemini-2.5-flash" for more reasoning headroom.
const MODEL = "google/gemini-2.5-flash-lite";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GiftItemContext {
  id: string;
  name: string;
  price: number;
  category: string;
  reason: string;
  brand?: string;
  score: number;
}

interface ChatContext {
  answers: Record<string, string | string[]>;
  items: GiftItemContext[];
}

interface RequestBody {
  messages: ChatMessage[];
  context: ChatContext;
}

// ─── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(context: ChatContext): string {
  const answerLines = Object.entries(context.answers)
    .filter(([, v]) => {
      if (Array.isArray(v)) return v.length > 0;
      return String(v ?? "").trim().length > 0;
    })
    .map(([k, v]) => {
      const label = k.replace(/_/g, " ");
      const value = Array.isArray(v) ? v.join(", ") : String(v);
      return `- ${label}: ${value}`;
    })
    .join("\n");

  const giftLines = context.items
    .map((g, i) => {
      const brand = g.brand ? ` (${g.brand})` : "";
      const price = g.price.toLocaleString("tr-TR");
      return `${i + 1}. **${g.name}**${brand} — ${price} TL\n   Öneri sebebi: ${g.reason}`;
    })
    .join("\n");

  return `Sen Gifty'nin AI hediye danışmanısın. Görevin kullanıcının aşağıdaki öneriler arasından en doğru seçimi yapmasına yardımcı olmak.

## Kullanıcı hakkında toplanan bilgiler
${answerLines || "Bilgi bulunamadı."}

## Önerilen hediyeler
${giftLines || "Öneri listesi boş."}

## Kurallar
- Yalnızca yukarıdaki hediyeler hakkında konuş. Başka ürün önerme.
- Cevaplarında hediyeleri isimleriyle belirt.
- Kısa, net ve samimi cevaplar ver — maksimum 3-4 cümle.
- Tamamen Türkçe cevap ver.
- Fiyatları "TL" ile belirt.
- Listede olmayan bir şey sorulursa, nazikçe listedeki hediyelere yönlendir.
- Sıcak, zeki bir arkadaş gibi konuş — robotik veya resmi değil.`;
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {

  let body: RequestBody | undefined;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Geçersiz istek gövdesi." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, context } = body!;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Mesaj listesi boş." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const systemPrompt = buildSystemPrompt(context);

  let upstream: Response;
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://gifty.app",
        "X-Title": "Gifty",
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        max_tokens: 350,
        temperature: 0.65,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(({ role, content }) => ({ role, content })),
        ],
      }),
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "OpenRouter'a bağlanılamadı." }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return new Response(
      JSON.stringify({
        error: `AI servisi hatası: ${upstream.status}`,
        detail,
      }),
      {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Proxy the SSE stream directly to the client
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
