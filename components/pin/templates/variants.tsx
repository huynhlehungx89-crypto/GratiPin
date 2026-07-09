"use client";

import type { PinTemplate } from "@/lib/utils/board";
import { normalizePinTemplate } from "@/lib/utils/board";
import { pinHasText } from "@/lib/pins/contentValidation";
import {
  FloralBottomGrassSvg,
  FloralCornerSvg,
  GardenGrassSvg,
  SunshineRaysSvg,
} from "./svg";

type PinThumbProps = { gradient: string };

export function PinThumb({ gradient }: PinThumbProps) {
  return (
    <div
      className="absolute left-1/2 top-[-9px] z-[5] h-4 w-4 -translate-x-1/2 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.25)]"
      style={{ background: gradient }}
      aria-hidden
    />
  );
}

export function PinMeta({
  authorLabel,
  recipientName,
  isEdited,
  editedAt,
  className = "",
}: {
  authorLabel: string;
  recipientName?: string | null;
  isEdited?: boolean;
  editedAt?: string | null;
  className?: string;
}) {
  return (
    <div className={`text-[11px] text-[#a3937f] ${className}`}>
      <p>{authorLabel}</p>
      {recipientName && <p>→ {recipientName}</p>}
      {isEdited && editedAt && (
        <p className="mt-1 text-[10px] text-umber/45">
          (đã chỉnh sửa · {new Date(editedAt).toLocaleString("vi-VN")})
        </p>
      )}
    </div>
  );
}

export function ExportLogo({
  companyLogoUrl,
  forExport,
}: {
  companyLogoUrl?: string | null;
  forExport?: boolean;
}) {
  if (!companyLogoUrl) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={companyLogoUrl}
      alt=""
      crossOrigin={forExport ? "anonymous" : undefined}
      className={`absolute bottom-1 right-1 h-5 w-5 rounded-full opacity-80 ${forExport ? "block" : "hidden export-only"}`}
      data-export-logo
    />
  );
}

export type PinVariantProps = {
  pin: {
    id: string;
    content: string;
    image_url: string | null;
    recipient_name?: string | null;
    is_edited?: boolean;
    edited_at?: string | null;
  };
  authorLabel: string;
  companyLogoUrl?: string | null;
  onClick?: () => void;
  compact?: boolean;
  /** Export/share capture — no CSS filter, box-shadow instead */
  forExport?: boolean;
};

function metaProps(pin: PinVariantProps["pin"], authorLabel: string, className?: string) {
  return {
    authorLabel,
    recipientName: pin.recipient_name,
    isEdited: pin.is_edited,
    editedAt: pin.edited_at,
    className,
  };
}

const PIN_BASE =
  "relative inline-block w-[190px] cursor-pointer transition hover:scale-105 filter drop-shadow-[0_6px_10px_rgba(74,59,50,0.18)]";
const PIN_BASE_COMPACT =
  "relative inline-block w-[190px] filter drop-shadow-[0_4px_8px_rgba(74,59,50,0.15)] pointer-events-none";
const PIN_BASE_EXPORT =
  "relative inline-block w-[190px] pointer-events-none shadow-[0_6px_10px_rgba(74,59,50,0.18)]";
const pinBase = (compact?: boolean, forExport?: boolean) => {
  if (forExport) return PIN_BASE_EXPORT;
  return compact ? PIN_BASE_COMPACT : PIN_BASE;
};

function PinImage({
  src,
  className,
  forExport,
}: {
  src: string;
  className: string;
  forExport?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={className}
      crossOrigin={forExport ? "anonymous" : undefined}
    />
  );
}

function PinBodyText({ content, className }: { content: string; className: string }) {
  if (!pinHasText(content)) return null;
  return <p className={`whitespace-pre-wrap break-words ${className}`}>{content.trim()}</p>;
}

