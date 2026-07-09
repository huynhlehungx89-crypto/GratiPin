"use client";

import type { PinTemplate } from "@/lib/utils/board";
import { ALL_TEMPLATES, TEMPLATE_LABELS } from "@/lib/utils/board";
import { renderPinVariant } from "./templates/variants";

const PREVIEW_PLACEHOLDER_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
      <rect width="200" height="150" fill="#e9e2d6"/>
      <circle cx="100" cy="62" r="22" fill="#d4cbb8"/>
      <path d="M55 120 Q100 88 145 120" stroke="#d4cbb8" stroke-width="8" fill="none" stroke-linecap="round"/>
    </svg>`
  );

function previewPin(template: PinTemplate, hasImage: boolean) {
  return {
    id: `preview-${template}`,
    content: "Cảm ơn bạn!",
    image_url:
      hasImage || template === "polaroid" ? PREVIEW_PLACEHOLDER_IMAGE : null,
    recipient_name: null,
    is_edited: false,
    edited_at: null,
  };
}

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
      <p className="mb-1.5 text-sm font-medium text-umber/80">Mẫu ghim</p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {ALL_TEMPLATES.map((t) => {
          const disabled = t === "polaroid" && !hasImage;
          const selected = value === t;
          const pin = previewPin(t, hasImage);

          return (
            <button
              key={t}
              type="button"
              disabled={disabled}
              title={TEMPLATE_LABELS[t]}
              onClick={() => !disabled && onChange(t)}
              className={`relative overflow-hidden rounded-xl border p-1.5 text-left transition ${
                selected
                  ? "border-peach bg-peach/10 ring-2 ring-peach/40"
                  : "border-umber/12 bg-white/80 hover:border-peach/40"
              } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex h-[88px] items-center justify-center overflow-hidden rounded-lg bg-cream/50">
                <div className="origin-center scale-[0.42]">
                  {renderPinVariant(t, {
                    pin,
                    authorLabel: "Bạn",
                    compact: true,
                  })}
                </div>
              </div>
              <span className="mt-1.5 block px-0.5 text-xs font-medium text-umber">
                {TEMPLATE_LABELS[t]}
              </span>
              {disabled && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-umber/25 backdrop-blur-[1px]">
                  <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-umber shadow-sm">
                    🔒 Cần ảnh
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
