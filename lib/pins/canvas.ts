import type { PinDisplay } from "@/components/pin/PinCard";

const PIN_WIDTH = 260;
const PIN_HEIGHT = 320;
const CANVAS_MIN_WIDTH = 1200;
const CANVAS_MIN_HEIGHT = 800;
const CANVAS_PADDING = 80;

export function getBoardCanvasSize(pins: Pick<PinDisplay, "position_x" | "position_y">[]) {
  let width = CANVAS_MIN_WIDTH;
  let height = CANVAS_MIN_HEIGHT;

  for (const pin of pins) {
    width = Math.max(width, pin.position_x + PIN_WIDTH + CANVAS_PADDING);
    height = Math.max(height, pin.position_y + PIN_HEIGHT + CANVAS_PADDING);
  }

  return { width, height };
}
