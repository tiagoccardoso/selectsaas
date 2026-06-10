import { clearSessionCookie } from "@/lib/auth";
import { jsonOk, toErrorResponse } from "@/lib/api-response";

export async function POST() {
  try {
    await clearSessionCookie();
    return jsonOk({ loggedOut: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
