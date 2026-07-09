"use client";

import { useEffect, useState } from "react";
import { createPin, updatePinContentAction } from "@/lib/actions/pins";
import { createClient } from "@/lib/supabase/client";
import {
  hasPinContentOrImage,
  normalizePinContent,
  pinHasText,
  PIN_CONTENT_OR_IMAGE_ERROR,
} from "@/lib/pins/contentValidation";
import { resizeImageFile } from "@/lib/utils/image";
import { TemplatePicker } from "./TemplatePicker";
import {
  FormCheckbox,
  FormFileInput,
  FormLabel,
  FormReadonlyField,
  FormSelect,
  FormTextarea,
} from "./FormControls";
import type { PinTemplate } from "@/lib/utils/board";

type BoardOption = { id: string; label: string };
type MemberOption = { id: string; name: string };

const CONTENT_PLACEHOLDER =
  "Viết lời biết ơn, kỷ niệm... (có thể bỏ trống nếu đã có ảnh)";

export type PinFormProps = {
  mode: "create" | "edit";
  companySlug: string;
  boards?: BoardOption[];
  members?: MemberOption[];
  defaultBoardId?: string;
  pinId?: string;
  initial?: {
    content: string;
    template: PinTemplate;
    imageUrl: string | null;
    boardLabel?: string;
    recipientName?: string | null;
    isAnonymous?: boolean;
  };
  disabled?: boolean;
  inModal?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function PinForm({
  mode,
  companySlug,
  boards = [],
  members = [],
  defaultBoardId = "",
  pinId,
  initial,
  disabled,
  inModal,
  onSuccess,
  onCancel,
}: PinFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<PinTemplate>(initial?.template ?? "note");
  const [isAnonymous, setIsAnonymous] = useState(initial?.isAnonymous ?? false);
  const [hasImage, setHasImage] = useState(!!initial?.imageUrl);
  const [existingImageUrl] = useState(initial?.imageUrl ?? null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [contentText, setContentText] = useState(initial?.content ?? "");

  const canSubmit = pinHasText(contentText) || hasImage;

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (imagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    if (file && file.size > 0) {
      setImagePreviewUrl(URL.createObjectURL(file));
      setHasImage(true);
    } else {
      setImagePreviewUrl(existingImageUrl);
      setHasImage(!!existingImageUrl);
      if (!existingImageUrl && template === "polaroid") {
        setTemplate("note");
      }
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

    const form = new FormData(e.currentTarget);
    const content = normalizePinContent(String(form.get("content") ?? ""));
    const imageFile = form.get("image") as File | null;

    let imageUrl: string | null = mode === "edit" ? existingImageUrl : null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = "pending";
    }

    if (!hasPinContentOrImage(content, imageUrl)) {
      setError(PIN_CONTENT_OR_IMAGE_ERROR);
      return;
    }

    setLoading(true);

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

      if (!hasPinContentOrImage(content, imageUrl)) {
        setError(PIN_CONTENT_OR_IMAGE_ERROR);
        setLoading(false);
        return;
      }

      if (mode === "edit") {
        if (!pinId) {
          setError("Không tìm thấy ghim");
          setLoading(false);
          return;
        }
        const result = await updatePinContentAction({
          companySlug,
          pinId,
          content,
          template,
          imageUrl,
        });
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
      } else {
        const boardId = String(form.get("boardId") ?? defaultBoardId);
        const recipientMemberId = String(form.get("recipient") ?? "") || null;
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
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setLoading(false);
    }
  }

  const isEdit = mode === "edit";

  return (
    <form
      onSubmit={handleSubmit}
      className={inModal ? "" : "mb-8 rounded-2xl border border-umber/10 bg-white/80 p-6"}
    >
      <h2 className="mb-4 font-heading text-xl text-umber">
        {isEdit ? "Sửa ghim" : "Đăng ghim mới"}
      </h2>

      <div className="mb-4">
        <FormLabel>Ảnh</FormLabel>
        {imagePreviewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreviewUrl}
            alt=""
            className="mb-2 max-h-32 w-full rounded-xl border border-umber/10 object-cover"
          />
        )}
        <FormFileInput name="image" onChange={handleImageChange} />
      </div>

      <div className="mb-4">
        <FormLabel htmlFor="pin-content">Nội dung</FormLabel>
        <FormTextarea
          id="pin-content"
          name="content"
          rows={3}
          value={contentText}
          onChange={(e) => setContentText(e.target.value)}
          placeholder={CONTENT_PLACEHOLDER}
        />
      </div>

      <div className="mb-4">
        <TemplatePicker value={template} onChange={handleTemplateChange} hasImage={hasImage} />
      </div>

      {!isEdit && (
        <div className="mb-4">
          <FormLabel htmlFor="pin-board">Bảng đích</FormLabel>
          <FormSelect id="pin-board" name="boardId" defaultValue={defaultBoardId}>
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </FormSelect>
        </div>
      )}
      {isEdit && initial?.boardLabel && (
        <div className="mb-4">
          <FormReadonlyField label="Bảng đích" value={initial.boardLabel} />
        </div>
      )}

      {!isEdit && (
        <div className="mb-4">
          <FormLabel htmlFor="pin-recipient">Người nhận (tuỳ chọn)</FormLabel>
          <FormSelect id="pin-recipient" name="recipient" defaultValue="">
            <option value="">— Kỷ niệm chung —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </FormSelect>
        </div>
      )}
      {isEdit && (
        <div className="mb-4">
          <FormReadonlyField
            label="Người nhận"
            value={initial?.recipientName ?? "— Kỷ niệm chung —"}
          />
        </div>
      )}

      {!isEdit && (
        <div className="mb-4">
          <FormCheckbox
            checked={isAnonymous}
            onChange={setIsAnonymous}
            label="Đăng ẩn danh"
          />
        </div>
      )}
      {isEdit && (
        <div className="mb-4">
          <FormReadonlyField
            label="Danh tính"
            value={initial?.isAnonymous ? "Ẩn danh" : "Công khai"}
          />
          <p className="mt-1 text-xs text-umber/50">Không đổi được sau khi đăng</p>
        </div>
      )}

      {!canSubmit && !loading && (
        <p className="mb-3 text-sm text-umber/60">{PIN_CONTENT_OR_IMAGE_ERROR}</p>
      )}
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="rounded-full bg-peach px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-peach/90 disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Đăng ghim"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-umber/20 px-6 py-2.5 text-sm text-umber transition hover:border-peach/40"
          >
            Huỷ
          </button>
        )}
      </div>
    </form>
  );
}
