import type { BoardSkin } from "@/lib/utils/board";
import { getBoardSkinClass } from "@/lib/utils/board";
import { getBoardCanvasSize } from "@/lib/pins/canvas";
import type { PinDisplay } from "@/components/pin/PinCard";

type BoardProps = {
  skin: BoardSkin;
  children: React.ReactNode;
  archived?: boolean;
  pins?: Pick<PinDisplay, "position_x" | "position_y">[];
  canvasMinWidth?: number;
  canvasMinHeight?: number;
};

export function Board({
  skin,
  children,
  archived,
  pins = [],
  canvasMinWidth,
  canvasMinHeight,
}: BoardProps) {
  const autoSize = getBoardCanvasSize(pins);
  const minWidth = canvasMinWidth ?? autoSize.width;
  const minHeight = canvasMinHeight ?? autoSize.height;

  return (
    <div className="h-full w-full overflow-auto bg-cream/30">
      <div
        className={`relative min-h-full ${getBoardSkinClass(skin)}`}
        style={{
          minWidth,
          minHeight,
          width: `max(100%, ${minWidth}px)`,
          height: `max(100%, ${minHeight}px)`,
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
