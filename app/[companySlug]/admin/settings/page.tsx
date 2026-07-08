import { notFound } from "next/navigation";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getCompanyBySlug } from "@/lib/data/board";

export default async function SettingsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const { data: company } = await getCompanyBySlug(params.companySlug);
  if (!company) notFound();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="font-heading text-2xl text-umber mb-6">Cài đặt công ty</h1>
      <SettingsForm
        companySlug={params.companySlug}
        name={company.name}
        logoUrl={company.logo_url}
      />
    </main>
  );
}
