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
  status: "available" | "coming-soon";
  externalLink?: string;
}

export const saasProducts: SaasProduct[] = [
  {
    slug: "agro",
    name: "Agro",
    segment: "Agronegócio",
    segmentIcon: "🌱",
    tagline: "Gestão agrícola inteligente para o produtor rural",
    description:
      "Uma solução SaaS dedicada ao agronegócio, atualmente em desenvolvimento. Será voltada para produtores rurais e cooperativas que precisam digitalizar processos, controlar safras e otimizar a gestão do campo.",
    benefits: [
      "Controle de safras e planejamento agrícola",
      "Gestão de insumos e custos de produção",
      "Monitoramento de propriedades rurais",
      "Relatórios de produtividade e resultados",
      "Comunicação com equipe de campo",
    ],
    features: [
      "Mapa interativo de talhões e propriedades",
      "Registro de atividades e operações agrícolas",
      "Gestão de estoque de insumos",
      "Alertas e notificações para equipes",
      "Relatórios gerenciais por período",
      "Acesso mobile para uso no campo",
    ],
    color: "#a8e063",
    status: "coming-soon",
  },
  {
    slug: "fisioterapia",
    name: "Clínicas de Fisioterapia",
    segment: "Fisioterapia",
    segmentIcon: "🏥",
    tagline: "Gestão completa para clínicas de fisioterapia",
    description:
      "Sistema de gestão para clínicas de fisioterapia atualmente em desenvolvimento. Será projetado para facilitar o dia a dia de fisioterapeutas e clínicas, cobrindo desde o agendamento até o acompanhamento clínico dos pacientes.",
    benefits: [
      "Prontuário eletrônico do paciente",
      "Agendamento e controle de agenda",
      "Acompanhamento de evolução clínica",
      "Controle financeiro e faturamento",
      "Gestão de convênios e planos de saúde",
    ],
    features: [
      "Fichas de avaliação personalizáveis",
      "Agenda com lembretes automáticos",
      "Histórico completo do paciente",
      "Relatórios de atendimentos",
      "Controle de pagamentos e recebimentos",
      "Acesso via computador e smartphone",
    ],
    color: "#00e0ff",
    status: "coming-soon",
  },
  {
    slug: "odontologia",
    name: "Clínicas de Odontologia",
    segment: "Odontologia",
    segmentIcon: "🦷",
    tagline: "Sistema de gestão odontológica especializado",
    description:
      "Solução SaaS para clínicas odontológicas em desenvolvimento. Será construída com foco nas necessidades específicas de dentistas e clínicas, cobrindo gestão de pacientes, procedimentos, finanças e muito mais.",
    benefits: [
      "Odontograma digital completo",
      "Gestão de tratamentos e orçamentos",
      "Controle de agenda e retornos",
      "Gestão financeira e faturamento",
      "Controle de estoque de materiais",
    ],
    features: [
      "Prontuário odontológico digital",
      "Plano de tratamento personalizado",
      "Lembretes automáticos para pacientes",
      "Integração com planos odontológicos",
      "Relatórios financeiros detalhados",
      "Acesso via computador e smartphone",
    ],
    color: "#dcb8ff",
    status: "coming-soon",
  },
  {
    slug: "educacao",
    name: "Educação",
    segment: "Educação",
    segmentIcon: "🎓",
    tagline: "Plataforma de aprendizado já disponível no mercado",
    description:
      "O ClassFlow é uma plataforma de educação já disponível no mercado, desenvolvida para facilitar o processo de ensino e aprendizagem. Acesse agora mesmo e conheça todas as funcionalidades disponíveis para sua instituição ou alunos.",
    benefits: [
      "Plataforma de ensino completa e intuitiva",
      "Gestão de turmas e conteúdos",
      "Acompanhamento do progresso dos alunos",
      "Comunicação integrada entre professores e alunos",
      "Acesso pelo computador e smartphone",
    ],
    features: [
      "Criação e organização de conteúdos",
      "Gestão de turmas e matrículas",
      "Ferramentas de comunicação e colaboração",
      "Relatórios de desempenho acadêmico",
      "Interface intuitiva para alunos e professores",
      "Disponível 24h por dia",
    ],
    color: "#f78c6c",
    status: "available",
    externalLink: "https://classflow.ia.br",
  },
  {
    slug: "negocios",
    name: "Negócios",
    segment: "Negócios",
    segmentIcon: "💼",
    tagline: "Ferramenta de pesquisa e inteligência para empresas",
    description:
      "O BuscaCNAE é uma ferramenta de inteligência empresarial já disponível no mercado. Ideal para empresas, contadores e consultores que precisam pesquisar e consultar CNAEs, atividades econômicas e informações do setor. Acesse agora e experimente.",
    benefits: [
      "Pesquisa rápida e precisa de CNAEs",
      "Consulta de atividades econômicas",
      "Informações atualizadas do setor",
      "Interface simples e objetiva",
      "Acesso gratuito pelo navegador",
    ],
    features: [
      "Busca por descrição ou código CNAE",
      "Listagem completa de atividades",
      "Filtros para refinar resultados",
      "Informações detalhadas por atividade",
      "Funciona em qualquer dispositivo",
      "Disponível 24h por dia",
    ],
    color: "#06d6a0",
    status: "available",
    externalLink: "https://www.buscacnae.com.br",
  },
];

export function getSaasBySlug(slug: string): SaasProduct | undefined {
  return saasProducts.find((s) => s.slug === slug);
}
