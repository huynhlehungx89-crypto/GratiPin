-- Phase 5.13: Board Admin role (scoped per board)

CREATE TABLE public.board_admins (
  board_id uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (board_id, member_id)
);

CREATE INDEX idx_board_admins_member_id ON public.board_admins(member_id);

-- Current member id for auth.uid()
CREATE OR REPLACE FUNCTION public.current_member_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Board Admin of a specific board
CREATE OR REPLACE FUNCTION public.is_board_admin(p_board_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM board_admins ba
    WHERE ba.board_id = p_board_id
      AND ba.member_id = public.current_member_id()
  );
$$;

ALTER TABLE public.board_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_admins_select_own_or_company_admin"
  ON public.board_admins FOR SELECT
  TO authenticated
  USING (
    member_id = public.current_member_id()
    OR EXISTS (
      SELECT 1 FROM boards b
      WHERE b.id = board_admins.board_id
        AND public.is_company_admin(b.company_id)
    )
  );

CREATE POLICY "board_admins_insert_company_admin"
  ON public.board_admins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards b
      WHERE b.id = board_admins.board_id
        AND public.is_company_admin(b.company_id)
    )
  );

CREATE POLICY "board_admins_delete_company_admin"
  ON public.board_admins FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards b
      WHERE b.id = board_admins.board_id
        AND public.is_company_admin(b.company_id)
    )
  );

-- pins SELECT: Board Admin sees hidden pins on their boards
DROP POLICY IF EXISTS "pins_select_same_company" ON public.pins;
CREATE POLICY "pins_select_same_company"
  ON public.pins FOR SELECT
  TO authenticated
  USING (
    company_id IN (SELECT public.user_company_ids())
    AND (
      is_hidden = false
      OR public.is_company_admin(company_id)
      OR public.is_board_admin(board_id)
    )
  );

-- pins UPDATE is_hidden: company Admin OR Board Admin of pin's board
DROP POLICY IF EXISTS "pins_update_admin_hide" ON public.pins;
CREATE POLICY "pins_update_admin_hide"
  ON public.pins FOR UPDATE
  TO authenticated
  USING (
    public.is_company_admin(company_id)
    OR public.is_board_admin(board_id)
  )
  WITH CHECK (
    public.is_company_admin(company_id)
    OR public.is_board_admin(board_id)
  );

-- boards UPDATE skin/embed: company Admin OR Board Admin of that board
DROP POLICY IF EXISTS "boards_update_admin" ON public.boards;
CREATE POLICY "boards_update_admin"
  ON public.boards FOR UPDATE
  TO authenticated
  USING (
    public.is_company_admin(company_id)
    OR public.is_board_admin(id)
  )
  WITH CHECK (
    public.is_company_admin(company_id)
    OR public.is_board_admin(id)
  );
