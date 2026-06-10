import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="pt-BR">
      <body className="bg-background text-on-surface font-inter antialiased">
        {children}
      </body>
    </html>
  );
}
