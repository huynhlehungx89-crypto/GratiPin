"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  enableBoardEmbedAction,
  setBoardAdminsAction,
  updateBoardSkinAction,
} from "@/lib/actions/boardSettings";
import { SKIN_LABELS, type BoardSkin } from "@/lib/utils/board";

type MemberOption = { id: string; display_name: string };

export function BoardSettingsForm({
  companySlug,
  boardId,
  boardLabel,
  skin,
  embedEnabled,
  embedToken,
  baseUrl,
  members,
  boardAdminMemberIds,
  isCompanyAdmin,
  boardHref,
}: {
  companySlug: string;
  boardId: string;
  boardLabel: string;
  skin: BoardSkin;
  embedEnabled: boolean;
  embedToken: string | null;
  baseUrl: string;
  members: MemberOption[];
  boardAdminMemberIds: string[];
  isCompanyAdmin: boolean;
  boardHref: string;
}) {
  const router = useRouter();
  const [currentSkin, setCurrentSkin] = useState(skin);
  const [error, setError] = useState<string | null>(null);
  const [embedCode, setEmbedCode] = useState<string | null>(
    embedEnabled && embedToken
      ? `<iframe src="${baseUrl}/embed/${boardId}?token=${embedToken}" width="100%" height="600" frameborder="0"></iframe>`
      : null
  );
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>(boardAdminMemberIds);
  const [savingAdmins, setSavingAdmins] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-umber">Cài đặt bảng</h1>
          <p className="text-sm text-umber/60">{boardLabel}</p>
        </div>
        <Link href={boardHref} className="text-sm text-peach hover:underline">
          ← Về bảng ghim
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="rounded-xl border border-umber/10 bg-white p-6">
        <h2 className="font-heading text-lg mb-3">Loại bảng (skin)</h2>
        <select
          value={currentSkin}
          onChange={async (e) => {
            const nextSkin = e.target.value as BoardSkin;
            const r = await updateBoardSkinAction(companySlug, boardId, nextSkin);
            if (r.error) setError(r.error);
            else {
              setCurrentSkin(nextSkin);
              router.push(boardHref);
              router.refresh();
            }
          }}
          className="rounded-lg border px-3 py-2"
        >
          {(Object.keys(SKIN_LABELS) as BoardSkin[]).map((s) => (
            <option key={s} value={s}>
              {SKIN_LABELS[s]}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-xl border border-umber/10 bg-white p-6">
        <h2 className="font-heading text-lg mb-3">Nhúng bảng (embed)</h2>
        <p className="mb-3 text-sm text-umber/60">
          Bật nhúng để lấy mã iframe dán vào website khác.
        </p>
        <button
          type="button"
          className="rounded-full bg-peach px-4 py-2 text-sm text-white"
          onClick={async () => {
            const r = await enableBoardEmbedAction(companySlug, boardId);
            if (r.error) setError(r.error);
            else if (r.token) {
              setEmbedCode(
                `<iframe src="${baseUrl}/embed/${boardId}?token=${r.token}" width="100%" height="600" frameborder="0"></iframe>`
              );
            }
          }}
        >
          {embedEnabled ? "Tạo lại mã nhúng" : "Cho phép nhúng"}
        </button>
        {embedCode && (
          <div className="mt-4 rounded-lg bg-mint/20 p-4 text-sm">
            <p className="mb-2 font-medium">Mã nhúng:</p>
            <code className="block break-all">{embedCode}</code>
          </div>
        )}
      </section>

      {isCompanyAdmin && (
        <section className="rounded-xl border border-umber/10 bg-white p-6">
          <h2 className="font-heading text-lg mb-3">Board Admin</h2>
          <p className="mb-3 text-sm text-umber/60">
            Gán thành viên quản lý riêng bảng này (ẩn ghim, đổi skin, embed, kiểm duyệt trong phạm vi bảng).
          </p>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-umber/10 p-3">
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
          <button
            type="button"
            disabled={savingAdmins}
            className="mt-3 rounded-full bg-peach px-4 py-2 text-sm text-white disabled:opacity-50"
            onClick={async () => {
              setSavingAdmins(true);
              const r = await setBoardAdminsAction(companySlug, boardId, selectedAdmins);
              setSavingAdmins(false);
              if (r.error) setError(r.error);
              else window.location.reload();
            }}
          >
            {savingAdmins ? "Đang lưu..." : "Lưu Board Admin"}
          </button>
        </section>
      )}
    </div>
  );
}
