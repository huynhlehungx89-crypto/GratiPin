-- Phase 5.10: thành viên được cập nhật default_board_id của chính mình

CREATE POLICY "members_update_own_profile"
  ON public.members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
