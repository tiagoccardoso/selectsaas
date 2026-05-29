export interface SaasProduct {
  slug: string;
  name: string;
  segment: string;
  segmentIcon: string;
  tagline: string;
  description: string;
  benefits: string[];
  features: string[];
  color: string;
}

export const saasProducts: SaasProduct[] = [
  {
    slug: "physiocare",
    name: "PhysioCare",
    segment: "Saúde & Fisioterapia",
    segmentIcon: "🏥",
    tagline: "Gestão completa para clínicas de fisioterapia",
    description:
      "O PhysioCare é uma plataforma completa para clínicas de fisioterapia, com prontuário eletrônico, agendamento inteligente, evolução de pacientes e relatórios clínicos. Tudo em um só lugar, acessível de qualquer dispositivo.",
    benefits: [
      "Prontuário eletrônico integrado",
      "Agendamento online para pacientes",
      "Controle financeiro e faturamento",
      "Relatórios de evolução clínica",
      "App mobile para equipe",
    ],
    features: [
      "Agenda inteligente com lembretes automáticos",
      "Fichas de avaliação personalizáveis",
      "Gestão de planos de saúde e convênios",
      "Dashboard de desempenho da clínica",
      "Telemedicina integrada",
      "Assinatura digital de documentos",
    ],
    color: "#00e0ff",
  },
  {
    slug: "odonto-gestao",
    name: "OdontoGestão",
    segment: "Odontologia",
    segmentIcon: "🦷",
    tagline: "Sistema de gestão odontológica completo",
    description:
      "O OdontoGestão moderniza sua clínica odontológica com gestão de pacientes, procedimentos, finanças e estoque em uma plataforma intuitiva. Aumente sua produtividade e melhore a experiência dos seus pacientes.",
    benefits: [
      "Odontograma digital completo",
      "Gestão de procedimentos e orçamentos",
      "Controle de estoque de materiais",
      "Relatórios financeiros detalhados",
      "Fidelização de pacientes",
    ],
    features: [
      "Prontuário odontológico digital",
      "Plano de tratamento personalizado",
      "Integração com planos odontológicos",
      "Lembretes automáticos por WhatsApp",
      "Receituário digital",
      "Controle de radiografias",
    ],
    color: "#dcb8ff",
  },
  {
    slug: "plantasa",
    name: "Plantasã",
    segment: "Agronegócio",
    segmentIcon: "🌱",
    tagline: "Consultoria agrícola inteligente na palma da mão",
    description:
      "O Plantasã conecta produtores rurais a consultores agrícolas especializados, oferecendo diagnóstico de culturas, planejamento de safras e monitoramento em tempo real. Tecnologia a serviço do campo.",
    benefits: [
      "Diagnóstico inteligente de culturas",
      "Planejamento de safra assistido por IA",
      "Monitoramento climático integrado",
      "Rede de consultores certificados",
      "Relatórios de produtividade",
    ],
    features: [
      "Mapa interativo de propriedades",
      "Alertas de pragas e doenças",
      "Integração com estações meteorológicas",
      "Gestão de insumos e custos",
      "Análise de solo digital",
      "Comunicação direta com consultores",
    ],
    color: "#a8e063",
  },
  {
    slug: "logistrack",
    name: "LogisTrack",
    segment: "Logística & Transporte",
    segmentIcon: "🚚",
    tagline: "Rastreamento e gestão logística em tempo real",
    description:
      "O LogisTrack oferece visibilidade total sobre sua operação logística, com rastreamento de frota, gestão de rotas, controle de entregas e relatórios de desempenho. Reduza custos e aumente a eficiência.",
    benefits: [
      "Rastreamento de frota em tempo real",
      "Otimização automática de rotas",
      "Controle de entregas e ocorrências",
      "Gestão de motoristas e veículos",
      "Integração com e-commerce",
    ],
    features: [
      "Dashboard de operações ao vivo",
      "App mobile para motoristas",
      "Comprovante de entrega digital",
      "Gestão de manutenção de veículos",
      "Relatórios de performance por rota",
      "API para integração com ERPs",
    ],
    color: "#ffd166",
  },
  {
    slug: "edumaster",
    name: "EduMaster",
    segment: "Educação",
    segmentIcon: "🎓",
    tagline: "Plataforma de gestão educacional moderna",
    description:
      "O EduMaster é a solução completa para escolas, cursos e instituições de ensino. Gerencie alunos, turmas, finanças e comunicação com pais e responsáveis em uma única plataforma acessível e intuitiva.",
    benefits: [
      "Gestão de alunos e matrículas",
      "Portal do aluno e responsável",
      "Controle financeiro e mensalidades",
      "Comunicados e agenda integrada",
      "Relatórios de desempenho acadêmico",
    ],
    features: [
      "Diário de classe digital",
      "Emissão de boletos automática",
      "Chat com pais e responsáveis",
      "Biblioteca digital integrada",
      "Gestão de frequência por biometria",
      "Certificados e diplomas digitais",
    ],
    color: "#f78c6c",
  },
  {
    slug: "realtypro",
    name: "RealtyPro",
    segment: "Imobiliário",
    segmentIcon: "🏢",
    tagline: "Gestão imobiliária inteligente e completa",
    description:
      "O RealtyPro é a plataforma ideal para imobiliárias e corretores independentes, com gestão de imóveis, clientes, contratos e comissões. Feche mais negócios com menos esforço.",
    benefits: [
      "Gestão de carteira de imóveis",
      "CRM para clientes e leads",
      "Contratos digitais e assinatura eletrônica",
      "Controle de comissões",
      "Portal de busca para clientes",
    ],
    features: [
      "Publicação automática em portais",
      "Tour virtual 360°",
      "Gestão de contratos de locação",
      "Cobrança automática de aluguéis",
      "Relatórios de desempenho por corretor",
      "Integração com cartórios digitais",
    ],
    color: "#06d6a0",
  },
];

export function getSaasBySlug(slug: string): SaasProduct | undefined {
  return saasProducts.find((s) => s.slug === slug);
}
