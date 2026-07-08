import type { BoardSkin } from "@/lib/utils/board";
import { getBoardSkinClass } from "@/lib/utils/board";

type BoardProps = {
  skin: BoardSkin;
  children: React.ReactNode;
  archived?: boolean;
  canvasMinWidth?: number;
  canvasMinHeight?: number;
};

export function Board({
  skin,
  children,
  archived,
  canvasMinWidth = 1200,
  canvasMinHeight = 800,
}: BoardProps) {
  return (
    <div className="h-full w-full overflow-auto bg-cream/30">
      <div
        className={`relative min-h-full ${getBoardSkinClass(skin)}`}
        style={{
          minWidth: canvasMinWidth,
          minHeight: canvasMinHeight,
          width: "max(100%, " + canvasMinWidth + "px)",
          height: "max(100%, " + canvasMinHeight + "px)",
        }}
      >
        {archived && (
          <div className="absolute left-0 right-0 top-0 z-20 rounded-none bg-butter/95 px-4 py-2 text-center text-sm font-medium text-umber">
            Bảng đã lưu trữ — chỉ xem, không đăng ghim mới
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
