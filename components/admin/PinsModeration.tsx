"use client";

import { useRouter } from "next/navigation";
import { approvePinAction, rejectPinAction } from "@/lib/actions/moderation";

type PinRow = {
  id: string;
  content: string;
  is_anonymous: boolean;
  author_name: string;
  board_label: string;
  created_at: string;
};

export function PinsModeration({
  companySlug,
  pins,
  boardFilter,
  boards,
}: {
  companySlug: string;
  pins: PinRow[];
  boardFilter: string;
  boards: { id: string; label: string }[];
}) {
  const router = useRouter();
  const filtered = boardFilter
    ? pins.filter((p) => p.board_label === boardFilter)
    : pins;

  async function handleApprove(pinId: string) {
    const r = await approvePinAction(companySlug, pinId);
    if (r.error) alert(r.error);
    else router.refresh();
  }

  async function handleReject(pinId: string) {
    if (!confirm("Từ chối ghim này? Ghim sẽ bị ẩn khỏi bảng công khai.")) return;
    const r = await rejectPinAction(companySlug, pinId);
    if (r.error) alert(r.error);
    else router.refresh();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <a
          href={`/${companySlug}/admin/pins`}
          className={`rounded-full px-3 py-1 text-sm ${!boardFilter ? "bg-peach text-white" : "bg-white"}`}
        >
          Tất cả
        </a>
        {boards.map((b) => (
          <a
            key={b.id}
            href={`/${companySlug}/admin/pins?board=${encodeURIComponent(b.label)}`}
            className={`rounded-full px-3 py-1 text-sm ${boardFilter === b.label ? "bg-peach text-white" : "bg-white"}`}
          >
            {b.label}
          </a>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-umber/10 bg-white p-6 text-sm text-umber/70">
          Không còn ghim chờ kiểm duyệt.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((pin) => (
            <div
              key={pin.id}
              className="flex w-full flex-col gap-3 border-b border-umber/10 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-umber/60">
                  <span className="font-medium text-umber/80">{pin.board_label}</span>
                  <span>
                    {pin.is_anonymous
                      ? `Ẩn danh (thật: ${pin.author_name})`
                      : pin.author_name}
                  </span>
                  <span>{formatDate(pin.created_at)}</span>
                </div>
                <p className="text-umber line-clamp-2">{pin.content || "(ghim chỉ có ảnh)"}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => handleApprove(pin.id)}
                  className="rounded-full bg-mint px-4 py-2 text-sm font-medium text-umber hover:opacity-90"
                >
                  Duyệt
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(pin.id)}
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
