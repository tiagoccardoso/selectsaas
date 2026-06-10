import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { jsonOk, toErrorResponse } from "@/lib/api-response";
import { cleanText } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);
    const { searchParams } = new URL(request.url);
    const status = cleanText(searchParams.get("status"), 40);

    const messages = await sql`
      SELECT id, name, email, phone, company, product_slug, subject, message, status, created_at, updated_at
      FROM contact_messages
      WHERE (${status || null}::text IS NULL OR status::text = ${status || null})
      ORDER BY created_at DESC
      LIMIT 200
    `;

    return jsonOk({ messages });
  } catch (error) {
    return toErrorResponse(error);
  }
}
