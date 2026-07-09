-- Phase 5.11.6: cho phép content rỗng nếu có ảnh; chặn khi cả hai trống

CREATE OR REPLACE FUNCTION public.update_pin_content(
  pin_id uuid,
  new_content text,
  new_image_url text,
  new_template text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pin_row public.pins%ROWTYPE;
  caller_member_id uuid;
  trimmed_content text;
  trimmed_image text;
BEGIN
  SELECT * INTO pin_row FROM public.pins WHERE id = pin_id;
  IF pin_row.id IS NULL THEN
    RAISE EXCEPTION 'Pin not found';
  END IF;

  SELECT m.id INTO caller_member_id
  FROM public.members m
  WHERE m.user_id = auth.uid()
    AND m.company_id = pin_row.company_id;

  IF caller_member_id IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF pin_row.author_member_id IS DISTINCT FROM caller_member_id THEN
    RAISE EXCEPTION 'Only the original author can edit this pin';
  END IF;

  IF pin_row.is_hidden THEN
    RAISE EXCEPTION 'Hidden pins cannot be edited';
  END IF;

  trimmed_content := btrim(coalesce(new_content, ''));
  trimmed_image := btrim(coalesce(new_image_url, ''));

  IF new_template = 'polaroid' AND trimmed_image = '' THEN
    RAISE EXCEPTION 'Polaroid template requires an image';
  END IF;

  IF new_template NOT IN ('note', 'polaroid', 'floral', 'washi', 'garden', 'sunshine', 'love') THEN
    RAISE EXCEPTION 'Invalid template';
  END IF;

  IF trimmed_content = '' AND trimmed_image = '' THEN
    RAISE EXCEPTION 'Pin must have content or image';
  END IF;

  UPDATE public.pins
  SET
    content = trimmed_content,
    image_url = NULLIF(trimmed_image, ''),
    template = new_template,
    is_edited = true,
    edited_at = now()
  WHERE id = pin_id
    AND company_id = pin_row.company_id;
END;
$$;
