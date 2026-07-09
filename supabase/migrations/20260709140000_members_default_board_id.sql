-- Phase 5.10.1: bảng mặc định của từng thành viên

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS default_board_id uuid REFERENCES public.boards(id) ON DELETE SET NULL;
