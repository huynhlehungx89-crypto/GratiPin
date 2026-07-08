export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="font-heading text-4xl text-peach sm:text-5xl">
        GratiPin
      </h1>
      <p className="max-w-md text-center font-body text-lg">
        Nền tảng ghi nhận, biết ơn và lưu giữ kỷ niệm công ty — ấm áp như một
        bảng ghim thật.
      </p>
      <div className="flex gap-3">
        <span className="rounded-full bg-butter px-4 py-2 text-sm font-heading">
          Vàng bơ
        </span>
        <span className="rounded-full bg-mint px-4 py-2 text-sm font-heading">
          Xanh bạc hà
        </span>
      </div>
    </main>
  );
}