export function NotePinVariant({ pin, authorLabel, companyLogoUrl, onClick, compact, forExport }: PinVariantProps) {
  return (
    <article
      onClick={onClick}
      className={`${pinBase(compact, forExport)} rounded-sm bg-[#fffaf0]`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(180deg, transparent, transparent 21px, #e7dcc8 22px)",
      }}
      data-pin-id={pin.id}
      data-pin-export
    >
      <PinThumb gradient="radial-gradient(circle at 35% 35%, #ff8a7a, #d64545)" />
      <div className="px-3.5 pb-3 pt-2">
        <PinBodyText
          content={pin.content}
          className="pt-1.5 font-handwriting text-[15.5px] leading-normal text-umber"
        />
        {pin.image_url && (
          <PinImage
            src={pin.image_url}
            forExport={forExport}
            className="absolute bottom-3 right-2 h-14 w-14 rotate-3 rounded border-2 border-white object-cover shadow-sm"
          />
        )}
        <PinMeta {...metaProps(pin, authorLabel, "mt-2.5")} />
      </div>
      <ExportLogo companyLogoUrl={companyLogoUrl} forExport={forExport} />
    </article>
  );
}

export function PolaroidPinVariant({ pin, authorLabel, companyLogoUrl, onClick, compact, forExport }: PinVariantProps) {
  if (!pin.image_url) {
    return <NotePinVariant pin={pin} authorLabel={authorLabel} companyLogoUrl={companyLogoUrl} onClick={onClick} compact={compact} forExport={forExport} />;
  }
  return (
    <article
      onClick={onClick}
      className={`${pinBase(compact, forExport)} rounded-sm bg-white pb-0 pt-2`}
      data-pin-id={pin.id}
      data-pin-export
    >
      <PinThumb gradient="radial-gradient(circle at 35% 35%, #ffd27a, #c9871f)" />
      <PinImage
        src={pin.image_url}
        forExport={forExport}
        className="block h-[130px] w-full object-cover bg-[#e9e2d6]"
      />
      <PinBodyText
        content={pin.content}
        className="px-1.5 pb-4 pt-2 text-center font-handwriting text-[14.5px] leading-snug text-umber"
      />
      <div className="px-2 pb-2">
        <PinMeta {...metaProps(pin, authorLabel)} />
      </div>
      <ExportLogo companyLogoUrl={companyLogoUrl} forExport={forExport} />
    </article>
  );
}

export function FloralPinVariant({ pin, authorLabel, companyLogoUrl, onClick, compact, forExport }: PinVariantProps) {
  return (
    <article
      onClick={onClick}
      className={`${pinBase(compact, forExport)} overflow-hidden rounded-[10px] border border-[#f0d3c8] bg-gradient-to-br from-[#fdeee7] to-[#fbf3e7] to-60%`}
      data-pin-id={pin.id}
      data-pin-export
    >
      <div
        className="pointer-events-none absolute inset-[6px] rounded-md border border-[#f5ddd0]"
        aria-hidden
      />
      <PinThumb gradient="radial-gradient(circle at 35% 35%, #c9e3d1, #7fae8f)" />
      <FloralCornerSvg className="absolute left-1 top-1 z-[2] h-[30px] w-[30px] opacity-90" />
      <FloralCornerSvg className="absolute bottom-1 right-1 z-[2] h-[30px] w-[30px] rotate-180 opacity-90" />
      {pin.image_url && (
        <div className="relative z-[2] mx-2 mb-2 mt-3 rounded-md border border-peach/30 p-1">
          <PinImage
            src={pin.image_url}
            forExport={forExport}
            className="max-h-28 w-full rounded object-cover"
          />
        </div>
      )}
      <PinBodyText
        content={pin.content}
        className="relative z-[2] px-2.5 pb-1.5 pt-3.5 text-center font-display text-[14.5px] font-medium leading-normal text-[#5c4437]"
      />
      <PinMeta {...metaProps(pin, authorLabel, "relative z-[2] pb-[18px] text-center")} />
      <FloralBottomGrassSvg className="absolute bottom-0 left-0 z-[1] h-3.5 w-full opacity-90" />
      <ExportLogo companyLogoUrl={companyLogoUrl} forExport={forExport} />
    </article>
  );
}

