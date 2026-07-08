"use client";

import { useRef, type ComponentType } from "react";
import type { DraggableProps } from "react-draggable";
import DraggableBase from "react-draggable";
import type { PinDisplay } from "@/components/pin/PinCard";
import { PinCard } from "@/components/pin/PinCard";

const Draggable = DraggableBase as ComponentType<Partial<DraggableProps>>;

function DraggablePin({
  pin,
  companyLogoUrl,
}: {
  pin: PinDisplay;
  companyLogoUrl: string | null;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={{ x: pin.position_x, y: pin.position_y }}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        className="absolute left-0 top-0 z-10 cursor-grab active:cursor-grabbing"
      >
        <div style={{ transform: `rotate(${pin.rotation}deg)` }}>
          <PinCard pin={pin} companyLogoUrl={companyLogoUrl} canShare={!pin.is_hidden} />
        </div>
      </div>
    </Draggable>
  );
}

export function BoardPinLayer({
  pins,
  companyLogoUrl,
  draggable = true,
}: {
  pins: PinDisplay[];
  companyLogoUrl: string | null;
  draggable?: boolean;
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
      {pins.map((pin) => {
        if (!draggable) {
          return (
            <div
              key={pin.id}
              className="absolute"
              style={{ left: pin.position_x, top: pin.position_y }}
            >
              <div style={{ transform: `rotate(${pin.rotation}deg)` }}>
                <PinCard pin={pin} companyLogoUrl={companyLogoUrl} canShare={!pin.is_hidden} />
              </div>
            </div>
          );
        }

        return <DraggablePin key={pin.id} pin={pin} companyLogoUrl={companyLogoUrl} />;
      })}
    </>
  );
}
