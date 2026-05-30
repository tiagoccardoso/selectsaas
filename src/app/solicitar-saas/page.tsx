import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SolicitarSaasForm from "@/components/SolicitarSaasForm";

export const metadata = {
  title: "Solicitar SaaS Personalizado — SelectSaaS",
  description:
    "Descreva sua necessidade e solicite o desenvolvimento de um sistema SaaS sob medida para o seu negócio.",
};

export default function SolicitarSaasPage() {
  return (
    <main>
      <Navbar />

      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Desenvolvimento sob medida
            </div>

            <h1 className="font-sora text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Solicitar <span className="text-gradient">SaaS Personalizado</span>
            </h1>

            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
              Tem uma ideia de sistema ou precisa digitalizar processos do seu negócio?
              Preencha o formulário abaixo e nossa equipe analisará sua solicitação para
              desenvolver uma solução SaaS sob medida para você.
            </p>
          </div>

          <div className="bg-surface-low border border-surface-high rounded-2xl p-6 sm:p-10">
            <SolicitarSaasForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
