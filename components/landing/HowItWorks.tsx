function PenIcon() {
  return (
    <svg className="h-12 w-12 text-umber/80" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M8 38 L32 14 L36 18 L12 42 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M32 14 L38 8 L42 12 L36 18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 38 L4 44 L10 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function NotesStackIcon() {
  return (
    <svg className="h-12 w-12 text-umber/80" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="10" y="16" width="26" height="26" rx="2" stroke="currentColor" strokeWidth="2" transform="rotate(-6 23 29)" />
      <rect x="8" y="12" width="26" height="26" rx="2" stroke="currentColor" strokeWidth="2" transform="rotate(3 21 25)" />
      <rect x="12" y="8" width="26" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function BoardShareIcon() {
  return (
    <svg className="h-12 w-12 text-umber/80" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M30 18 L38 12 M30 30 L38 36 M18 30 L10 36 M18 18 L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const STEPS = [
  { icon: PenIcon, title: "Viết lời cảm ơn" },
  { icon: NotesStackIcon, title: "Chọn mẫu ghim đẹp" },
  { icon: BoardShareIcon, title: "Ghim lên bảng & chia sẻ" },
] as const;

export function HowItWorks() {
  return (
    <section className="border-t border-umber/10 bg-gradient-to-b from-cream to-[#f5ead8] px-6 py-14 sm:py-16">
      <h2 className="text-center font-heading text-2xl font-bold text-umber sm:text-3xl">
        Cách hoạt động
      </h2>
      <div className="mx-auto mt-10 grid max-w-4xl gap-10 sm:grid-cols-3 sm:gap-8">
        {STEPS.map(({ icon: Icon, title }) => (
          <div key={title} className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/60 shadow-sm">
              <Icon />
            </div>
            <p className="font-body text-base font-medium text-umber">{title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
