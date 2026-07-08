"use client";

import { useState } from "react";
import Link from "next/link";
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
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
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
          className="w-full rounded-lg border border-umber/20 bg-white px-3 py-2"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-peach px-6 py-3 font-heading text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
      <p className="text-center text-sm">
        Chưa có công ty?{" "}
        <Link href="/signup" className="text-peach underline">
          Đăng ký mới
        </Link>
      </p>
    </form>
  );
}
