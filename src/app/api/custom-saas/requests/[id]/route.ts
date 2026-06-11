import { NextRequest } from "next/server";
import { requireRequestUser } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { sql } from "@/lib/db";
import { cleanText, pickEnum, requireText } from "@/lib/validators";
import { customSaasDefaultStages, customSaasStatuses, type CustomSaasStatus } from "@/lib/custom-saas";

interface CustomSaasRequestRow {
  id: string;
  user_id: string;
  project_name: string;
  short_description: string;
  problem_solved: string;
  main_goal: string;
  target_audience: string;
  segment: string;
  urgency: string;
  desired_deadline: string;
  desired_features: string;
  expected_screens: string;
  user_profiles: string;
  permissions_needed: string;
  main_flows: string;
  desired_automations: string;
  reports_dashboards: string;
  data_to_register: string;
  data_import_export: string;
  required_integrations: string;
  external_apis: string;
  payments_subscriptions: string;
  ai_usage: string;
  notifications_webhooks: string;
  similar_systems: string;
  visual_preference: string;
  device_usage: string;
  responsiveness_need: string;
  accessibility_need: string;
  estimated_budget: string;
  business_model: string;
  multi_tenant_need: string;
  admin_panel_need: string;
  hosting_need: string;
  additional_notes: string;
  attachment_notes: string;
  status: CustomSaasStatus;
  current_stage: string;
  admin_budget_amount: string | null;
  admin_budget_notes: string;
  user_budget_response: string;
  budget_sent_at: string | null;
  budget_approved_at: string | null;
  budget_declined_at: string | null;
  build_started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
}

interface CustomSaasMessageRow {
  id: string;
  request_id: string;
  user_id: string | null;
  author_type: string;
  author_name: string | null;
  message: string;
  created_at: string;
}

function parseCurrency(value: unknown) {
  const raw = cleanText(value, 80);
  if (!raw) return null;

  const cleaned = raw.replace(/[^\d,.-]/g, "");
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.split(".").length === 2 && cleaned.split(".")[1].length === 3
      ? cleaned.replace(/\./g, "")
      : cleaned;
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) {
    throw Object.assign(new Error("Informe um valor de orçamento válido."), { status: 400 });
  }

  return amount;
}

async function loadRequest(requestId: string, userId: string, isAdmin: boolean) {
  const rows = isAdmin
    ? await sql<CustomSaasRequestRow[]>`
      SELECT r.*, r.admin_budget_amount::text AS admin_budget_amount, u.name AS user_name, u.email AS user_email
      FROM custom_saas_requests r
      INNER JOIN app_users u ON u.id = r.user_id
      WHERE r.id = ${requestId}::uuid
      LIMIT 1
    `
    : await sql<CustomSaasRequestRow[]>`
      SELECT r.*, r.admin_budget_amount::text AS admin_budget_amount, u.name AS user_name, u.email AS user_email
      FROM custom_saas_requests r
      INNER JOIN app_users u ON u.id = r.user_id
      WHERE r.id = ${requestId}::uuid AND r.user_id = ${userId}::uuid
      LIMIT 1
    `;

  return rows[0] ?? null;
}

