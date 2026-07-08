"use client";

import { useState } from "react";
import Link from "next/link";
import { signupCompany } from "@/lib/actions/signup";
import { createClient } from "@/lib/supabase/client";
import { resizeImageFile } from "@/lib/utils/image";
import { slugify } from "@/lib/utils/slug";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [customSlug, setCustomSlug] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const displayName = String(form.get("displayName") ?? "");
    const logoFile = form.get("logo") as File | null;

    let logoUrl = "";
    try {
      if (logoFile && logoFile.size > 0) {
        const supabase = createClient();
        const resized = await resizeImageFile(logoFile);
        const fileName = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("pin-images")
          .upload(fileName, resized, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("pin-images").getPublicUrl(fileName);
        logoUrl = data.publicUrl;
      }

      const result = await signupCompany({
        companyName,
        slug: customSlug || undefined,
        email,
        password,
        displayName,
        logoUrl: logoUrl || undefined,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      window.location.href = `/${result.slug}/board`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Tên công ty</label>
        <input
          name="companyName"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full rounded-lg border border-umber/20 bg-white px-3 py-2"
          placeholder="VD: Công ty ABC"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          Đường dẫn công ty (tuỳ chọn)
        </label>
        <input
          name="slug"
          value={customSlug}
          onChange={(e) => setCustomSlug(e.target.value)}
          className="w-full rounded-lg border border-umber/20 bg-white px-3 py-2"
          placeholder={slugify(companyName) || "cong-ty-abc"}
        />
        <p className="mt-1 text-xs text-umber/70">
          Xem trước: /{slugify(customSlug || companyName) || "..."}/board
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Logo công ty</label>
        <input
          name="logo"
          type="file"
          accept="image/*"
          className="w-full text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Tên hiển thị của bạn</label>
        <input
          name="displayName"
          required
          className="w-full rounded-lg border border-umber/20 bg-white px-3 py-2"
          placeholder="VD: Nguyễn Văn A"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Email admin</label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-umber/20 bg-white px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-umber/20 bg-white px-3 py-2"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-peach px-6 py-3 font-heading text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Đang tạo..." : "Tạo công ty"}
      </button>
      <p className="text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-peach underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
