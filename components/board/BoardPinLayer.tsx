import type { PinDisplay } from "@/components/pin/PinCard";
import { PinCard } from "@/components/pin/PinCard";

export function BoardPinLayer({
  pins,
  companyLogoUrl,
}: {
  pins: PinDisplay[];
  companyLogoUrl: string | null;
}) {
  if (pins.length === 0) {
    return (
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-umber/60">
        Chưa có ghim nào — hãy là người đầu tiên!
      </p>
    );
  }

  return (
    <>
      {pins.map((pin) => (
        <div
          key={pin.id}
          className="absolute"
          style={{
            left: pin.position_x,
            top: pin.position_y,
            transform: `rotate(${pin.rotation}deg)`,
          }}
        >
          <PinCard pin={pin} companyLogoUrl={companyLogoUrl} canShare={!pin.is_hidden} />
        </div>
      ))}
    </>
  );
}
