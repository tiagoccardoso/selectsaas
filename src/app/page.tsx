import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SaasCard from "@/components/SaasCard";
import HowItWorks from "@/components/HowItWorks";
import Segments from "@/components/Segments";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { saasProducts } from "@/lib/saas-data";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />

      {/* SaaS Catalog */}
      <section id="solucoes" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-sora text-3xl sm:text-4xl font-bold mb-4">
              Soluções disponíveis
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              Sistemas desenvolvidos por especialistas de cada segmento, prontos
              para transformar a gestão do seu negócio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saasProducts.map((product) => (
              <SaasCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <Segments />

      {/* Diferenciais */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-surface-low to-surface-high border border-primary/20 rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="font-sora text-3xl sm:text-4xl font-bold mb-4">
              Precisa de um SaaS sob medida?
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-8">
              Desenvolvemos soluções personalizadas para o seu segmento e necessidade.
              Conte-nos sobre o seu negócio e receba uma análise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/solicitar-saas"
                className="px-8 py-4 bg-primary text-primary-on font-semibold rounded-lg glow hover:bg-primary-dim transition-all"
              >
                Solicitar SaaS personalizado
              </a>
              <a
                href="#contato"
                className="px-8 py-4 border border-surface-highest text-on-surface-variant hover:border-primary/40 hover:text-primary rounded-lg transition-all"
              >
                Falar com a equipe
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-24 bg-surface-low/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-sora text-3xl sm:text-4xl font-bold mb-4">
              Fale com nossa equipe
            </h2>
            <p className="text-on-surface-variant text-lg">
              Tire suas dúvidas e descubra qual solução é ideal para você.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
