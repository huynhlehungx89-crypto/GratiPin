"use client";

import Link from "next/link";
import { useState } from "react";
import { archiveDepartment, createDepartment } from "@/lib/actions/admin";
import { SKIN_LABELS, type BoardSkin } from "@/lib/utils/board";

type DeptRow = {
  id: string;
  name: string;
  status: string;
  board: { id: string; skin: BoardSkin };
};

type MemberOption = { id: string; display_name: string };

export function DepartmentsAdmin({
  companySlug,
  departments,
  members,
  companyBoardId,
}: {
  companySlug: string;
  departments: DeptRow[];
  members: MemberOption[];
  companyBoardId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const skinValue = String(form.get("skin"));
    let skin: BoardSkin = "wood";
    if (skinValue === "felt") skin = "felt";
    else if (skinValue === "linen") skin = "linen";
    else if (skinValue === "chalkboard") skin = "chalkboard";
    const result = await createDepartment({
      companySlug,
      name: String(form.get("name")),
      skin,
      boardAdminMemberIds: selectedAdmins,
    });
    if (result.error) setError(result.error);
    else window.location.reload();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-umber/10 bg-white p-4">
        <h2 className="font-heading text-lg mb-2">Bảng chung công ty</h2>
        <Link
          href={`/${companySlug}/board/${companyBoardId}/settings`}
          className="text-sm text-peach underline"
        >
          Cài đặt bảng (skin, embed, Board Admin)
        </Link>
      </div>

      <form onSubmit={handleCreate} className="rounded-xl border border-umber/10 bg-white p-6">
        <h2 className="font-heading text-lg mb-4">Tạo phòng ban mới</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <input name="name" required placeholder="Tên phòng ban" className="rounded-lg border px-3 py-2" />
          <select name="skin" defaultValue="wood" className="rounded-lg border px-3 py-2">
            {(Object.keys(SKIN_LABELS) as BoardSkin[]).map((s) => (
              <option key={s} value={s}>{SKIN_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-umber">Board Admin (tuỳ chọn)</p>
          <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-umber/10 p-2">
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedAdmins.includes(m.id)}
                  onChange={(e) => {
                    setSelectedAdmins((prev) =>
                      e.target.checked ? [...prev, m.id] : prev.filter((id) => id !== m.id)
                    );
                  }}
                />
                {m.display_name}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="rounded-full bg-peach px-4 py-2 text-white text-sm">Tạo</button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="space-y-4">
        {departments.map((d) => (
          <div key={d.id} className="rounded-xl border border-umber/10 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-heading text-lg">{d.name}</h3>
                <p className="text-sm text-umber/60">
                  {d.status === "archived" ? "Đã lưu trữ" : "Đang hoạt động"} · {SKIN_LABELS[d.board.skin]}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/${companySlug}/board/${d.board.id}/settings`}
                  className="text-sm text-peach underline"
                >
                  Cài đặt bảng
                </Link>
                {d.status === "active" && (
                  <button
                    type="button"
                    className="text-sm text-red-600 underline"
                    onClick={async () => {
                      if (!confirm("Giải thể phòng ban? Bảng ghim sẽ chuyển sang lưu trữ.")) return;
                      const r = await archiveDepartment(companySlug, d.id);
                      if (r.error) alert(r.error);
                      else window.location.reload();
                    }}
                  >
                    Giải thể
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
