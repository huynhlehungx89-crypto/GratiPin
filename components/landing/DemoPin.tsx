import Image from "next/image";
import { PushPin } from "./PushPin";

type DemoPinProps = {
  className?: string;
  pinGradient: string;
  rotation: string;
  children: React.ReactNode;
};

export function DemoPin({ className = "", pinGradient, rotation, children }: DemoPinProps) {
  return (
    <div
      className={`group absolute w-[168px] cursor-default transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_14px_28px_rgba(74,59,50,0.22)] ${rotation} ${className}`}
      style={{
        boxShadow: "0 8px 18px rgba(74, 59, 50, 0.2)",
      }}
    >
      <PushPin gradient={pinGradient} />
      {children}
    </div>
  );
}

export function NotePin({
  label,
  body,
  bg,
  className,
  rotation,
  pinGradient,
}: {
  label: string;
  body: string;
  bg: string;
  className?: string;
  rotation: string;
  pinGradient: string;
}) {
  return (
    <DemoPin className={className} pinGradient={pinGradient} rotation={rotation}>
      <div className={`rounded-sm px-3.5 pb-4 pt-5 ${bg}`}>
        <p className="font-handwriting text-[13px] leading-snug text-umber">
          <span className="mb-1 block text-[11px] text-umber/70">{label}</span>
          {body}
        </p>
      </div>
    </DemoPin>
  );
}

export function PolaroidPin({ className, rotation }: { className?: string; rotation: string }) {
  return (
    <DemoPin
      className={`w-[178px] ${className ?? ""}`}
      pinGradient="radial-gradient(circle at 35% 30%, #ffd27a, #b8860b)"
      rotation={rotation}
    >
      <div className="rounded-sm bg-white p-2 pb-0 shadow-inner">
        <div className="relative h-[108px] w-full overflow-hidden bg-[#e9e2d6]">
          <Image
            src="/landing/team-photo.png"
            alt="Team building"
            fill
            className="object-cover object-center"
            sizes="178px"
            priority
          />
        </div>
        <p className="py-2.5 text-center font-handwriting text-[12px] leading-tight text-umber">
          Team building Đà Lạt 2025
        </p>
      </div>
    </DemoPin>
  );
}
