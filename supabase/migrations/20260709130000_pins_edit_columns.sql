-- Phase 5.8.1: cột theo dõi chỉnh sửa ghim

ALTER TABLE public.pins
  ADD COLUMN IF NOT EXISTS is_edited boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS edited_at timestamptz;
