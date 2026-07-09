type StoredPosition = {
  x: number;
  y: number;
  sourceX: number;
  sourceY: number;
};

const memory = new Map<string, StoredPosition>();

/** Keep last known on-screen position across BoardPinLayer remounts (e.g. router.refresh). */
export function getPinPosition(
  pinId: string,
  dbX: number,
  dbY: number
): { x: number; y: number } {
  const stored = memory.get(pinId);
  if (stored && stored.sourceX === dbX && stored.sourceY === dbY) {
    return { x: stored.x, y: stored.y };
  }
  return { x: dbX, y: dbY };
}

export function setPinPosition(
  pinId: string,
  x: number,
  y: number,
  dbX: number,
  dbY: number
) {
  memory.set(pinId, { x, y, sourceX: dbX, sourceY: dbY });
}
