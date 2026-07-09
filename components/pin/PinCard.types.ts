import type { PinTemplate } from "@/lib/utils/board";

export type PinDisplay = {
  id: string;
  content: string;
  template: PinTemplate;
  image_url: string | null;
  is_anonymous: boolean;
  is_hidden: boolean;
  created_at: string;
  author_name: string;
  author_member_id: string;
  author_real_name?: string;
  show_real_author?: boolean;
  recipient_name?: string | null;
  is_edited: boolean;
  edited_at: string | null;
  position_x: number;
  position_y: number;
  rotation: number;
};
