import { getBoardSkinClass, type BoardSkin } from "@/lib/utils/board";

type BoardProps = {
  skin: BoardSkin;
  children: React.ReactNode;
  archived?: boolean;
};

export function Board({ skin, children, archived }: BoardProps) {
  return (
    <div
      className={`relative min-h-[480px] rounded-2xl border-4 border-umber/20 p-6 shadow-lg ${getBoardSkinClass(skin)}`}
    >
      {archived && (
        <div className="mb-4 rounded-lg bg-butter/90 px-4 py-2 text-center text-sm font-medium text-umber">
          Bảng đã lưu trữ — chỉ xem, không đăng ghim mới
        </div>
      )}
      <div className="relative flex flex-wrap gap-4 content-start">{children}</div>
    </div>
  );
}
