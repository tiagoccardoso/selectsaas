import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Marketplace Premium de Soluções SaaS
        </div>

        <h1 className="font-sora text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          O sistema certo para{" "}
          <span className="text-gradient">cada negócio</span>
        </h1>

        <p className="text-on-surface-variant text-lg sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
          Conectamos empresas às melhores soluções de software do mercado.
          Saúde, educação, logística, agronegócio e muito mais — encontre o
          SaaS ideal para transformar sua operação.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="#solucoes"
            className="px-8 py-4 bg-primary text-primary-on font-semibold rounded-lg glow hover:bg-primary-dim transition-all text-base"
          >
            Explorar Soluções
          </Link>
          <Link
            href="#como-funciona"
            className="px-8 py-4 border border-surface-highest text-on-surface-variant hover:border-primary/40 hover:text-primary rounded-lg transition-all text-base"
          >
            Como Funciona
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "50+", label: "Soluções disponíveis" },
            { value: "10k+", label: "Empresas atendidas" },
            { value: "30+", label: "Segmentos de mercado" },
            { value: "99.9%", label: "Uptime garantido" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-sora text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-on-surface-variant text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
