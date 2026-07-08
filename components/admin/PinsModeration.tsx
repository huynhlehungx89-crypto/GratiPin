"use client";

import { hidePin } from "@/lib/actions/admin";

type PinRow = {
  id: string;
  content: string;
  is_anonymous: boolean;
  is_hidden: boolean;
  author_name: string;
  board_label: string;
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
  const filtered = boardFilter
    ? pins.filter((p) => p.board_label === boardFilter)
    : pins;

  return (
    <div>
      <div className="mb-4 flex gap-2 flex-wrap">
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

      <div className="space-y-3">
        {filtered.map((pin) => (
          <div key={pin.id} className="rounded-xl border border-umber/10 bg-white p-4">
            <p className="text-sm text-umber/60 mb-1">
              {pin.board_label} · {pin.is_anonymous ? `Ẩn danh (thật: ${pin.author_name})` : pin.author_name}
              {pin.is_hidden && " · Đã ẩn"}
            </p>
            <p className="text-umber">{pin.content}</p>
            {!pin.is_hidden && (
              <button
                type="button"
                className="mt-2 text-sm text-red-600 underline"
                onClick={async () => {
                  if (!confirm("Ẩn ghim này?")) return;
                  const r = await hidePin(companySlug, pin.id);
                  if (r.error) alert(r.error);
                  else window.location.reload();
                }}
              >
                Ẩn ghim
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
