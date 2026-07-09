"use client";

import { useRouter } from "next/navigation";
import type { PinDisplay } from "./PinCard.types";
import { PinForm } from "./PinForm";

export function EditPinModal({
  pin,
  companySlug,
  boardLabel,
  onClose,
}: {
  pin: PinDisplay;
  companySlug: string;
  boardLabel?: string;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-umber/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-cream p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <PinForm
          mode="edit"
          companySlug={companySlug}
          pinId={pin.id}
          inModal
          initial={{
            content: pin.content,
            template: pin.template,
            imageUrl: pin.image_url,
            boardLabel,
            recipientName: pin.recipient_name,
            isAnonymous: pin.is_anonymous,
          }}
          onSuccess={() => {
            onClose();
            router.refresh();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
