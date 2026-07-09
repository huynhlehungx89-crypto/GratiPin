"use client";

import type { PinTemplate } from "@/lib/utils/board";
import { ALL_TEMPLATES, TEMPLATE_LABELS } from "@/lib/utils/board";

const PREVIEW_STYLES: Record<PinTemplate, string> = {
  note: "bg-[#fffaf0] bg-[repeating-linear-gradient(180deg,transparent,transparent_6px,#e7dcc8_7px)]",
  polaroid: "bg-white border-4 border-white shadow-inner",
  floral: "bg-gradient-to-br from-[#fdeee7] to-[#fbf3e7] border border-[#f0d3c8]",
  washi: "bg-[#f1e4cf]",
  garden: "bg-gradient-to-b from-[#eef7f0] to-[#dcedde]",
  sunshine: "bg-[radial-gradient(circle_at_18%_18%,#fff6da,#F2C879)]",
  love: "bg-[#fff8f6]",
};

export function TemplatePicker({
  value,
  onChange,
  hasImage,
}: {
  value: PinTemplate;
  onChange: (t: PinTemplate) => void;
  hasImage: boolean;
}) {
  return (
    <div>
      <label className="text-sm">Mẫu ghim</label>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ALL_TEMPLATES.map((t) => {
          const disabled = t === "polaroid" && !hasImage;
          const selected = value === t;
          return (
            <button
              key={t}
              type="button"
              disabled={disabled}
              title={
                disabled ? "Cần thêm ảnh để dùng mẫu Polaroid" : TEMPLATE_LABELS[t]
              }
              onClick={() => !disabled && onChange(t)}
              className={`rounded-lg border p-2 text-left transition ${
                selected
                  ? "border-peach bg-peach/10 ring-1 ring-peach"
                  : "border-umber/15 bg-white hover:border-peach/50"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <div
                className={`mb-1.5 h-10 w-full rounded ${PREVIEW_STYLES[t]}`}
                aria-hidden
              />
              <span className="block text-xs font-medium text-umber">
                {TEMPLATE_LABELS[t]}
              </span>
            </button>
          );
        })}
      </div>
      {!hasImage && (
        <p className="mt-1.5 text-xs text-umber/50">
          Cần thêm ảnh để dùng mẫu Polaroid
        </p>
      )}
    </div>
  );
}
