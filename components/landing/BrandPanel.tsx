import Link from "next/link";

export function BrandPanel({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
      {/* Wooden frame */}
      <div
        className="mx-auto w-full max-w-lg rounded-xl p-[10px] shadow-[0_12px_40px_rgba(74,59,50,0.12)]"
        style={{
          background: "linear-gradient(145deg, #e8c9a0 0%, #d4a96a 35%, #c49555 70%, #b8884a 100%)",
        }}
      >
        <div className="rounded-lg bg-cream px-6 py-10 shadow-inner sm:px-8 sm:py-12">
          <p className="text-center font-heading text-3xl font-semibold text-peach sm:text-4xl">
            GratiPin
          </p>

          {children ?? (
            <>
              <h1 className="mt-6 text-center font-heading text-[28px] font-bold leading-tight text-umber sm:text-[36px]">
                Nơi lưu giữ mọi lời cảm ơn và kỷ niệm của đội ngũ bạn
              </h1>
              <p className="mx-auto mt-4 max-w-md text-center font-body text-base leading-relaxed text-umber/80">
                Xây dựng văn hoá ghi nhận ấm áp — mỗi lời cảm ơn là một ghim, mỗi kỷ niệm không
                bao giờ biến mất.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4">
                <Link
                  href="/signup"
                  className="w-full rounded-xl bg-peach px-6 py-4 text-center font-heading text-base font-bold text-white shadow-[0_8px_24px_rgba(244,169,155,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(244,169,155,0.5)] sm:text-lg"
                >
                  Tạo bảng ghim miễn phí cho công ty bạn
                </Link>
                <p className="text-center font-body text-sm text-umber/75">
                  Đã có tài khoản?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-[#d4845c] underline decoration-[#d4845c]/40 underline-offset-2 transition hover:text-peach"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
