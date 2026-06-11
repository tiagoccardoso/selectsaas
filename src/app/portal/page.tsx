import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PortalRedirectPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/portal");
  }

  if (user.role === "admin") {
    redirect("/admin");
  }

  redirect("/suporte");
}
