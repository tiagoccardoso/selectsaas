const segments = [
  { icon: "🦷", name: "Odontologia" },
  { icon: "🌱", name: "Agronegócio" },
  { icon: "🎓", name: "Educação" },
  { icon: "💼", name: "Negócios" },
  { icon: "🏥", name: "Fisioterapia" },
  { icon: "🥗", name: "Nutrição" },
];

export default function Segments() {
  return (
    <section id="segmentos" className="py-24 bg-surface-low/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-sora text-3xl sm:text-4xl font-bold mb-4">
            Segmentos atendidos
          </h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Soluções especializadas para mercados com necessidades específicas.
            Cada sistema foi desenvolvido com conhecimento do segmento.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {segments.map((segment) => (
            <div
              key={segment.name}
              className="flex flex-col items-center gap-2 p-4 bg-surface-low border border-surface-high rounded-xl hover:border-primary/30 hover:bg-surface transition-all cursor-default"
            >
              <span className="text-3xl" role="img" aria-label={segment.name}>
                {segment.icon}
              </span>
              <span className="text-sm text-on-surface-variant text-center font-medium">
                {segment.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
