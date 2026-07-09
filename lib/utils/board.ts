export type BoardSkin = "wood" | "felt" | "linen" | "chalkboard";
export type PinTemplate =
  | "note"
  | "polaroid"
  | "floral"
  | "washi"
  | "garden"
  | "sunshine"
  | "love";

export const SKIN_LABELS: Record<BoardSkin, string> = {
  wood: "Gỗ mộc",
  felt: "Nỉ nhung",
  linen: "Vải lanh",
  chalkboard: "Chalkboard",
};

export const TEMPLATE_LABELS: Record<PinTemplate, string> = {
  note: "Giấy note viết tay",
  polaroid: "Polaroid kỷ niệm",
  floral: "Thiệp hoa lá",
  washi: "Washi tape",
  garden: "Vườn Xanh",
  sunshine: "Nắng Ấm",
  love: "Thư Yêu Thương",
};

export const ALL_TEMPLATES: PinTemplate[] = [
  "note",
  "polaroid",
  "floral",
  "washi",
  "garden",
  "sunshine",
  "love",
];

const SKIN_STYLES: Record<BoardSkin, string> = {
  wood: "bg-[#c4a574] bg-[radial-gradient(ellipse_at_center,_rgba(139,90,43,0.15)_0%,_transparent_70%)] shadow-inner",
  felt: "bg-[#5c4a5e] bg-[radial-gradient(circle_at_20%_30%,_rgba(255,255,255,0.05)_0%,_transparent_50%)]",
  linen: "bg-[#e8e0d4] bg-[linear-gradient(90deg,_rgba(0,0,0,0.02)_1px,_transparent_1px)] bg-[length:4px_4px]",
  chalkboard: "bg-[#3d5a4c] bg-[radial-gradient(circle,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[length:8px_8px]",
};

export function getBoardSkinClass(skin: BoardSkin): string {
  return SKIN_STYLES[skin];
}
