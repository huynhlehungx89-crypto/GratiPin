"use client";

import { useState } from "react";
import { login } from "@/lib/actions/auth";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await login({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div>
        <label className="mb-1 block font-body text-sm font-medium text-umber">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-umber/15 bg-white px-3 py-2.5 font-body text-umber shadow-sm focus:border-peach/50 focus:outline-none focus:ring-2 focus:ring-peach/25"
        />
      </div>
      <div>
        <label className="mb-1 block font-body text-sm font-medium text-umber">Mật khẩu</label>
        <input
          name="password"
          type="password"
          required
          className="w-full rounded-xl border border-umber/15 bg-white px-3 py-2.5 font-body text-umber shadow-sm focus:border-peach/50 focus:outline-none focus:ring-2 focus:ring-peach/25"
        />
      </div>
      {error && <p className="font-body text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-peach px-6 py-3.5 font-heading text-base font-bold text-white shadow-[0_6px_20px_rgba(244,169,155,0.4)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:opacity-50"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
