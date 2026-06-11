export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Explore as soluções",
      description:
        "Navegue pelo catálogo de sistemas SaaS organizados por segmento e necessidade. Use os filtros para encontrar rapidamente o que precisa.",
    },
    {
      number: "02",
      title: "Conheça os detalhes",
      description:
        "Acesse a página de cada solução para entender funcionalidades, benefícios, casos de uso e diferenciais competitivos.",
    },
    {
      number: "03",
      title: "Solicite uma demonstração",
      description:
        "Entre em contato com nossa equipe para uma demonstração personalizada e tire todas as suas dúvidas antes de contratar.",
    },
    {
      number: "04",
      title: "Comece a usar",
      description:
        "Após a contratação, nossa equipe cuida de toda a implantação e treinamento para você começar a usar o sistema rapidamente.",
    },
  ];

  return (
    <section id="como-funciona" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-sora text-3xl sm:text-4xl font-bold mb-4">
            Como funciona
          </h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Da descoberta à implantação, estamos com você em cada etapa do processo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute left-16 right-[-2rem] top-7 h-px bg-gradient-to-r from-primary/40 to-transparent"
                  aria-hidden="true"
                />
              )}
              <div className="relative z-10">
                <div className="w-14 h-14 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-sora font-bold text-primary text-lg">{step.number}</span>
                </div>
                <h3 className="font-sora text-lg font-semibold mb-2 text-on-surface">
                  {step.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
