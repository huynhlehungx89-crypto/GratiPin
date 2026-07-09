-- Phase 5.15: RPC for user to update own display name
CREATE OR REPLACE FUNCTION public.update_own_display_name(new_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF length(trim(new_name)) < 1 THEN
    RAISE EXCEPTION 'Tên hiển thị không được để trống';
  END IF;

  UPDATE public.members
  SET display_name = trim(new_name)
  WHERE user_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_own_display_name(text) TO authenticated;
