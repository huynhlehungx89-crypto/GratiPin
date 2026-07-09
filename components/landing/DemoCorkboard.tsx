import { NotePin, PolaroidPin } from "./DemoPin";

export function DemoCorkboard() {
  return (
    <div
      className="relative min-h-[420px] overflow-hidden lg:min-h-[calc(100vh-2rem)]"
      aria-hidden
    >
      {/* Cork texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#c9a066",
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.14'/%3E%3C/svg%3E"),
            radial-gradient(ellipse at 20% 10%, rgba(255,230,180,0.35) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 90%, rgba(120,70,30,0.2) 0%, transparent 45%),
            linear-gradient(145deg, #ddb878 0%, #c49458 40%, #b88448 100%)
          `,
        }}
      />

      <div className="relative mx-auto h-full min-h-[420px] max-w-xl px-6 py-10 sm:px-10 lg:max-w-none lg:min-h-[calc(100vh-2rem)] lg:py-14">
        <NotePin
          label="Giấy note viết tay"
          body="Cảm ơn anh Đức đã hỗ trợ hết mình tuần vừa rồi!"
          bg="bg-[#fff6d6]"
          rotation="-rotate-[4deg]"
          pinGradient="radial-gradient(circle at 35% 30%, #ff8a7a, #c0392b)"
          className="left-[4%] top-[8%] sm:left-[8%] sm:top-[10%]"
        />

        <PolaroidPin
          rotation="rotate-[3deg]"
          className="right-[2%] top-[6%] sm:right-[10%] sm:top-[8%]"
        />

        <NotePin
          label="Thư Yêu Thương"
          body="Cảm ơn chị đã luôn lắng nghe và động viên em ❤️"
          bg="bg-mint/90"
          rotation="rotate-[4deg]"
          pinGradient="radial-gradient(circle at 35% 30%, #e8f5e9, #5a8f6a)"
          className="left-[6%] top-[48%] sm:left-[12%] sm:top-[52%]"
        />

        <NotePin
          label="Nắng Ấm"
          body="Chúc mừng team Sales chốt được deal lớn nhất quý!"
          bg="bg-[#fde4c8]"
          rotation="-rotate-[2deg]"
          pinGradient="radial-gradient(circle at 35% 30%, #fff, #e6a020)"
          className="right-[4%] top-[44%] sm:right-[14%] sm:top-[48%]"
        />

        <NotePin
          label="Polaroid kỷ niệm"
          body="Cảm ơn chị đã luôn lắng nghe và động viên em ❤️"
          bg="bg-[#fffaf0]"
          rotation="rotate-[2deg]"
          pinGradient="radial-gradient(circle at 35% 30%, #ffd27a, #c9871f)"
          className="bottom-[6%] right-[18%] hidden sm:block"
        />
      </div>
    </div>
  );
}
