import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { jsonOk, toErrorResponse } from "@/lib/api-response";
import { cleanText, isValidEmail, normalizeEmail, requireText } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = requireText(body.name, "Nome", 2, 160);
    const email = normalizeEmail(requireText(body.email, "E-mail", 5, 180));
    const phone = cleanText(body.phone, 80) || null;
    const company = cleanText(body.company, 160) || null;
    const productSlug = cleanText(body.productSlug, 120) || null;
    const subject = cleanText(body.subject, 180) || (productSlug ? `Interesse em ${productSlug}` : "Contato pelo site");
    const message = cleanText(body.message, 5000);

    if (!isValidEmail(email)) {
      throw Object.assign(new Error("Informe um e-mail válido."), { status: 400 });
    }

    const rows = await sql<{ id: string }[]>`
      INSERT INTO contact_messages (name, email, phone, company, product_slug, subject, message)
      VALUES (${name}, ${email}, ${phone}, ${company}, ${productSlug}, ${subject}, ${message})
      RETURNING id
    `;

    return jsonOk({ id: rows[0].id }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
