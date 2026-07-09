-- Phase 2.6: Setup Wizard columns
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS is_owner boolean NOT NULL DEFAULT false;

-- Existing companies skip the wizard (dev/seed data)
UPDATE companies SET onboarding_completed = true WHERE onboarding_completed = false;
