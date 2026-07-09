import { createClient } from "@/lib/supabase/client";

export async function updatePinPosition(
  pinId: string,
  x: number,
  y: number,
  rotation: number
): Promise<string | null> {
  const supabase = createClient();
  const { error } = await supabase.rpc("update_pin_position", {
    pin_id: pinId,
    x,
    y,
    rot: rotation,
  });
  return error?.message ?? null;
}
