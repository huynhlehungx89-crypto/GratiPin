"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import type { DraggableProps } from "react-draggable";
import DraggableBase from "react-draggable";
import type { PinDisplay } from "@/components/pin/PinCard";
import { PinCard } from "@/components/pin/PinCard";
import { getPinPosition, setPinPosition } from "@/lib/pins/positionMemory";
import { updatePinPosition } from "@/lib/pins/updatePosition";

const Draggable = DraggableBase as ComponentType<Partial<DraggableProps>>;

function DraggablePin({
  pin,
  companyLogoUrl,
  companySlug,
  currentMemberId,
  canModerate,
  onPinHidden,
}: {
  pin: PinDisplay;
  companyLogoUrl: string | null;
  companySlug: string;
  currentMemberId: string;
  canModerate: boolean;
  onPinHidden: (pinId: string) => void;
}) {
  const canEdit = !pin.is_hidden && pin.author_member_id === currentMemberId;
  const nodeRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(() =>
    getPinPosition(pin.id, pin.position_x, pin.position_y)
  );

  useEffect(() => {
    setPosition(getPinPosition(pin.id, pin.position_x, pin.position_y));
  }, [pin.id, pin.position_x, pin.position_y]);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".pin-drag-handle"
      cancel=".pin-options-menu, .pin-options-menu *, .pin-share-btn, .pin-share-btn *"
      position={position}
      bounds="parent"
      onDrag={(_e, data) => {
        setPosition({ x: data.x, y: data.y });
      }}
      onStop={(_e, data) => {
        const next = { x: data.x, y: data.y };
        setPosition(next);
        setPinPosition(pin.id, next.x, next.y, pin.position_x, pin.position_y);
        void updatePinPosition(pin.id, next.x, next.y, pin.rotation);
      }}
    >
      <div ref={nodeRef} className="absolute left-0 top-0 z-10">
        <div
          className="pin-drag-handle mb-1 flex h-4 cursor-grab items-center justify-center rounded bg-umber/10 active:cursor-grabbing"
          aria-label="Kéo ghim"
          title="Kéo để sắp xếp"
        >
          <span className="text-[10px] tracking-widest text-umber/40">⠿</span>
        </div>
        <div style={{ transform: `rotate(${pin.rotation}deg)` }}>
          <PinCard
            pin={pin}
            companyLogoUrl={companyLogoUrl}
            companySlug={companySlug}
            canShare={!pin.is_hidden}
            canEdit={canEdit}
            canModerate={canModerate}
            onHidden={() => onPinHidden(pin.id)}
          />
        </div>
      </div>
    </Draggable>
  );
}

export function BoardPinLayer({
  pins,
  companyLogoUrl,
  companySlug,
  currentMemberId,
  canModerate = false,
  draggable = true,
}: {
  pins: PinDisplay[];
  companyLogoUrl: string | null;
  companySlug: string;
  currentMemberId: string;
  canModerate?: boolean;
  draggable?: boolean;
}) {
  const [hiddenPinIds, setHiddenPinIds] = useState<Set<string>>(() => new Set());

  const visiblePins = pins.filter((p) => !p.is_hidden && !hiddenPinIds.has(p.id));

  function handlePinHidden(pinId: string) {
    setHiddenPinIds((prev) => new Set(prev).add(pinId));
  }

  if (visiblePins.length === 0) {
    return (
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-umber/60">
        Chưa có ghim nào — hãy là người đầu tiên!
      </p>
    );
  }

  return (
    <>
      {visiblePins.map((pin) => {
        if (!draggable) {
          return (
            <div
              key={pin.id}
              className="absolute"
              style={{ left: pin.position_x, top: pin.position_y }}
            >
              <div style={{ transform: `rotate(${pin.rotation}deg)` }}>
                <PinCard
                  pin={pin}
                  companyLogoUrl={companyLogoUrl}
                  companySlug={companySlug}
                  canShare={!pin.is_hidden}
                  canEdit={!pin.is_hidden && pin.author_member_id === currentMemberId}
                  canModerate={canModerate}
                  onHidden={() => handlePinHidden(pin.id)}
                />
              </div>
            </div>
          );
        }

        return (
          <DraggablePin
            key={pin.id}
            pin={pin}
            companyLogoUrl={companyLogoUrl}
            companySlug={companySlug}
            currentMemberId={currentMemberId}
            canModerate={canModerate}
            onPinHidden={handlePinHidden}
          />
        );
      })}
    </>
  );
}
