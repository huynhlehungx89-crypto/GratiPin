"use client";

import { useState } from "react";
import { createPin } from "@/lib/actions/pins";
import { createClient } from "@/lib/supabase/client";
import { resizeImageFile } from "@/lib/utils/image";
import { TemplatePicker } from "./TemplatePicker";
import type { PinTemplate } from "@/lib/utils/board";

type BoardOption = { id: string; label: string };
type MemberOption = { id: string; name: string };

export function CreatePinForm({
  companySlug,
  boards,
  members,
  defaultBoardId,
  disabled,
  inModal,
  onSuccess,
  onCancel,
}: {
  companySlug: string;
  boards: BoardOption[];
  members: MemberOption[];
  defaultBoardId: string;
  disabled?: boolean;
  inModal?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<PinTemplate>("note");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasImage, setHasImage] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const nextHasImage = !!file && file.size > 0;
    setHasImage(nextHasImage);
    if (!nextHasImage && template === "polaroid") {
      setTemplate("note");
    }
  }

  function handleTemplateChange(next: PinTemplate) {
    if (next === "polaroid" && !hasImage) return;
    setTemplate(next);
  }

  if (disabled) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const content = String(form.get("content") ?? "");
    const boardId = String(form.get("boardId") ?? defaultBoardId);
    const recipientMemberId = String(form.get("recipient") ?? "") || null;
    const imageFile = form.get("image") as File | null;

    let imageUrl: string | null = null;
    try {
      if (imageFile && imageFile.size > 0) {
        const supabase = createClient();
        const resized = await resizeImageFile(imageFile);
        const fileName = `pins/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("pin-images")
          .upload(fileName, resized, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("pin-images").getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      if (template === "polaroid" && !imageUrl) {
        setError("Cần thêm ảnh để dùng mẫu Polaroid");
        setLoading(false);
        return;
      }

      const result = await createPin({
        companySlug,
        boardId,
        content,
        template,
        isAnonymous,
        recipientMemberId,
        imageUrl,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={inModal ? "" : "mb-8 rounded-2xl border border-umber/10 bg-white/80 p-6"}
    >
      <h2 className="font-heading text-xl text-umber mb-4">Đăng ghim mới</h2>
      <textarea
        name="content"
        required
        rows={3}
        placeholder="Viết lời biết ơn, kỷ niệm..."
        className="mb-3 w-full rounded-lg border border-umber/20 px-3 py-2"
      />
      <div className="mb-3">
        <TemplatePicker value={template} onChange={handleTemplateChange} hasImage={hasImage} />
      </div>
      <div className="mb-3">
        <label className="text-sm">Bảng đích</label>
        <select
          name="boardId"
          defaultValue={defaultBoardId}
          className="mt-1 w-full rounded-lg border border-umber/20 px-3 py-2"
        >
          {boards.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="text-sm">Người nhận (tuỳ chọn)</label>
        <select name="recipient" className="mt-1 w-full rounded-lg border border-umber/20 px-3 py-2">
          <option value="">— Kỷ niệm chung —</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="text-sm">Ảnh đính kèm</label>
        <input
          name="image"
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-sm"
          onChange={handleImageChange}
        />
      </div>
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        Đăng ẩn danh
      </label>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-peach px-6 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Đang đăng..." : "Đăng ghim"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-umber/20 px-6 py-2 text-umber"
          >
            Huỷ
          </button>
        )}
      </div>
    </form>
  );
}
