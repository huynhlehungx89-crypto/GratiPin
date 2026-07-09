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

function PushPinIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <circle cx="12" cy="7" r="5" fill="#e74c3c" />
      <path d="M12 12 L10 22 L14 22 Z" fill="#95a5a6" />
    </svg>
  );
}

function FloralCorner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.5" />
      <circle cx="22" cy="10" r="3" fill="currentColor" opacity="0.35" />
      <path
        d="M8 24 Q16 18 28 26"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.45"
      />
    </svg>
  );
}

function PinMeta({
  authorLabel,
  recipientName,
}: {
  authorLabel: string;
  recipientName?: string | null;
}) {
  return (
    <div className="mt-2 text-xs text-umber/60">
      <p>{authorLabel}</p>
      {recipientName && <p>→ {recipientName}</p>}
    </div>
  );
}

function ExportLogo({ companyLogoUrl }: { companyLogoUrl?: string | null }) {
  if (!companyLogoUrl) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={companyLogoUrl}
      alt=""
      className="absolute bottom-1 right-1 hidden h-5 w-5 rounded-full opacity-80 export-only"
      data-export-logo
    />
  );
}

function NotePin({
  pin,
  authorLabel,
  companyLogoUrl,
  onClick,
}: {
  pin: PinDisplay;
  authorLabel: string;
  companyLogoUrl?: string | null;
  onClick?: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className="relative w-44 cursor-pointer rounded-sm border border-umber/10 bg-[#fffef8] p-3 shadow-[2px_3px_8px_rgba(74,59,50,0.15)] transition hover:scale-105 sm:w-52"
      style={{
        backgroundImage:
          "repeating-linear-gradient(transparent, transparent 23px, rgba(74,59,50,0.08) 23px, rgba(74,59,50,0.08) 24px)",
      }}
      data-pin-id={pin.id}
      data-pin-export
    >
      <PushPinIcon
        className="absolute -top-2 left-1/2 h-5 w-5 -translate-x-1/2"
        style={{ transform: `translateX(-50%) rotate(${pin.rotation * 0.4}deg)` }}
      />
      <p className="font-handwriting pt-3 text-sm leading-6 text-umber whitespace-pre-wrap break-words">
        {pin.content}
      </p>
      {pin.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pin.image_url}
          alt=""
          className="absolute bottom-3 right-2 h-14 w-14 rotate-3 rounded border-2 border-white object-cover shadow-sm"
        />
      )}
      <PinMeta authorLabel={authorLabel} recipientName={pin.recipient_name} />
      <ExportLogo companyLogoUrl={companyLogoUrl} />
    </article>
  );
}

function PolaroidPin({
  pin,
  authorLabel,
  companyLogoUrl,
  onClick,
}: {
  pin: PinDisplay;
  authorLabel: string;
  companyLogoUrl?: string | null;
  onClick?: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className="relative w-44 cursor-pointer bg-white p-2 pb-10 shadow-[4px_6px_14px_rgba(74,59,50,0.25)] transition hover:scale-105 sm:w-52"
      data-pin-id={pin.id}
      data-pin-export
    >
      <div className="absolute -right-1 top-6 h-8 w-3 rotate-12 bg-butter/50" aria-hidden />
      {pin.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pin.image_url} alt="" className="aspect-square w-full object-cover" />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-umber/5 text-xs text-umber/40">
          Chưa có ảnh
        </div>
      )}
      <p className="mt-2 text-center font-handwriting text-sm text-umber whitespace-pre-wrap break-words">
        {pin.content}
      </p>
      <PinMeta authorLabel={authorLabel} recipientName={pin.recipient_name} />
      <ExportLogo companyLogoUrl={companyLogoUrl} />
    </article>
  );
}

function FloralPin({
  pin,
  authorLabel,
  companyLogoUrl,
  onClick,
}: {
  pin: PinDisplay;
  authorLabel: string;
  companyLogoUrl?: string | null;
  onClick?: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className="relative w-44 cursor-pointer rounded-lg border-2 border-peach/40 bg-gradient-to-br from-[#fce4ec] to-[#fff8f0] p-3 shadow-md transition hover:scale-105 sm:w-52"
      style={{ boxShadow: "inset 0 0 0 1px rgba(244,169,155,0.35)" }}
      data-pin-id={pin.id}
      data-pin-export
    >
      <FloralCorner className="absolute -left-1 -top-1 h-10 w-10 text-peach" />
      <FloralCorner className="absolute -bottom-1 -right-1 h-10 w-10 rotate-180 text-mint" />
      {pin.image_url && (
        <div className="mb-2 rounded-md border border-peach/30 p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pin.image_url} alt="" className="max-h-28 w-full rounded object-cover" />
        </div>
      )}
      <p className="font-heading text-sm text-umber whitespace-pre-wrap break-words">{pin.content}</p>
      <PinMeta authorLabel={authorLabel} recipientName={pin.recipient_name} />
      <ExportLogo companyLogoUrl={companyLogoUrl} />
    </article>
  );
}

function WashiPin({
  pin,
  authorLabel,
  companyLogoUrl,
  onClick,
}: {
  pin: PinDisplay;
  authorLabel: string;
  companyLogoUrl?: string | null;
  onClick?: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className="relative w-44 cursor-pointer rounded border border-umber/10 bg-[#e8dcc8] p-3 shadow-sm transition hover:scale-105 sm:w-52"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.25) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(74,59,50,0.04) 0%, transparent 40%)",
      }}
      data-pin-id={pin.id}
      data-pin-export
    >
      <div
        className="absolute -left-2 -top-2 h-5 w-16 -rotate-12 opacity-90"
        style={{
          background:
            "repeating-linear-gradient(90deg, #F4A99B 0 6px, #fff 6px 12px)",
        }}
        aria-hidden
      />
      <div
        className="absolute -bottom-1 -right-2 h-5 w-16 rotate-[18deg] opacity-90"
        style={{
          background:
            "repeating-linear-gradient(45deg, #A9CBB7 0 4px, #F2C879 4px 8px)",
        }}
        aria-hidden
      />
      <p className="relative font-handwriting text-sm text-umber whitespace-pre-wrap break-words">
        {pin.content}
      </p>
      {pin.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pin.image_url}
          alt=""
          className="relative mt-2 max-h-24 w-4/5 -rotate-2 border-4 border-white object-cover shadow"
        />
      )}
      <PinMeta authorLabel={authorLabel} recipientName={pin.recipient_name} />
      <ExportLogo companyLogoUrl={companyLogoUrl} />
    </article>
  );
}

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

  const props = { pin, authorLabel, companyLogoUrl, onClick };

  switch (pin.template) {
    case "note":
      return <NotePin {...props} />;
    case "polaroid":
      return <PolaroidPin {...props} />;
    case "floral":
      return <FloralPin {...props} />;
    case "washi":
      return <WashiPin {...props} />;
    default:
      return <NotePin {...props} />;
  }
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
    <div className="relative inline-block bg-cream p-4" id={`pin-export-${pin.id}`}>
      <PinCardInner pin={pin} companyLogoUrl={companyLogoUrl} />
      <p className="mt-2 text-xs text-umber/50">{TEMPLATE_LABELS[pin.template]}</p>
    </div>
  );
}
