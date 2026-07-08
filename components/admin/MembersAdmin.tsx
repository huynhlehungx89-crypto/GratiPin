"use client";

import { useState } from "react";
import {
  addMember,
  removeMember,
  setMemberDepartments,
  updateMemberRole,
} from "@/lib/actions/admin";

type Member = {
  id: string;
  display_name: string;
  role: string;
  user_id: string;
};

type Department = { id: string; name: string };

export function MembersAdmin({
  companySlug,
  members,
  departments,
  memberDepartments,
}: {
  companySlug: string;
  members: Member[];
  departments: Department[];
  memberDepartments: { member_id: string; department_id: string }[];
}) {
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await addMember({
      companySlug,
      email: String(form.get("email")),
      displayName: String(form.get("displayName")),
      password: String(form.get("password")),
    });
    if (result.error) setError(result.error);
    else window.location.reload();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="rounded-xl border border-umber/10 bg-white p-6">
        <h2 className="font-heading text-lg mb-4">Thêm thành viên</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="displayName" required placeholder="Tên hiển thị" className="rounded-lg border px-3 py-2" />
          <input name="email" type="email" required placeholder="Email" className="rounded-lg border px-3 py-2" />
          <input name="password" type="password" required minLength={8} placeholder="Mật khẩu tạm" className="rounded-lg border px-3 py-2" />
        </div>
        <button type="submit" className="mt-3 rounded-full bg-peach px-4 py-2 text-white text-sm">
          Thêm
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="rounded-xl border border-umber/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream">
            <tr>
              <th className="px-4 py-3 text-left">Tên</th>
              <th className="px-4 py-3 text-left">Vai trò</th>
              <th className="px-4 py-3 text-left">Phòng ban</th>
              <th className="px-4 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const deptIds = memberDepartments
                .filter((md) => md.member_id === m.id)
                .map((md) => md.department_id);
              return (
                <tr key={m.id} className="border-t border-umber/5">
                  <td className="px-4 py-3">{m.display_name}</td>
                  <td className="px-4 py-3">{m.role === "admin" ? "Admin" : "User"}</td>
                  <td className="px-4 py-3">
                    <MemberDeptSelect
                      companySlug={companySlug}
                      memberId={m.id}
                      departments={departments}
                      selected={deptIds}
                    />
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      type="button"
                      className="text-xs text-peach underline"
                      onClick={async () => {
                        const newRole = m.role === "admin" ? "user" : "admin";
                        const r = await updateMemberRole(companySlug, m.id, newRole);
                        if (r.error) alert(r.error);
                        else window.location.reload();
                      }}
                    >
                      {m.role === "admin" ? "Hạ quyền" : "Lên admin"}
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-600 underline"
                      onClick={async () => {
                        if (!confirm("Xoá thành viên này?")) return;
                        const r = await removeMember(companySlug, m.id);
                        if (r.error) alert(r.error);
                        else window.location.reload();
                      }}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MemberDeptSelect({
  companySlug,
  memberId,
  departments,
  selected,
}: {
  companySlug: string;
  memberId: string;
  departments: Department[];
  selected: string[];
}) {
  const [values, setValues] = useState(selected);

  async function save(next: string[]) {
    setValues(next);
    const r = await setMemberDepartments(companySlug, memberId, next);
    if (r.error) alert(r.error);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {departments.map((d) => (
        <label key={d.id} className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={values.includes(d.id)}
            onChange={(e) => {
              const next = e.target.checked
                ? [...values, d.id]
                : values.filter((id) => id !== d.id);
              save(next);
            }}
          />
          {d.name}
        </label>
      ))}
    </div>
  );
}
