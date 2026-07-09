-- Phase 5.7.1: mở rộng CHECK constraint template lên 7 mẫu

ALTER TABLE public.pins DROP CONSTRAINT IF EXISTS pins_template_check;

ALTER TABLE public.pins
  ADD CONSTRAINT pins_template_check
  CHECK (template IN ('note', 'polaroid', 'floral', 'washi', 'garden', 'sunshine', 'love'));
