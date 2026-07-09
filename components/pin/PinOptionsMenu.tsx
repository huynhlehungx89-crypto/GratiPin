"use client";

import { useEffect, useRef, useState } from "react";
import { hidePin } from "@/lib/actions/admin";

export function PinOptionsMenu({
  pinId,
  companySlug,
  canEdit,
  canHide,
  onEdit,
  onHidden,
}: {
  pinId: string;
  companySlug: string;
  canEdit: boolean;
  canHide: boolean;
  onEdit: () => void;
  onHidden: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [hiding, setHiding] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  if (!canEdit && !canHide) return null;

  async function handleHide() {
    if (!confirm("Ẩn ghim này khỏi bảng?")) return;
    setHiding(true);
    const result = await hidePin(companySlug, pinId);
    setHiding(false);
    if (result.error) {
      alert(result.error);
      return;
    }
    setOpen(false);
    onHidden();
  }

  return (
    <div ref={rootRef} className="pin-options-menu relative z-30">
      <button
        type="button"
        aria-label="Tuỳ chọn ghim"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded-full bg-white/90 px-1.5 py-0.5 text-xs text-umber/80 shadow-sm hover:bg-white hover:text-peach"
      >
        ⋯
      </button>
      {open && (
        <div className="pin-options-menu absolute left-full top-0 z-50 ml-1 min-w-[120px] rounded-lg border border-umber/10 bg-white py-1 shadow-lg">
          {canEdit && (
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left text-xs text-umber hover:bg-cream/80"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
            >
              Sửa
            </button>
          )}
          {canHide && (
            <button
              type="button"
              disabled={hiding}
              className="block w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-cream/80 disabled:opacity-50"
              onClick={() => void handleHide()}
            >
              {hiding ? "Đang ẩn..." : "Ẩn ghim"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
