import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SelectSaaS — Marketplace Premium de SaaS",
  description:
    "Encontre e contrate os melhores sistemas SaaS para o seu segmento. Soluções premium para saúde, educação, logística, agronegócio e muito mais.",
  keywords: "saas, marketplace, software, gestão, sistema, premium",
  openGraph: {
    title: "SelectSaaS — Marketplace Premium de SaaS",
    description: "Os melhores sistemas SaaS para cada segmento do mercado.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${inter.variable}`}>
      <body className="bg-background text-on-surface font-inter antialiased">
        {children}
      </body>
    </html>
  );
}