export function WashiPinVariant({ pin, authorLabel, companyLogoUrl, onClick, compact, forExport }: PinVariantProps) {
  return (
    <article
      onClick={onClick}
      className={`${pinBase(compact, forExport)} rounded-sm bg-[#f1e4cf]`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.02) 1px, transparent 1.5px)",
        backgroundSize: "14px 14px",
      }}
      data-pin-id={pin.id}
      data-pin-export
    >
      <div
        className="absolute left-[-12px] top-[-9px] h-5 w-16 -rotate-[40deg] opacity-85 shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
        style={{
          background:
            "repeating-linear-gradient(45deg, rgba(169,203,183,0.75) 0 6px, rgba(244,169,155,0.75) 6px 12px)",
        }}
        aria-hidden
      />
      <div
        className="absolute bottom-[-9px] right-[-12px] h-5 w-16 -rotate-[40deg] opacity-85 shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
        style={{
          background:
            "repeating-linear-gradient(45deg, rgba(169,203,183,0.75) 0 6px, rgba(244,169,155,0.75) 6px 12px)",
        }}
        aria-hidden
      />
      <div className="px-3.5 pb-3 pt-2">
        <PinBodyText
          content={pin.content}
          className="pt-2 font-handwriting text-[15.5px] leading-normal text-umber"
        />
        {pin.image_url && (
          <PinImage
            src={pin.image_url}
            forExport={forExport}
            className="relative mt-2 max-h-24 w-4/5 -rotate-2 border-4 border-white object-cover shadow"
          />
        )}
        <PinMeta {...metaProps(pin, authorLabel, "mt-2.5")} />
      </div>
      <ExportLogo companyLogoUrl={companyLogoUrl} forExport={forExport} />
    </article>
  );
}

export function GardenPinVariant({ pin, authorLabel, companyLogoUrl, onClick, compact, forExport }: PinVariantProps) {
  return (
    <article
      onClick={onClick}
      className={`${pinBase(compact, forExport)} overflow-hidden rounded-xl bg-gradient-to-b from-[#eef7f0] to-[#dcedde]`}
      data-pin-id={pin.id}
      data-pin-export
    >
      <PinThumb gradient="radial-gradient(circle at 35% 35%, #d6e8a8, #8fae5a)" />
      {pin.image_url && (
        <PinImage
          src={pin.image_url}
          forExport={forExport}
          className="mx-auto mb-1 mt-3.5 block h-[88px] w-[88px] rounded-full border-4 border-white object-cover shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
        />
      )}
      {pinHasText(pin.content) ? (
        <p
          className={`whitespace-pre-wrap break-words px-3 text-center font-display text-[14.5px] font-medium leading-normal text-[#3f5c46] ${pin.image_url ? "pt-0" : "pb-[30px] pt-4"}`}
        >
          {pin.content.trim()}
        </p>
      ) : pin.image_url ? (
        <div className="pb-1 pt-2" aria-hidden />
      ) : null}
      <PinMeta
        {...metaProps(
          pin,
          authorLabel,
          `text-center text-[#7a9382] ${pin.image_url ? "-mt-5 pb-[26px]" : "pb-[30px]"}`
        )}
      />
      <GardenGrassSvg className="absolute bottom-0 left-0 h-[22px] w-full" />
      <ExportLogo companyLogoUrl={companyLogoUrl} forExport={forExport} />
    </article>
  );
}

