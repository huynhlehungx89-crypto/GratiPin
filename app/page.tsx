import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="font-heading text-5xl text-peach sm:text-6xl">GratiPin</h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-umber/80">
          Nền tảng ghi nhận, biết ơn và lưu giữ kỷ niệm công ty — ấm áp như một
          bảng ghim thật trong văn phòng.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded-full bg-peach px-8 py-3 font-heading text-white hover:opacity-90"
        >
          Tạo công ty mới
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-peach px-8 py-3 font-heading text-peach hover:bg-peach/10"
        >
          Đăng nhập
        </Link>
      </div>
    </main>
  );
}
