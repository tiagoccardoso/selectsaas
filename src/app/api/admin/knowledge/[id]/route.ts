import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { jsonOk, toErrorResponse } from "@/lib/api-response";
import { cleanText, pickEnum, requireText } from "@/lib/validators";

const statuses = ["draft", "active", "archived"] as const;

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser(request);
    const body = await request.json();
    const title = requireText(body.title, "Título", 4, 180);
    const content = requireText(body.content, "Conteúdo", 20, 20000);
    const category = cleanText(body.category, 100) || "Geral";
    const status = pickEnum(body.status, statuses, "active");

    await sql`
      UPDATE support_knowledge_articles
      SET title = ${title}, content = ${content}, category = ${category}, status = ${status}::knowledge_status
      WHERE id = ${params.id}::uuid
    `;

    return jsonOk({ updated: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser(request);

    await sql`
      DELETE FROM support_knowledge_articles
      WHERE id = ${params.id}::uuid
    `;

    return jsonOk({ deleted: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
