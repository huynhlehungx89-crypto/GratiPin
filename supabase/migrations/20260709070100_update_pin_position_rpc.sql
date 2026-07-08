-- Phase 5.5.2: RPC cập nhật vị trí ghim (kéo-thả) — không mở UPDATE chung

CREATE OR REPLACE FUNCTION public.update_pin_position(
  pin_id uuid,
  x double precision,
  y double precision,
  rot double precision
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pin_company_id uuid;
BEGIN
  SELECT company_id INTO pin_company_id
  FROM public.pins
  WHERE id = pin_id;

  IF pin_company_id IS NULL THEN
    RAISE EXCEPTION 'Pin not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.members
    WHERE user_id = auth.uid()
      AND company_id = pin_company_id
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.pins
  SET
    position_x = x,
    position_y = y,
    rotation = rot
  WHERE id = pin_id
    AND company_id = pin_company_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_pin_position(uuid, double precision, double precision, double precision) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_pin_position(uuid, double precision, double precision, double precision) TO authenticated;
