export const customSaasStatuses = [
  "requested",
  "under_review",
  "budget_sent",
  "budget_approved",
  "budget_declined",
  "in_build",
  "in_review",
  "completed",
  "cancelled",
] as const;

export type CustomSaasStatus = typeof customSaasStatuses[number];

export const customSaasStatusLabels: Record<CustomSaasStatus, string> = {
  requested: "Solicitado",
  under_review: "Em análise",
  budget_sent: "Orçamento enviado",
  budget_approved: "Orçamento aprovado",
  budget_declined: "Orçamento recusado",
  in_build: "Em construção",
  in_review: "Em revisão",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const customSaasDefaultStages: Record<CustomSaasStatus, string> = {
  requested: "Solicitação recebida",
  under_review: "Análise técnica e comercial",
  budget_sent: "Aguardando aprovação do orçamento",
  budget_approved: "Orçamento aprovado pelo usuário",
  budget_declined: "Orçamento recusado pelo usuário",
  in_build: "Construção iniciada",
  in_review: "Revisão e validação",
  completed: "Projeto concluído",
  cancelled: "Solicitação cancelada",
};

export type CustomSaasFieldType = "text" | "textarea" | "select";

export interface CustomSaasField {
  name: string;
  label: string;
  type: CustomSaasFieldType;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  options?: readonly { value: string; label: string }[];
}

export interface CustomSaasFieldSection {
  title: string;
  description: string;
  fields: readonly CustomSaasField[];
}

const yesNoUnknown = [
  { value: "", label: "Selecionar" },
  { value: "Sim", label: "Sim" },
  { value: "Não", label: "Não" },
  { value: "Ainda não sei", label: "Ainda não sei" },
] as const;

export const customSaasFieldSections: readonly CustomSaasFieldSection[] = [
  {
    title: "1. Dados gerais",
    description: "Explique a ideia, o problema e o público que será atendido pelo SaaS.",
    fields: [
      { name: "projectName", label: "Nome do projeto/SaaS", type: "text", required: true, placeholder: "Ex.: GestãoPro Clínicas" },
      { name: "shortDescription", label: "Descrição resumida da ideia", type: "textarea", required: true, rows: 3, placeholder: "Resuma em poucas linhas o que o sistema precisa fazer." },
      { name: "problemSolved", label: "Problema que o SaaS resolve", type: "textarea", required: true, rows: 3, placeholder: "Qual dor operacional, comercial ou administrativa será resolvida?" },
      { name: "mainGoal", label: "Objetivo principal", type: "textarea", rows: 3, placeholder: "Ex.: reduzir retrabalho, automatizar atendimento, controlar produção..." },
      { name: "targetAudience", label: "Público-alvo", type: "text", required: true, placeholder: "Ex.: clínicas odontológicas, contadores, escolas, imobiliárias..." },
      { name: "segment", label: "Segmento de atuação", type: "text", placeholder: "Ex.: saúde, educação, contabilidade, logística..." },
      {
        name: "urgency",
        label: "Nível de urgência",
        type: "select",
        options: [
          { value: "", label: "Selecionar" },
          { value: "Baixa", label: "Baixa" },
          { value: "Média", label: "Média" },
          { value: "Alta", label: "Alta" },
          { value: "Urgente", label: "Urgente" },
        ],
      },
      { name: "desiredDeadline", label: "Prazo desejado", type: "text", placeholder: "Ex.: 30 dias, 3 meses, até uma data específica..." },
    ],
  },
  {
    title: "2. Funcionalidades",
    description: "Detalhe telas, permissões, automações e fluxos esperados no produto.",
    fields: [
      { name: "desiredFeatures", label: "Principais funcionalidades desejadas", type: "textarea", required: true, rows: 5, placeholder: "Liste as funcionalidades mais importantes para o MVP e para versões futuras." },
      { name: "expectedScreens", label: "Telas ou áreas esperadas", type: "textarea", rows: 4, placeholder: "Ex.: dashboard, cadastro de clientes, financeiro, relatórios, admin..." },
      { name: "userProfiles", label: "Tipos de usuários/perfis", type: "textarea", rows: 3, placeholder: "Ex.: admin, cliente, vendedor, operador, gestor..." },
      { name: "permissionsNeeded", label: "Permissões necessárias", type: "textarea", rows: 3, placeholder: "Informe o que cada perfil pode visualizar, criar, editar ou aprovar." },
      { name: "mainFlows", label: "Fluxos principais do sistema", type: "textarea", rows: 4, placeholder: "Descreva o passo a passo das operações principais." },
      { name: "desiredAutomations", label: "Automações desejadas", type: "textarea", rows: 3, placeholder: "Ex.: lembretes automáticos, status, cobranças, notificações..." },
      { name: "reportsDashboards", label: "Relatórios ou dashboards necessários", type: "textarea", rows: 3, placeholder: "Quais indicadores, gráficos, filtros ou exportações são necessários?" },
    ],
  },
  {
    title: "3. Dados e integrações",
    description: "Informe dados manipulados, APIs, pagamentos, IA e notificações.",
    fields: [
      { name: "dataToRegister", label: "Quais dados serão cadastrados", type: "textarea", rows: 4, placeholder: "Ex.: clientes, produtos, contratos, documentos, atendimentos..." },
      { name: "dataImportExport", label: "Importação/exportação de dados", type: "textarea", rows: 3, placeholder: "Ex.: Excel, CSV, PDF, integração com outro sistema..." },
      { name: "requiredIntegrations", label: "Integrações necessárias", type: "textarea", rows: 3, placeholder: "Ex.: Stripe, Mercado Pago, WhatsApp, Google Calendar, ERP..." },
      { name: "externalApis", label: "APIs externas conhecidas", type: "textarea", rows: 3, placeholder: "Informe nome, documentação ou sistema que precisa integrar." },
      { name: "paymentsSubscriptions", label: "Pagamentos/assinaturas", type: "textarea", rows: 3, placeholder: "O SaaS venderá planos mensais, anuais, trial ou cobrança avulsa?" },
      { name: "aiUsage", label: "Uso de IA", type: "textarea", rows: 3, placeholder: "Ex.: chat, análise de documentos, geração de relatórios, classificação automática..." },
      { name: "notificationsWebhooks", label: "E-mail, WhatsApp, notificações ou webhooks", type: "textarea", rows: 3, placeholder: "Descreva canais, gatilhos e destinatários." },
    ],
  },
  {
    title: "4. Design e experiência",
    description: "Defina referências visuais, dispositivos e necessidades de usabilidade.",
    fields: [
      { name: "similarSystems", label: "Referências de sistemas parecidos", type: "textarea", rows: 3, placeholder: "Links ou nomes de sistemas que servem como referência." },
      { name: "visualPreference", label: "Preferência visual", type: "textarea", rows: 3, placeholder: "Ex.: estilo moderno, dashboard premium, minimalista, cores da marca..." },
      { name: "deviceUsage", label: "Uso em desktop, tablet ou celular", type: "text", placeholder: "Ex.: principalmente mobile, desktop administrativo, tablet em campo..." },
      { name: "responsivenessNeed", label: "Necessidade de responsividade", type: "select", options: yesNoUnknown },
      { name: "accessibilityNeed", label: "Necessidade de acessibilidade", type: "textarea", rows: 2, placeholder: "Informe requisitos específicos, se houver." },
    ],
  },
  {
    title: "5. Comercial e implantação",
    description: "Ajude o admin a estimar escopo, modelo de negócio e infraestrutura.",
    fields: [
      { name: "estimatedBudget", label: "Orçamento estimado pelo usuário", type: "text", placeholder: "Opcional. Ex.: até R$ 5.000, R$ 10.000 a R$ 20.000..." },
      { name: "businessModel", label: "Modelo de negócio esperado", type: "textarea", rows: 3, placeholder: "Ex.: assinatura mensal, uso interno, cobrança por usuário, marketplace..." },
      { name: "multiTenantNeed", label: "Necessidade de multiusuário/multicliente", type: "select", options: yesNoUnknown },
      { name: "adminPanelNeed", label: "Necessidade de painel admin", type: "select", options: yesNoUnknown },
      { name: "hostingNeed", label: "Necessidade de deploy/hospedagem", type: "select", options: yesNoUnknown },
      { name: "additionalNotes", label: "Observações adicionais", type: "textarea", rows: 4, placeholder: "Inclua regras de negócio, restrições ou detalhes que ainda não foram citados." },
      { name: "attachmentNotes", label: "Anexos/referências", type: "textarea", rows: 3, placeholder: "Descreva documentos, imagens, planilhas ou referências que você possui. O envio de arquivos pode ser combinado no histórico da solicitação." },
    ],
  },
];

export const customSaasFieldLabels = customSaasFieldSections.reduce<Record<string, string>>((acc, section) => {
  section.fields.forEach((field) => {
    acc[field.name] = field.label;
  });
  return acc;
}, {});

export const customSaasRequiredFields = customSaasFieldSections.flatMap((section) =>
  section.fields.filter((field) => field.required).map((field) => field.name),
);
