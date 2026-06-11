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
  externalUrl?: string;
  status?: "available" | "coming_soon";
}

export const saasProducts: SaasProduct[] = [
  {
    slug: "odonto-gestao",
    name: "OdontoGestão",
    segment: "Odontologia",
    segmentIcon: "🦷",
    tagline: "Sistema de gestão odontológica completo",
    description:
      "O OdontoGestão moderniza clínicas odontológicas com gestão de pacientes, procedimentos, finanças e estoque em uma plataforma intuitiva. Aumente a produtividade e melhore a experiência dos pacientes.",
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
    externalUrl: "https://www.smilehub.app.br/admin",
    status: "available",
  },
  {
    slug: "edumaster",
    name: "EduMaster",
    segment: "Educação",
    segmentIcon: "🎓",
    tagline: "Plataforma de gestão educacional moderna",
    description:
      "O EduMaster é a solução para escolas, cursos e instituições de ensino gerenciarem alunos, turmas, finanças e comunicação com pais e responsáveis em uma plataforma acessível e intuitiva.",
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
      "Gestão de frequência",
      "Certificados e documentos digitais",
    ],
    color: "#f78c6c",
    externalUrl: "https://classflow.ia.br",
    status: "available",
  },
  {
    slug: "negocios",
    name: "Negócios",
    segment: "Negócios",
    segmentIcon: "💼",
    tagline: "Busca e inteligência comercial para empresas",
    description:
      "A solução Negócios apoia pesquisas empresariais, prospecção e análise de oportunidades com foco em dados cadastrais, segmentação e organização das informações comerciais.",
    benefits: [
      "Busca empresarial simplificada",
      "Organização de dados comerciais",
      "Apoio à prospecção B2B",
      "Consulta por segmentos e atividades",
      "Acesso web direto",
    ],
    features: [
      "Consulta de empresas",
      "Pesquisa por CNAE",
      "Filtros comerciais",
      "Organização de oportunidades",
      "Acesso pelo navegador",
      "Interface objetiva para vendas",
    ],
    color: "#00e0ff",
    externalUrl: "https://www.buscacnae.com.br",
    status: "available",
  },
  {
    slug: "agro",
    name: "Agro",
    segment: "Agronegócio",
    segmentIcon: "🌱",
    tagline: "Gestão e inteligência para operações do campo",
    description:
      "Solução em preparação para apoiar produtores e consultores com organização de propriedades, acompanhamento de culturas, análises e indicadores agrícolas.",
    benefits: [
      "Cadastro de propriedades",
      "Acompanhamento de culturas",
      "Histórico de atividades no campo",
      "Organização de análises e documentos",
      "Indicadores para tomada de decisão",
    ],
    features: [
      "Gestão de propriedades",
      "Histórico agrícola",
      "Registro de visitas técnicas",
      "Documentos do produtor",
      "Indicadores operacionais",
      "Acesso mobile planejado",
    ],
    color: "#a8e063",
    status: "coming_soon",
  },
  {
    slug: "fisiogestao",
    name: "FisioGestão",
    segment: "Fisioterapia",
    segmentIcon: "🏥",
    tagline: "Gestão clínica para fisioterapia",
    description:
      "Solução em preparação para clínicas de fisioterapia controlarem agenda, prontuários, evolução de pacientes, financeiro e documentos em uma plataforma simples.",
    benefits: [
      "Agenda de atendimentos",
      "Prontuário de fisioterapia",
      "Evolução do paciente",
      "Controle financeiro da clínica",
      "Documentos clínicos organizados",
    ],
    features: [
      "Cadastro de pacientes",
      "Avaliações clínicas",
      "Planos terapêuticos",
      "Agenda e lembretes",
      "Relatórios de evolução",
      "Portal do paciente planejado",
    ],
    color: "#ffd166",
    status: "coming_soon",
  },
  {
    slug: "nutrigestao",
    name: "NutriGestão",
    segment: "Nutrição",
    segmentIcon: "🥗",
    tagline: "Gestão para nutricionistas e clínicas de nutrição",
    description:
      "Solução em preparação para organizar consultas, planos alimentares, evolução dos pacientes, documentos e comunicação entre nutricionista e cliente.",
    benefits: [
      "Agenda de consultas",
      "Planos alimentares organizados",
      "Acompanhamento de evolução",
      "Histórico do paciente",
      "Comunicação mais simples",
    ],
    features: [
      "Cadastro de pacientes",
      "Anamnese nutricional",
      "Planos alimentares",
      "Registro de medidas",
      "Orientações ao paciente",
      "Acesso web planejado",
    ],
    color: "#06d6a0",
    status: "coming_soon",
  },
];

export function getSaasBySlug(slug: string): SaasProduct | undefined {
  return saasProducts.find((s) => s.slug === slug);
}
