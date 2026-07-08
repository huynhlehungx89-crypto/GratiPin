"use client";

import type { PinDisplay } from "./PinCard";
import { TEMPLATE_LABELS } from "@/lib/utils/board";

export function PinModal({
  pin,
  companyLogoUrl,
  onClose,
}: {
  pin: PinDisplay;
  companyLogoUrl?: string | null;
  onClose: () => void;
}) {
  const authorLabel = pin.is_anonymous && !pin.show_real_author
    ? "Ẩn danh"
    : pin.show_real_author
      ? `${pin.author_name} (thật: ${pin.author_real_name})`
      : pin.author_name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-umber/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] max-w-lg overflow-auto rounded-2xl bg-cream p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 text-xs text-umber/50">{TEMPLATE_LABELS[pin.template]}</div>
        {pin.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pin.image_url} alt="" className="mb-4 max-h-64 w-full rounded-lg object-cover" />
        )}
        <p className="whitespace-pre-wrap text-lg text-umber">{pin.content}</p>
        <div className="mt-4 text-sm text-umber/70">
          <p>Đăng bởi: {authorLabel}</p>
          {pin.recipient_name && <p>Gửi đến: {pin.recipient_name}</p>}
          <p>{new Date(pin.created_at).toLocaleString("vi-VN")}</p>
        </div>
        {companyLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={companyLogoUrl} alt="" className="mt-4 h-8 w-8 rounded-full" />
        )}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-peach py-2 text-white"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
