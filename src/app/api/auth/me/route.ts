import { NextRequest } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUserFromRequest(request);

    if (!user) {
      return jsonError("Sessão não encontrada.", 401);
    }

    return jsonOk({ user });
  } catch (error) {
    return toErrorResponse(error);
  }
}
