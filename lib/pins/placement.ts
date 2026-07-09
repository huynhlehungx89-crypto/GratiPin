import type { PinTemplate } from "@/lib/utils/board";

const PIN_WIDTH = 220;
const PIN_HEIGHT = 280;
const VIEWPORT_WIDTH = 960;
const VIEWPORT_HEIGHT = 640;
const GAP = 20;

const ROTATION_RANGE: Record<PinTemplate, [number, number]> = {
  note: [-3, 3],
  polaroid: [-6, 6],
  floral: [-1, 1],
  washi: [-8, 8],
};

export function randomRotationForTemplate(template: PinTemplate): number {
  const [min, max] = ROTATION_RANGE[template];
  const value = min + Math.random() * (max - min);
  return Math.round(value * 10) / 10;
}

function overlaps(
  x: number,
  y: number,
  existing: { position_x: number; position_y: number }[]
): boolean {
  return existing.some(
    (pin) =>
      x < pin.position_x + PIN_WIDTH + GAP &&
      x + PIN_WIDTH + GAP > pin.position_x &&
      y < pin.position_y + PIN_HEIGHT + GAP &&
      y + PIN_HEIGHT + GAP > pin.position_y
  );
}

export function findOpenPinPosition(
  existing: { position_x: number; position_y: number }[]
): { x: number; y: number } {
  const candidates: { x: number; y: number }[] = [];

  for (
    let y = GAP;
    y <= VIEWPORT_HEIGHT - PIN_HEIGHT - GAP;
    y += PIN_HEIGHT + GAP
  ) {
    for (
      let x = GAP;
      x <= VIEWPORT_WIDTH - PIN_WIDTH - GAP;
      x += PIN_WIDTH + GAP
    ) {
      candidates.push({ x, y });
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (const candidate of candidates) {
    if (!overlaps(candidate.x, candidate.y, existing)) {
      return candidate;
    }
  }

  for (let attempt = 0; attempt < 48; attempt++) {
    const x = Math.round(
      GAP + Math.random() * (VIEWPORT_WIDTH - PIN_WIDTH - GAP * 2)
    );
    const y = Math.round(
      GAP + Math.random() * (VIEWPORT_HEIGHT - PIN_HEIGHT - GAP * 2)
    );
    if (!overlaps(x, y, existing)) return { x, y };
  }

  const offset = existing.length * 18;
  return { x: GAP + offset, y: GAP + offset };
}
