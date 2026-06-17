import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gifty - Mükemmel Hediyeyi Bul",
  description:
    "14 kısa soruyu yanıtla, yapay zekâ sana özel hediyeler önersin. Trendyol'dan anında sipariş.",
  keywords: [
    "hediye",
    "hediye fikirleri",
    "kişiselleştirilmiş hediye",
    "hediye öneri",
  ],
  openGraph: {
    title: "Gifty - Mükemmel Hediyeyi Bul",
    description: "14 soruyu yanıtla, mükemmel hediyeyi bul.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh bg-background antialiased">{children}</body>
    </html>
  );
}
