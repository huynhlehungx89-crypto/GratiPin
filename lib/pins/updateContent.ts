import { createClient } from "@/lib/supabase/client";

export async function updatePinContent(
  pinId: string,
  content: string,
  imageUrl: string | null,
  template: string
): Promise<string | null> {
  const supabase = createClient();
  const { error } = await supabase.rpc("update_pin_content", {
    pin_id: pinId,
    new_content: content,
    new_image_url: imageUrl ?? "",
    new_template: template,
  });
  return error?.message ?? null;
}
