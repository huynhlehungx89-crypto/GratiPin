"use client";

import { useState } from "react";
import {
  changePasswordAction,
  updateDisplayNameAction,
} from "@/lib/actions/account";

export function AccountSettings({
  companySlug,
  displayName,
  email,
  departments,
}: {
  companySlug: string;
  displayName: string;
  email: string;
  departments: string[];
}) {
  const [name, setName] = useState(displayName);
  const [nameMsg, setNameMsg] = useState<string | null>(null);
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setNameLoading(true);
    setNameMsg(null);
    const r = await updateDisplayNameAction({ companySlug, displayName: name });
    setNameLoading(false);
    if (r.error) setNameMsg(r.error);
    else setNameMsg("Đã cập nhật tên hiển thị");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwLoading(true);
    setPwMsg(null);
    const r = await changePasswordAction({
      email,
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setPwLoading(false);
    if (r.error) setPwMsg(r.error);
    else {
      setPwMsg("Đã đổi mật khẩu");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-umber/10 bg-white p-6">
        <h2 className="font-heading text-lg text-umber mb-4">Tên hiển thị</h2>
        <form onSubmit={saveName} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-umber/20 px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={nameLoading}
            className="rounded-full bg-peach px-5 py-2 text-sm text-white disabled:opacity-50"
          >
            {nameLoading ? "Đang lưu..." : "Lưu"}
          </button>
        </form>
        {nameMsg && (
          <p className={`mt-2 text-sm ${nameMsg.startsWith("Đã") ? "text-mint" : "text-red-600"}`}>
            {nameMsg}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-umber/10 bg-white p-6">
        <h2 className="font-heading text-lg text-umber mb-4">Đổi mật khẩu</h2>
        <form onSubmit={savePassword} className="space-y-3 max-w-md">
          <input
            type="password"
            placeholder="Mật khẩu hiện tại"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-umber/20 px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-umber/20 px-3 py-2"
            minLength={8}
            required
          />
          <input
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-umber/20 px-3 py-2"
            required
          />
          <button
            type="submit"
            disabled={pwLoading}
            className="rounded-full bg-peach px-5 py-2 text-sm text-white disabled:opacity-50"
          >
            {pwLoading ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </form>
        {pwMsg && (
          <p className={`mt-2 text-sm ${pwMsg.startsWith("Đã") ? "text-mint" : "text-red-600"}`}>
            {pwMsg}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-umber/10 bg-white p-6">
        <h2 className="font-heading text-lg text-umber mb-3">Phòng ban của bạn</h2>
        <p className="mb-2 text-sm text-umber/60">Chỉ xem — Admin công ty quản lý việc gán phòng ban.</p>
        {departments.length === 0 ? (
          <p className="text-sm text-umber/70">Chưa thuộc phòng ban nào</p>
        ) : (
          <ul className="list-inside list-disc text-sm text-umber">
            {departments.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
