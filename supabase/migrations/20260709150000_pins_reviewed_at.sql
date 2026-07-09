-- Phase 6.4: đánh dấu Admin đã xem ghim ở trang Kiểm duyệt

ALTER TABLE public.pins
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
