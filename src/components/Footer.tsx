import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contato" className="border-t border-surface-high bg-surface-low/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <span className="font-sora font-bold text-2xl text-gradient block mb-3">
              SelectSaaS
            </span>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
              Desenvolvemos e divulgamos soluções SaaS especializadas para diferentes
              segmentos de mercado. Nosso foco é entregar sistemas que resolvem
              problemas reais do seu negócio.
            </p>
            <div className="flex gap-4 mt-6">
              {["LinkedIn", "Twitter", "Instagram"].map((social) => (
                <span
                  key={social}
                  className="text-on-surface-variant hover:text-primary transition-colors text-sm cursor-pointer"
                >
                  {social}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-sora font-semibold text-on-surface mb-4">Soluções</h4>
            <ul className="space-y-2">
              {["Odontologia", "Fisioterapia", "Agro", "Educação", "Negócios"].map((item) => (
                <li key={item}>
                  <span className="text-on-surface-variant hover:text-primary transition-colors text-sm cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sora font-semibold text-on-surface mb-4">Empresa</h4>
            <ul className="space-y-2">
              {["Sobre nós", "Como funciona", "Parceiros", "Contato", "Blog"].map((item) => (
                <li key={item}>
                  <span className="text-on-surface-variant hover:text-primary transition-colors text-sm cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-high pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-on-surface-variant text-sm">
            © {new Date().getFullYear()} SelectSaaS. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            {["Privacidade", "Termos de uso", "LGPD"].map((item) => (
              <span key={item} className="text-on-surface-variant hover:text-primary transition-colors text-sm cursor-pointer">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
