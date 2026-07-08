"use client";

import { useState } from "react";
import type { PinTemplate } from "@/lib/utils/board";
import { TEMPLATE_LABELS } from "@/lib/utils/board";
import { PinModal } from "./PinModal";
import { SharePinButton } from "./SharePinButton";

export type PinDisplay = {
  id: string;
  content: string;
  template: PinTemplate;
  image_url: string | null;
  is_anonymous: boolean;
  is_hidden: boolean;
  created_at: string;
  author_name: string;
  author_real_name?: string;
  show_real_author?: boolean;
  recipient_name?: string | null;
  position_x: number;
  position_y: number;
  rotation: number;
};

const TEMPLATE_STYLES: Record<PinTemplate, string> = {
  note: "bg-[#fff9c4] border border-umber/10 shadow-md rotate-[-1deg] font-body",
  polaroid: "bg-white p-2 pb-8 shadow-lg rotate-[1deg]",
  floral: "bg-[#fce4ec] border-2 border-peach/30 shadow-md rotate-[-0.5deg]",
  washi: "bg-[#f5f0e8] border border-dashed border-butter shadow-sm rotate-[0.5deg]",
};

function PinCardInner({
  pin,
  companyLogoUrl,
  onClick,
}: {
  pin: PinDisplay;
  companyLogoUrl?: string | null;
  onClick?: () => void;
}) {
  const authorLabel = pin.is_anonymous && !pin.show_real_author
    ? "Ẩn danh"
    : pin.show_real_author
      ? `${pin.author_name} (thật: ${pin.author_real_name})`
      : pin.author_name;

  return (
    <article
      onClick={onClick}
      className={`relative w-44 cursor-pointer transition hover:scale-105 sm:w-52 ${TEMPLATE_STYLES[pin.template]}`}
      data-pin-id={pin.id}
      data-pin-export
    >
      {pin.template === "washi" && (
        <>
          <div className="absolute -left-1 -top-2 h-4 w-10 bg-butter/80 rotate-[-8deg]" />
          <div className="absolute -right-1 -top-2 h-4 w-10 bg-mint/80 rotate-[8deg]" />
        </>
      )}
      {pin.template === "floral" && (
        <div className="text-peach/60 text-xs mb-1">✿ ✿</div>
      )}
      {pin.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pin.image_url}
          alt=""
          className={`mb-2 w-full object-cover ${
            pin.template === "polaroid" ? "aspect-square" : "max-h-28 rounded"
          }`}
        />
      )}
      <p className="text-sm text-umber whitespace-pre-wrap break-words">{pin.content}</p>
      <div className="mt-2 text-xs text-umber/60">
        <p>{authorLabel}</p>
        {pin.recipient_name && <p>→ {pin.recipient_name}</p>}
      </div>
      {companyLogoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={companyLogoUrl}
          alt=""
          className="absolute bottom-1 right-1 h-5 w-5 rounded-full opacity-80 hidden export-only"
          data-export-logo
        />
      )}
    </article>
  );
}

export function PinCard({
  pin,
  companyLogoUrl,
  canShare = true,
}: {
  pin: PinDisplay;
  companyLogoUrl?: string | null;
  canShare?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="relative">
        <PinCardInner pin={pin} companyLogoUrl={companyLogoUrl} onClick={() => setOpen(true)} />
        {canShare && !pin.is_hidden && (
          <div className="mt-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
            <SharePinButton pinId={pin.id} pin={pin} companyLogoUrl={companyLogoUrl} />
          </div>
        )}
      </div>
      {open && (
        <PinModal pin={pin} companyLogoUrl={companyLogoUrl} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

export function PinCardExport({ pin, companyLogoUrl }: { pin: PinDisplay; companyLogoUrl?: string | null }) {
  return (
    <div className="relative inline-block p-4 bg-cream" id={`pin-export-${pin.id}`}>
      <PinCardInner pin={pin} companyLogoUrl={companyLogoUrl} />
      <p className="mt-2 text-xs text-umber/50">{TEMPLATE_LABELS[pin.template]}</p>
    </div>
  );
}
