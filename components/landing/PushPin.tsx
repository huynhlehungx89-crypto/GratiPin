export function PushPin({ gradient }: { gradient: string }) {
  return (
    <div
      className="absolute left-1/2 top-[-10px] z-10 h-[18px] w-[18px] -translate-x-1/2 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.35)]"
      style={{ background: gradient }}
      aria-hidden
    />
  );
}
