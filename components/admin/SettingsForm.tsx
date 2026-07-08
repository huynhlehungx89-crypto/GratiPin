"use client";

import { useState } from "react";
import { updateCompanySettings } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/client";
import { resizeImageFile } from "@/lib/utils/image";

export function SettingsForm({
  companySlug,
  name,
  logoUrl,
}: {
  companySlug: string;
  name: string;
  logoUrl: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const newName = String(form.get("name"));
    const logoFile = form.get("logo") as File | null;
    let newLogoUrl = logoUrl ?? undefined;

    try {
      if (logoFile && logoFile.size > 0) {
        const supabase = createClient();
        const resized = await resizeImageFile(logoFile);
        const fileName = `logos/${Date.now()}.jpg`;
        await supabase.storage.from("pin-images").upload(fileName, resized, { contentType: "image/jpeg" });
        const { data } = supabase.storage.from("pin-images").getPublicUrl(fileName);
        newLogoUrl = data.publicUrl;
      }

      const result = await updateCompanySettings({
        companySlug,
        name: newName,
        logoUrl: newLogoUrl,
      });
      if (result.error) setError(result.error);
      else window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-xl border border-umber/10 bg-white p-6">
      <div>
        <label className="text-sm">Tên công ty</label>
        <input name="name" defaultValue={name} required className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label className="text-sm">Logo mới</label>
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="my-2 h-12 w-12 rounded-full object-cover" />
        )}
        <input name="logo" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="rounded-full bg-peach px-6 py-2 text-white disabled:opacity-50">
        Lưu thay đổi
      </button>
    </form>
  );
}
