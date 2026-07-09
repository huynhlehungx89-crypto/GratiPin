"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { PinDisplay } from "./PinCard";
import { PinCardExport } from "./PinCard";

export function SharePinButton({
  pinId,
  pin,
  companyLogoUrl,
}: {
  pinId: string;
  pin?: PinDisplay;
  companyLogoUrl?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  async function exportImage() {
    if (!ref.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `gratipin-${pinId}.png`;
      link.href = dataUrl;
      link.click();

      if (navigator.share && navigator.canShare) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `gratipin-${pinId}.png`, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "GratiPin" });
        }
      }
    } finally {
      setSharing(false);
    }
  }

  if (!pin) {
    return (
      <button
        type="button"
        className="text-xs text-peach underline"
        onClick={() => document.getElementById(`pin-export-${pinId}`)?.scrollIntoView()}
      >
        Chia sẻ
      </button>
    );
  }

  return (
    <>
      <div className="fixed -left-[9999px] top-0" ref={ref}>
        <PinCardExport pin={pin} companyLogoUrl={companyLogoUrl} />
      </div>
      <button
        type="button"
        onClick={exportImage}
        disabled={sharing}
        className="pin-share-btn text-xs text-peach underline disabled:opacity-50"
      >
        {sharing ? "..." : "Chia sẻ"}
      </button>
    </>
  );
}
