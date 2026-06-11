export default function Benefits() {
  const benefits = [
    {
      icon: "⚡",
      title: "Implantação rápida",
      description: "Configure e comece a usar em minutos, sem necessidade de instalação ou infraestrutura própria.",
    },
    {
      icon: "🔒",
      title: "Segurança enterprise",
      description: "Dados protegidos com criptografia, conformidade com LGPD e backups automáticos.",
    },
    {
      icon: "🤝",
      title: "Suporte especializado",
      description: "Equipe de especialistas disponível para ajudar na configuração, dúvidas e crescimento do seu negócio.",
    },
    {
      icon: "📱",
      title: "Acesso mobile",
      description: "Acesse de qualquer dispositivo: computador, tablet ou smartphone, com a mesma experiência premium.",
    },
  ];

  return (
    <section className="py-24 bg-surface-low/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-sora text-3xl sm:text-4xl font-bold mb-4">
            Por que escolher o <span className="text-gradient">SelectSaaS</span>?
          </h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Curadoria rigorosa das melhores soluções do mercado, para que você
            encontre sempre o sistema certo para o seu negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-surface-low border border-surface-high rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <span className="text-3xl mb-4 block">{benefit.icon}</span>
              <h3 className="font-sora text-lg font-semibold mb-2 text-on-surface">
                {benefit.title}
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
