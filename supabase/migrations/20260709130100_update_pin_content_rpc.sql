-- Phase 5.8.2: RPC sửa nội dung ghim — chỉ tác giả gốc

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

  IF new_template = 'polaroid' AND (new_image_url IS NULL OR btrim(new_image_url) = '') THEN
    RAISE EXCEPTION 'Polaroid template requires an image';
  END IF;

  IF new_template NOT IN ('note', 'polaroid', 'floral', 'washi', 'garden', 'sunshine', 'love') THEN
    RAISE EXCEPTION 'Invalid template';
  END IF;

  IF new_content IS NULL OR btrim(new_content) = '' THEN
    RAISE EXCEPTION 'Content cannot be empty';
  END IF;

  UPDATE public.pins
  SET
    content = new_content,
    image_url = NULLIF(btrim(new_image_url), ''),
    template = new_template,
    is_edited = true,
    edited_at = now()
  WHERE id = pin_id
    AND company_id = pin_row.company_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_pin_content(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_pin_content(uuid, text, text, text) TO authenticated;
