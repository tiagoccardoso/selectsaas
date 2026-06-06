import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Suporte — SelectSaaS",
  description:
    "Acesse o suporte dos sistemas SelectSaaS, abra tickets de atendimento e use IA para tirar suas dúvidas.",
};

const sistemas = [
  {
    icon: "🎓",
    name: "ClassFlow",
    desc: "Plataforma de educação",
    cor: "#f78c6c",
  },
  {
    icon: "💼",
    name: "BuscaCNAE",
    desc: "Inteligência empresarial",
    cor: "#06d6a0",
  },
  {
    icon: "🦷",
    name: "SmileHub Admin",
    desc: "Gestão odontológica",
    cor: "#dcb8ff",
  },
];

const passos = [
  {
    num: "1",
    titulo: "Acesse o portal de suporte",
    desc: "Entre com seu e-mail no portal centralizado de atendimento clicando no botão abaixo.",
  },
  {
    num: "2",
    titulo: "Descreva sua dúvida ou problema",
    desc: "Use a IA de suporte para tirar dúvidas instantâneas ou abra um ticket para atendimento humano.",
  },
  {
    num: "3",
    titulo: "Acompanhe sua solicitação",
    desc: "Receba atualizações por e-mail e acesse o histórico completo de atendimentos no portal.",
  },
];

export default function SuportePage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Suporte 24h com IA
          </div>

          <h1 className="font-sora text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Central de <span className="text-gradient">Suporte</span>
          </h1>

          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Tire suas dúvidas, abra tickets de atendimento e resolva problemas
            rapidamente com nossa IA de suporte dedicada — disponível a qualquer
            momento, para todos os sistemas SelectSaaS.
          </p>

          {/* CTA principal */}
          <a
            href="https://suporte-ia-two.vercel.app/login"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-on font-semibold rounded-lg glow hover:bg-primary-dim transition-all text-base"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Acessar portal de suporte com IA
          </a>

          <p className="text-on-surface-variant text-sm mt-4">
            Faça login com seu e-mail cadastrado.
          </p>
        </div>
      </section>

      {/* Sistemas atendidos */}
      <section className="py-16 bg-surface-low/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-sora text-2xl font-bold text-on-surface text-center mb-8">
            Sistemas com suporte disponível
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sistemas.map((s) => (
              <div
                key={s.name}
                className="bg-surface-low border border-surface-high rounded-xl p-5 flex items-center gap-4"
              >
                <span className="text-3xl flex-shrink-0">{s.icon}</span>
                <div>
                  <p className="font-sora font-semibold text-on-surface text-sm">{s.name}</p>
                  <p className="text-on-surface-variant text-xs">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-sora text-2xl font-bold text-on-surface text-center mb-10">
            Como abrir um chamado
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {passos.map((p) => (
              <div key={p.num} className="text-center">
                <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="font-sora font-bold text-primary">{p.num}</span>
                </div>
                <h3 className="font-sora font-semibold text-on-surface mb-2">{p.titulo}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recursos do suporte */}
      <section className="py-16 bg-surface-low/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-sora text-2xl font-bold text-on-surface text-center mb-8">
            O que você pode fazer no suporte
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: "🤖",
                titulo: "IA para dúvidas instantâneas",
                desc: "Pergunte qualquer coisa sobre os sistemas e receba respostas imediatas da IA de suporte, sem espera.",
              },
              {
                icon: "🎫",
                titulo: "Abertura de tickets",
                desc: "Registre problemas técnicos ou solicitações que precisam de atenção humana especializada.",
              },
              {
                icon: "📋",
                titulo: "Acompanhamento de chamados",
                desc: "Visualize o status de todos os seus tickets abertos, em andamento ou resolvidos.",
              },
              {
                icon: "📚",
                titulo: "Orientações de uso",
                desc: "Acesse guias, tutoriais e documentação para aproveitar ao máximo cada sistema.",
              },
            ].map((card) => (
              <div
                key={card.titulo}
                className="bg-surface-low border border-surface-high rounded-xl p-5 flex gap-4"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{card.icon}</span>
                <div>
                  <h3 className="font-sora font-semibold text-on-surface text-sm mb-1">
                    {card.titulo}
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-surface-low to-surface-high border border-primary/20 rounded-2xl p-8">
            <h2 className="font-sora text-2xl font-bold mb-3">
              Precisa de ajuda agora?
            </h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              Nossa IA de suporte está disponível 24h por dia, 7 dias por semana.
              Acesse o portal e resolva sua dúvida em minutos.
            </p>
            <a
              href="https://suporte-ia-two.vercel.app/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-on font-semibold rounded-lg glow hover:bg-primary-dim transition-all"
            >
              Acessar suporte com IA →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