export function SunshinePinVariant({ pin, authorLabel, companyLogoUrl, onClick, compact, forExport }: PinVariantProps) {
  return (
    <article
      onClick={onClick}
      className={`${pinBase(compact, forExport)} overflow-hidden rounded-[10px] bg-[radial-gradient(circle_at_18%_18%,#fff6da_0%,#F2C879_55%,#eaa94f_100%)]`}
      data-pin-id={pin.id}
      data-pin-export
    >
      <div
        className={`absolute left-[-46px] top-[-46px] z-[1] h-[150px] w-[150px] rounded-full ${forExport ? "" : "blur-[3px]"}`}
        style={{
          background: forExport
            ? "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,246,218,0.5) 45%, transparent 75%)"
            : "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,246,218,0.65) 40%, transparent 72%)",
        }}
        aria-hidden
      />
      <SunshineRaysSvg className="absolute left-[-30px] top-[-30px] z-[1] h-[110px] w-[110px] opacity-80" />
      <span className="absolute left-[70px] top-9 z-[1] text-[10px] text-white opacity-85" aria-hidden>
        ✦
      </span>
      <span
        className="absolute left-[92px] top-3 z-[1] text-[8px] text-white opacity-85"
        aria-hidden
      >
        ✦
      </span>
      <PinThumb gradient="radial-gradient(circle at 35% 35%, #fff, #F2C879)" />
      <PinBodyText
        content={pin.content}
        className="relative z-[2] px-3 pt-6 text-center font-display text-[14.5px] font-semibold leading-normal text-[#6b4a1c]"
      />
      <PinMeta {...metaProps(pin, authorLabel, "relative z-[2] px-3 pb-2 text-center text-[#8a6018]")} />
      {pin.image_url && (
        <PinImage
          src={pin.image_url}
          forExport={forExport}
          className="relative z-[2] mx-2.5 mb-3 block h-[100px] w-[calc(100%-20px)] rounded-lg object-cover shadow-[0_0_0_4px_#fff,0_4px_10px_rgba(180,120,20,0.25)]"
        />
      )}
      <ExportLogo companyLogoUrl={companyLogoUrl} forExport={forExport} />
    </article>
  );
}

export function LovePinVariant({ pin, authorLabel, companyLogoUrl, onClick, compact, forExport }: PinVariantProps) {
  return (
    <article
      onClick={onClick}
      className={`${pinBase(compact, forExport)} overflow-hidden rounded bg-[#fff8f6] pt-4`}
      data-pin-id={pin.id}
      data-pin-export
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <span
          className="absolute left-[10%] top-[60%] text-sm text-peach opacity-35"
          style={{ transform: "rotate(-10deg)" }}
        >
          ♥
        </span>
        <span
          className="absolute left-[70%] top-[75%] text-[10px] text-peach opacity-30"
          style={{ transform: "rotate(8deg)" }}
        >
          ♥
        </span>
        <span className="absolute left-[80%] top-[40%] text-xs text-peach opacity-25">♥</span>
      </div>
      <div
        className="absolute left-0 top-0 z-[1] h-[38px] w-full"
        style={{
          background:
            "linear-gradient(135deg, transparent 50%, #fbe4dd 50%) top left / 50% 100% no-repeat, linear-gradient(225deg, transparent 50%, #fbe4dd 50%) top right / 50% 100% no-repeat",
        }}
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-[22px] z-[5] flex h-[26px] w-[26px] -translate-x-1/2 items-center justify-center rounded-full text-xs text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
        style={{ background: "radial-gradient(circle at 35% 35%, #f4a99b, #d6685a)" }}
        aria-hidden
      >
        ♥
      </div>
      <PinBodyText
        content={pin.content}
        className="relative z-[2] px-4 pb-3.5 pt-5 text-center font-handwriting text-[15.5px] leading-snug text-[#5c4437]"
      />
      <PinMeta {...metaProps(pin, authorLabel, "relative z-[2] pb-3 text-center")} />
      {pin.image_url && (
        <PinImage
          src={pin.image_url}
          forExport={forExport}
          className="relative z-[2] mx-4 mb-3 block h-[90px] w-[calc(100%-32px)] rounded-md border-[3px] border-white object-cover shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
        />
      )}
      <ExportLogo companyLogoUrl={companyLogoUrl} forExport={forExport} />
    </article>
  );
}

export function renderPinVariant(
  template: PinTemplate | string,
  props: PinVariantProps
): React.ReactNode {
  const safeTemplate = normalizePinTemplate(template);
  const safeProps = { ...props, pin: { ...props.pin, content: props.pin.content ?? "" } };

  switch (safeTemplate) {
    case "note":
      return <NotePinVariant {...safeProps} />;
    case "polaroid":
      return <PolaroidPinVariant {...safeProps} />;
    case "floral":
      return <FloralPinVariant {...safeProps} />;
    case "washi":
      return <WashiPinVariant {...safeProps} />;
    case "garden":
      return <GardenPinVariant {...safeProps} />;
    case "sunshine":
      return <SunshinePinVariant {...safeProps} />;
    case "love":
      return <LovePinVariant {...safeProps} />;
    default:
      return <NotePinVariant {...safeProps} />;
  }
}
