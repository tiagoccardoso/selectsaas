import { NextRequest } from "next/server";
import { requireRequestUser } from "@/lib/auth";
import { jsonOk, toErrorResponse } from "@/lib/api-response";
import { sql } from "@/lib/db";
import { cleanText, requireText } from "@/lib/validators";

interface CustomSaasSummaryRow {
  id: string;
  project_name: string;
  short_description: string;
  target_audience: string;
  segment: string;
  urgency: string;
  status: string;
  current_stage: string;
  admin_budget_amount: string | null;
  budget_sent_at: string | null;
  budget_approved_at: string | null;
  budget_declined_at: string | null;
  build_started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  messages_count: number;
}

function optionalText(value: unknown, maxLength = 5000) {
  return cleanText(value, maxLength);
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "1" && user.role === "admin";
    const status = cleanText(searchParams.get("status"), 60);

    const rows = all
      ? await sql<CustomSaasSummaryRow[]>`
        SELECT
          r.id, r.project_name, r.short_description, r.target_audience, r.segment, r.urgency,
          r.status, r.current_stage, r.admin_budget_amount::text AS admin_budget_amount,
          r.budget_sent_at, r.budget_approved_at, r.budget_declined_at, r.build_started_at, r.completed_at,
          r.created_at, r.updated_at,
          u.name AS user_name, u.email AS user_email,
          COUNT(m.id)::int AS messages_count
        FROM custom_saas_requests r
        INNER JOIN app_users u ON u.id = r.user_id
        LEFT JOIN custom_saas_request_messages m ON m.request_id = r.id
        WHERE (${status || null}::text IS NULL OR r.status::text = ${status || null})
        GROUP BY r.id, u.name, u.email
        ORDER BY r.updated_at DESC
      `
      : await sql<CustomSaasSummaryRow[]>`
        SELECT
          r.id, r.project_name, r.short_description, r.target_audience, r.segment, r.urgency,
          r.status, r.current_stage, r.admin_budget_amount::text AS admin_budget_amount,
          r.budget_sent_at, r.budget_approved_at, r.budget_declined_at, r.build_started_at, r.completed_at,
          r.created_at, r.updated_at,
          u.name AS user_name, u.email AS user_email,
          COUNT(m.id)::int AS messages_count
        FROM custom_saas_requests r
        INNER JOIN app_users u ON u.id = r.user_id
        LEFT JOIN custom_saas_request_messages m ON m.request_id = r.id
        WHERE r.user_id = ${user.id}::uuid
          AND (${status || null}::text IS NULL OR r.status::text = ${status || null})
        GROUP BY r.id, u.name, u.email
        ORDER BY r.updated_at DESC
      `;

    return jsonOk({ requests: rows });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const body = await request.json();

    const projectName = requireText(body.projectName, "Nome do projeto/SaaS", 3, 180);
    const shortDescription = requireText(body.shortDescription, "Descrição resumida", 10, 5000);
    const problemSolved = requireText(body.problemSolved, "Problema que o SaaS resolve", 10, 5000);
    const targetAudience = requireText(body.targetAudience, "Público-alvo", 3, 240);
    const desiredFeatures = requireText(body.desiredFeatures, "Principais funcionalidades", 10, 8000);

    const rows = await sql<{ id: string }[]>`
      INSERT INTO custom_saas_requests (
        user_id,
        project_name,
        short_description,
        problem_solved,
        main_goal,
        target_audience,
        segment,
        urgency,
        desired_deadline,
        desired_features,
        expected_screens,
        user_profiles,
        permissions_needed,
        main_flows,
        desired_automations,
        reports_dashboards,
        data_to_register,
        data_import_export,
        required_integrations,
        external_apis,
        payments_subscriptions,
        ai_usage,
        notifications_webhooks,
        similar_systems,
        visual_preference,
        device_usage,
        responsiveness_need,
        accessibility_need,
        estimated_budget,
        business_model,
        multi_tenant_need,
        admin_panel_need,
        hosting_need,
        additional_notes,
        attachment_notes
      ) VALUES (
        ${user.id}::uuid,
        ${projectName},
        ${shortDescription},
        ${problemSolved},
        ${optionalText(body.mainGoal)},
        ${targetAudience},
        ${optionalText(body.segment, 240)},
        ${optionalText(body.urgency, 80)},
        ${optionalText(body.desiredDeadline, 180)},
        ${desiredFeatures},
        ${optionalText(body.expectedScreens)},
        ${optionalText(body.userProfiles)},
        ${optionalText(body.permissionsNeeded)},
        ${optionalText(body.mainFlows)},
        ${optionalText(body.desiredAutomations)},
        ${optionalText(body.reportsDashboards)},
        ${optionalText(body.dataToRegister)},
        ${optionalText(body.dataImportExport)},
        ${optionalText(body.requiredIntegrations)},
        ${optionalText(body.externalApis)},
        ${optionalText(body.paymentsSubscriptions)},
        ${optionalText(body.aiUsage)},
        ${optionalText(body.notificationsWebhooks)},
        ${optionalText(body.similarSystems)},
        ${optionalText(body.visualPreference)},
        ${optionalText(body.deviceUsage, 500)},
        ${optionalText(body.responsivenessNeed, 80)},
        ${optionalText(body.accessibilityNeed)},
        ${optionalText(body.estimatedBudget, 240)},
        ${optionalText(body.businessModel)},
        ${optionalText(body.multiTenantNeed, 80)},
        ${optionalText(body.adminPanelNeed, 80)},
        ${optionalText(body.hostingNeed, 80)},
        ${optionalText(body.additionalNotes)},
        ${optionalText(body.attachmentNotes)}
      )
      RETURNING id
    `;

    await sql`
      INSERT INTO custom_saas_request_messages (request_id, user_id, author_type, message)
      VALUES (
        ${rows[0].id}::uuid,
        ${user.id}::uuid,
        ${user.role}::support_message_author_type,
        ${`Solicitação criada pelo usuário.\n\n${shortDescription}`}
      )
    `;

    return jsonOk({ id: rows[0].id }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
