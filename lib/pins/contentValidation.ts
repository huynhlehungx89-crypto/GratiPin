export const PIN_CONTENT_OR_IMAGE_ERROR = "Cần có nội dung hoặc ảnh";

export function pinHasText(content: string | null | undefined): boolean {
  return (content?.trim() ?? "").length > 0;
}

export function hasPinContentOrImage(
  content: string | null | undefined,
  imageUrl: string | null | undefined
): boolean {
  const hasImage = (imageUrl?.trim() ?? "").length > 0;
  return pinHasText(content) || hasImage;
}

export function normalizePinContent(content: string | null | undefined): string {
  return content?.trim() ?? "";
}
