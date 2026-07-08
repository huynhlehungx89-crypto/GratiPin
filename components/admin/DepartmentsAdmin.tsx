"use client";

import { useState } from "react";
import {
  archiveDepartment,
  createDepartment,
  enableBoardEmbed,
  updateBoardSkin,
} from "@/lib/actions/admin";
import { SKIN_LABELS, type BoardSkin } from "@/lib/utils/board";

type DeptRow = {
  id: string;
  name: string;
  status: string;
  board: { id: string; skin: BoardSkin; embed_enabled: boolean; embed_token: string | null };
};

export function DepartmentsAdmin({
  companySlug,
  departments,
  baseUrl,
}: {
  companySlug: string;
  departments: DeptRow[];
  baseUrl: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [embedCode, setEmbedCode] = useState<string | null>(null);

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
    });
    if (result.error) setError(result.error);
    else window.location.reload();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="rounded-xl border border-umber/10 bg-white p-6">
        <h2 className="font-heading text-lg mb-4">Tạo phòng ban mới</h2>
        <div className="flex flex-wrap gap-3">
          <input name="name" required placeholder="Tên phòng ban" className="rounded-lg border px-3 py-2" />
          <select name="skin" defaultValue="wood" className="rounded-lg border px-3 py-2">
            {(Object.keys(SKIN_LABELS) as BoardSkin[]).map((s) => (
              <option key={s} value={s}>{SKIN_LABELS[s]}</option>
            ))}
          </select>
          <button type="submit" className="rounded-full bg-peach px-4 py-2 text-white text-sm">Tạo</button>
        </div>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {embedCode && (
        <div className="rounded-xl bg-mint/20 p-4 text-sm">
          <p className="mb-2 font-medium">Mã nhúng:</p>
          <code className="block break-all">{embedCode}</code>
        </div>
      )}

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
                <select
                  value={d.board.skin}
                  onChange={async (e) => {
                    await updateBoardSkin(companySlug, d.board.id, e.target.value as BoardSkin);
                    window.location.reload();
                  }}
                  className="rounded-lg border px-2 py-1 text-sm"
                >
                  {(Object.keys(SKIN_LABELS) as BoardSkin[]).map((s) => (
                    <option key={s} value={s}>{SKIN_LABELS[s]}</option>
                  ))}
                </select>
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
                <button
                  type="button"
                  className="text-sm text-peach underline"
                  onClick={async () => {
                    const r = await enableBoardEmbed(companySlug, d.board.id);
                    if (r.error) alert(r.error);
                    else if (r.token) {
                      setEmbedCode(
                        `<iframe src="${baseUrl}/embed/${d.board.id}?token=${r.token}" width="100%" height="600" frameborder="0"></iframe>`
                      );
                    }
                  }}
                >
                  Cho phép nhúng
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
