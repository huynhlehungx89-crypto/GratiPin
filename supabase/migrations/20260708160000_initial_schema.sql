-- GratiPin initial schema + RLS (Phase 1)

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'user')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id)
);

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.member_departments (
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  PRIMARY KEY (member_id, department_id)
);

CREATE TABLE public.boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  skin text NOT NULL DEFAULT 'wood' CHECK (skin IN ('wood', 'felt', 'linen', 'chalkboard')),
  embed_enabled boolean NOT NULL DEFAULT false,
  embed_token text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  board_id uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  author_member_id uuid NOT NULL REFERENCES public.members(id),
  is_anonymous boolean NOT NULL DEFAULT false,
  recipient_member_id uuid REFERENCES public.members(id),
  content text NOT NULL,
  image_url text,
  template text NOT NULL DEFAULT 'note' CHECK (template IN ('note', 'polaroid', 'floral', 'washi')),
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_members_user_id ON public.members(user_id);
CREATE INDEX idx_members_company_id ON public.members(company_id);
CREATE INDEX idx_departments_company_id ON public.departments(company_id);
CREATE INDEX idx_boards_company_id ON public.boards(company_id);
CREATE INDEX idx_pins_company_id ON public.pins(company_id);
CREATE INDEX idx_pins_board_id ON public.pins(board_id);

-- Helper: company IDs the current user belongs to
CREATE OR REPLACE FUNCTION public.user_company_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM members WHERE user_id = auth.uid();
$$;

-- Helper: whether current user is admin of a company
CREATE OR REPLACE FUNCTION public.is_company_admin(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE user_id = auth.uid()
      AND company_id = p_company_id
      AND role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pins ENABLE ROW LEVEL SECURITY;

-- companies
CREATE POLICY "companies_select_member"
  ON public.companies FOR SELECT
  TO authenticated
  USING (id IN (SELECT public.user_company_ids()));

CREATE POLICY "companies_update_admin"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (public.is_company_admin(id))
  WITH CHECK (public.is_company_admin(id));

-- members
CREATE POLICY "members_select_same_company"
  ON public.members FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY "members_insert_admin"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_company_admin(company_id));

CREATE POLICY "members_update_admin"
  ON public.members FOR UPDATE
  TO authenticated
  USING (public.is_company_admin(company_id))
  WITH CHECK (public.is_company_admin(company_id));

CREATE POLICY "members_delete_admin"
  ON public.members FOR DELETE
  TO authenticated
  USING (public.is_company_admin(company_id));

-- departments
CREATE POLICY "departments_select_same_company"
  ON public.departments FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY "departments_insert_admin"
  ON public.departments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_company_admin(company_id));

CREATE POLICY "departments_update_admin"
  ON public.departments FOR UPDATE
  TO authenticated
  USING (public.is_company_admin(company_id))
  WITH CHECK (public.is_company_admin(company_id));

-- member_departments
CREATE POLICY "member_departments_select_same_company"
  ON public.member_departments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = member_departments.member_id
        AND m.company_id IN (SELECT public.user_company_ids())
    )
  );

CREATE POLICY "member_departments_insert_admin"
  ON public.member_departments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = member_departments.member_id
        AND public.is_company_admin(m.company_id)
    )
  );

CREATE POLICY "member_departments_delete_admin"
  ON public.member_departments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = member_departments.member_id
        AND public.is_company_admin(m.company_id)
    )
  );

-- boards
CREATE POLICY "boards_select_same_company"
  ON public.boards FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY "boards_insert_admin"
  ON public.boards FOR INSERT
  TO authenticated
  WITH CHECK (public.is_company_admin(company_id));

CREATE POLICY "boards_update_admin"
  ON public.boards FOR UPDATE
  TO authenticated
  USING (public.is_company_admin(company_id))
  WITH CHECK (public.is_company_admin(company_id));

-- pins
CREATE POLICY "pins_select_same_company"
  ON public.pins FOR SELECT
  TO authenticated
  USING (
    company_id IN (SELECT public.user_company_ids())
    AND (
      is_hidden = false
      OR public.is_company_admin(company_id)
    )
  );

CREATE POLICY "pins_insert_member"
  ON public.pins FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY "pins_update_admin_hide"
  ON public.pins FOR UPDATE
  TO authenticated
  USING (public.is_company_admin(company_id))
  WITH CHECK (public.is_company_admin(company_id));

-- Storage bucket for pin images (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pin-images', 'pin-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "pin_images_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'pin-images');

CREATE POLICY "pin_images_authenticated_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pin-images');

CREATE POLICY "pin_images_authenticated_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'pin-images');