function nextDates(requestRow: CustomSaasRequestRow, status: CustomSaasStatus) {
  const now = new Date().toISOString();

  return {
    budgetSentAt: status === "budget_sent" && !requestRow.budget_sent_at ? now : requestRow.budget_sent_at,
    budgetApprovedAt: status === "budget_approved" && !requestRow.budget_approved_at ? now : requestRow.budget_approved_at,
    budgetDeclinedAt: status === "budget_declined" && !requestRow.budget_declined_at ? now : requestRow.budget_declined_at,
    buildStartedAt: status === "in_build" && !requestRow.build_started_at ? now : requestRow.build_started_at,
    completedAt: status === "completed" && !requestRow.completed_at ? now : requestRow.completed_at,
  };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRequestUser(request);
    const requestRow = await loadRequest(params.id, user.id, user.role === "admin");

    if (!requestRow) {
      return jsonError("Solicitação não encontrada ou sem permissão de acesso.", 404);
    }

    const messages = await sql<CustomSaasMessageRow[]>`
      SELECT
        m.id, m.request_id, m.user_id, m.author_type, m.message, m.created_at,
        u.name AS author_name
      FROM custom_saas_request_messages m
      LEFT JOIN app_users u ON u.id = m.user_id
      WHERE m.request_id = ${params.id}::uuid
      ORDER BY m.created_at ASC
    `;

    return jsonOk({ request: requestRow, messages, current_user_role: user.role });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRequestUser(request);
    const requestRow = await loadRequest(params.id, user.id, user.role === "admin");

    if (!requestRow) {
      return jsonError("Solicitação não encontrada ou sem permissão de acesso.", 404);
    }

    const body = await request.json();
    const action = cleanText(body.action, 60);

    if (user.role === "admin") {
      const requestedStatus = pickEnum(body.status, customSaasStatuses, requestRow.status);
      const nextStatus = action === "send_budget" ? "budget_sent" : requestedStatus;
      const currentStage = cleanText(body.currentStage, 180) || customSaasDefaultStages[nextStatus];
      const adminBudgetAmount = parseCurrency(body.adminBudgetAmount);
      const adminBudgetNotes = cleanText(body.adminBudgetNotes, 8000);
      const adminMessage = cleanText(body.adminMessage, 5000);
      const dates = nextDates(requestRow, nextStatus);

      await sql`
        UPDATE custom_saas_requests
        SET
          status = ${nextStatus}::custom_saas_request_status,
          current_stage = ${currentStage},
          admin_budget_amount = ${adminBudgetAmount}::numeric,
          admin_budget_notes = ${adminBudgetNotes},
          budget_sent_at = ${dates.budgetSentAt}::timestamptz,
          budget_approved_at = ${dates.budgetApprovedAt}::timestamptz,
          budget_declined_at = ${dates.budgetDeclinedAt}::timestamptz,
          build_started_at = ${dates.buildStartedAt}::timestamptz,
          completed_at = ${dates.completedAt}::timestamptz
        WHERE id = ${params.id}::uuid
      `;

      if (adminMessage || action === "send_budget") {
        const message = adminMessage || `Orçamento enviado para análise do usuário.${adminBudgetNotes ? `\n\n${adminBudgetNotes}` : ""}`;
        await sql`
          INSERT INTO custom_saas_request_messages (request_id, user_id, author_type, message)
          VALUES (${params.id}::uuid, ${user.id}::uuid, 'admin'::support_message_author_type, ${message})
        `;
      }

      return jsonOk({ updated: true });
    }

    if (!["approve_budget", "decline_budget"].includes(action)) {
      return jsonError("Usuário padrão só pode aprovar ou recusar o orçamento.", 403);
    }

    if (requestRow.status !== "budget_sent") {
      return jsonError("O orçamento só pode ser respondido quando estiver enviado para aprovação.", 400);
    }

    const nextStatus: CustomSaasStatus = action === "approve_budget" ? "budget_approved" : "budget_declined";
    const userBudgetResponse = cleanText(body.userBudgetResponse, 5000);
    const dates = nextDates(requestRow, nextStatus);

    await sql`
      UPDATE custom_saas_requests
      SET
        status = ${nextStatus}::custom_saas_request_status,
        current_stage = ${customSaasDefaultStages[nextStatus]},
        user_budget_response = ${userBudgetResponse},
        budget_approved_at = ${dates.budgetApprovedAt}::timestamptz,
        budget_declined_at = ${dates.budgetDeclinedAt}::timestamptz
      WHERE id = ${params.id}::uuid
    `;

    await sql`
      INSERT INTO custom_saas_request_messages (request_id, user_id, author_type, message)
      VALUES (
        ${params.id}::uuid,
        ${user.id}::uuid,
        'user'::support_message_author_type,
        ${`${nextStatus === "budget_approved" ? "Orçamento aprovado pelo usuário." : "Orçamento recusado pelo usuário."}${userBudgetResponse ? `\n\n${userBudgetResponse}` : ""}`}
      )
    `;

    return jsonOk({ updated: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
