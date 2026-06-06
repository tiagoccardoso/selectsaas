import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { saasProducts, getSaasBySlug } from "@/lib/saas-data";

export async function generateStaticParams() {
  return saasProducts.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = getSaasBySlug(params.slug);
  if (!product) return {};
  return {
    title: `${product.name} — SelectSaaS`,
    description: product.description,
  };
}

export default function SaasPage({ params }: { params: { slug: string } }) {
  const product = getSaasBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const isAvailable = product.status === "available";

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, ${product.color}08, transparent 60%)` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm mb-8"
          >
            ← Voltar ao marketplace
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-5xl" role="img" aria-label={product.segment}>
                  {product.segmentIcon}
                </span>
                <span
                  className="text-sm font-medium px-3 py-1 rounded-full border"
                  style={{ color: product.color, borderColor: `${product.color}40`, backgroundColor: `${product.color}10` }}
                >
                  {product.segment}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    isAvailable
                      ? "text-emerald-400 border-emerald-400/40 bg-emerald-400/10"
                      : "text-amber-400 border-amber-400/40 bg-amber-400/10"
                  }`}
                >
                  {isAvailable ? "Disponível" : "Em breve"}
                </span>
              </div>

              <h1 className="font-sora text-4xl sm:text-5xl font-bold mb-4 text-on-surface">
                {product.name}
              </h1>

              <p className="text-xl text-on-surface-variant mb-6 leading-relaxed">
                {product.tagline}
              </p>

              <p className="text-on-surface-variant leading-relaxed mb-8">
                {product.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAvailable && product.externalLink ? (
                  <a
                    href={product.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 font-semibold rounded-lg transition-all text-center"
                    style={{ backgroundColor: product.color, color: "#00363f" }}
                  >
                    Acessar agora →
                  </a>
                ) : (
                  <a
                    href="#avisar"
                    className="px-8 py-4 font-semibold rounded-lg transition-all text-center"
                    style={{ backgroundColor: product.color, color: "#00363f" }}
                  >
                    Quero ser avisado
                  </a>
                )}
                <a
                  href="#contato"
                  className="px-8 py-4 border font-medium rounded-lg transition-all text-center hover:opacity-80"
                  style={{ borderColor: `${product.color}40`, color: product.color }}
                >
                  Entrar em contato
                </a>
              </div>
            </div>

            {/* Benefits card */}
            <div className="bg-surface-low border border-surface-high rounded-2xl p-8">
              <h3 className="font-sora text-lg font-semibold mb-6 text-on-surface">
                {isAvailable ? "Principais benefícios" : "O que está sendo desenvolvido"}
              </h3>
              <ul className="space-y-4">
                {product.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${product.color}20` }}
                    >
                      <svg className="w-3.5 h-3.5" style={{ color: product.color }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-on-surface-variant text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-surface-low/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-sora text-2xl sm:text-3xl font-bold mb-10 text-center">
            {isAvailable ? "Funcionalidades disponíveis" : "Funcionalidades previstas"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.features.map((feature) => (
              <div
                key={feature}
                className="bg-surface-low border border-surface-high rounded-xl p-5 flex items-start gap-3 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${product.color}15` }}
                >
                  <svg className="w-4 h-4" style={{ color: product.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-on-surface-variant text-sm leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contato" className="py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-sora text-3xl font-bold mb-4">
              {isAvailable ? `Entre em contato` : `Avisem-me quando lançar`}
            </h2>
            <p className="text-on-surface-variant">
              {isAvailable
                ? "Ficou com alguma dúvida? Nossa equipe está pronta para ajudar."
                : "Deixe seus dados e avisaremos assim que a solução estiver disponível."}
            </p>
          </div>
          <div className="bg-surface-low border border-surface-high rounded-2xl p-8" id="avisar">
            <ContactForm productName={product.name} productSlug={product.slug} />
          </div>
        </div>
      </section>

      {/* Other Solutions */}
      <section className="py-16 bg-surface-low/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="font-sora text-xl font-semibold mb-4">
            Explore outras soluções
          </h3>
          <p className="text-on-surface-variant text-sm mb-6">
            Temos sistemas para diversos segmentos. Descubra mais opções no marketplace.
          </p>
          <Link
            href="/#solucoes"
            className="inline-flex items-center gap-2 px-6 py-3 border border-primary/40 text-primary rounded-lg hover:bg-primary/10 transition-colors"
          >
            Ver todas as soluções →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
