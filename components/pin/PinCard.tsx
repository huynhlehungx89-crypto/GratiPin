"use client";

import { useState } from "react";
import type { PinDisplay } from "./PinCard.types";
import { TEMPLATE_LABELS } from "@/lib/utils/board";
import { PinModal } from "./PinModal";
import { SharePinButton } from "./SharePinButton";
import { renderPinVariant } from "./templates/variants";

export type { PinDisplay } from "./PinCard.types";

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

  const authorLabel =
    pin.is_anonymous && !pin.show_real_author
      ? "Ẩn danh"
      : pin.show_real_author
        ? `${pin.author_name} (thật: ${pin.author_real_name})`
        : pin.author_name;

  const variantProps = {
    pin,
    authorLabel,
    companyLogoUrl,
    onClick: () => setOpen(true),
  };

  return (
    <>
      <div className="relative">
        {renderPinVariant(pin.template, variantProps)}
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

export function PinCardExport({
  pin,
  companyLogoUrl,
}: {
  pin: PinDisplay;
  companyLogoUrl?: string | null;
}) {
  const authorLabel =
    pin.is_anonymous && !pin.show_real_author
      ? "Ẩn danh"
      : pin.show_real_author
        ? `${pin.author_name} (thật: ${pin.author_real_name})`
        : pin.author_name;

  return (
    <div className="relative inline-block bg-cream p-4" id={`pin-export-${pin.id}`}>
      {renderPinVariant(pin.template, { pin, authorLabel, companyLogoUrl })}
      <p className="mt-2 text-xs text-umber/50">{TEMPLATE_LABELS[pin.template]}</p>
    </div>
  );
}
