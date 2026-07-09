"use client";

import { useState } from "react";
import type { PinDisplay } from "./PinCard.types";
import { TEMPLATE_LABELS } from "@/lib/utils/board";
import { EditPinModal } from "./EditPinModal";
import { PinModal } from "./PinModal";
import { SharePinButton } from "./SharePinButton";
import { renderPinVariant } from "./templates/variants";

export type { PinDisplay } from "./PinCard.types";

export function PinCard({
  pin,
  companyLogoUrl,
  companySlug,
  canShare = true,
  canEdit = false,
}: {
  pin: PinDisplay;
  companyLogoUrl?: string | null;
  companySlug?: string;
  canShare?: boolean;
  canEdit?: boolean;
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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
    onClick: () => setViewOpen(true),
  };

  return (
    <>
      <div className="relative">
        {renderPinVariant(pin.template, variantProps)}
        <div className="mt-1 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {canEdit && companySlug && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="text-xs text-umber/70 hover:text-peach"
            >
              Sửa
            </button>
          )}
          {canShare && !pin.is_hidden && (
            <SharePinButton pinId={pin.id} pin={pin} companyLogoUrl={companyLogoUrl} />
          )}
        </div>
      </div>
      {viewOpen && (
        <PinModal pin={pin} companyLogoUrl={companyLogoUrl} onClose={() => setViewOpen(false)} />
      )}
      {editOpen && companySlug && (
        <EditPinModal
          pin={pin}
          companySlug={companySlug}
          onClose={() => setEditOpen(false)}
        />
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
