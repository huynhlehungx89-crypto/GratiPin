-- Phase 5.5.1: vị trí tự do trên canvas bảng ghim

ALTER TABLE public.pins
  ADD COLUMN IF NOT EXISTS position_x double precision NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS position_y double precision NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rotation double precision NOT NULL DEFAULT 0;
