import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import CustomSaasRequestForm from "@/components/CustomSaasRequestForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RequestCustomSaasPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?mode=register&next=/solicitar-saas");
  }

  return (
    <AppShell>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">SaaS personalizado</p>
        <h1 className="font-sora text-3xl font-bold">Solicitar desenvolvimento de SaaS</h1>
        <p className="mt-2 max-w-3xl text-on-surface-variant">
          Preencha as informações abaixo para que o desenvolvedor consiga entender o escopo, avaliar viabilidade, estimar orçamento e acompanhar a construção dentro da própria plataforma.
        </p>
      </div>

      <CustomSaasRequestForm />
    </AppShell>
  );
}
