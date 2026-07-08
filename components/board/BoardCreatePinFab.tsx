"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatePinForm } from "@/components/pin/CreatePinForm";

type BoardOption = { id: string; label: string };
type MemberOption = { id: string; name: string };

export function BoardCreatePinFab({
  companySlug,
  boards,
  members,
  defaultBoardId,
  disabled,
}: {
  companySlug: string;
  boards: BoardOption[];
  members: MemberOption[];
  defaultBoardId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (disabled) return null;

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Thêm ghim"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-peach text-3xl leading-none text-white shadow-lg transition hover:scale-105 hover:bg-peach/90"
      >
        +
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-umber/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-cream p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CreatePinForm
              companySlug={companySlug}
              boards={boards}
              members={members}
              defaultBoardId={defaultBoardId}
              inModal
              onSuccess={handleSuccess}
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
