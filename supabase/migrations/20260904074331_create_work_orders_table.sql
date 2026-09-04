/*
# Create work_orders table for Kavach MPLADS Audit Dashboard

1. New Tables
- `work_orders`: Stores municipal work order records for Bangalore MPLADS audit.
  - `id` (uuid, primary key)
  - `work_id` (text, unique identifier for the work order, e.g. "alert-001")
  - `title` (text, name of the work project)
  - `ward_name` (text, Bangalore ward name)
  - `contractor` (text, contractor company name)
  - `agency` (text, implementing agency e.g. BBMP, BESCOM)
  - `work_category` (text, category e.g. Stormwater Drain, Road Asphalt)
  - `budget` (bigint, fund amount in INR)
  - `risk_score` (integer, 0-100)
  - `risk_level` (text, 'high' | 'medium' | 'low')
  - `status` (text, 'flagged' | 'frozen' | 'under_review' | 'cleared')
  - `funds_frozen` (bigint, amount frozen in INR, default 0)
  - `date` (date, date of the work order)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `work_orders`.
- This is a single-tenant dashboard app with no sign-in screen, so anon + authenticated
  roles get full CRUD access (data is intentionally shared/public for auditor use).
*/

CREATE TABLE IF NOT EXISTS work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id text UNIQUE NOT NULL,
  title text NOT NULL,
  ward_name text NOT NULL,
  contractor text NOT NULL,
  agency text NOT NULL,
  work_category text NOT NULL,
  budget bigint NOT NULL DEFAULT 0,
  risk_score integer NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low',
  status text NOT NULL DEFAULT 'flagged',
  funds_frozen bigint NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_work_orders" ON work_orders;
CREATE POLICY "anon_select_work_orders" ON work_orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_work_orders" ON work_orders;
CREATE POLICY "anon_insert_work_orders" ON work_orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_work_orders" ON work_orders;
CREATE POLICY "anon_update_work_orders" ON work_orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_work_orders" ON work_orders;
CREATE POLICY "anon_delete_work_orders" ON work_orders FOR DELETE
  TO anon, authenticated USING (true);

-- Seed data matching the mock data already used in the dashboard
INSERT INTO work_orders (work_id, title, ward_name, contractor, agency, work_category, budget, risk_score, risk_level, status, funds_frozen, date) VALUES
  ('alert-001', 'Stormwater Drain Re-lining - Varthur Main Road', 'Whitefield', 'Sri Venkateshwara Infra Projects Pvt Ltd', 'BBMP', 'Stormwater Drain', 4200000, 94, 'high', 'flagged', 0, '2026-08-29'),
  ('alert-002', '100ft Road Re-asphalting - 12th to CMH Road', 'Indiranagar', 'GVR Constructions', 'BBMP', 'Road Asphalt', 3100000, 87, 'high', 'flagged', 0, '2026-08-27'),
  ('alert-003', 'Hebbal Lake View Community Hall Construction', 'Hebbal', 'Nagara Nirmana Associates', 'BBMP', 'Community Hall', 5600000, 82, 'high', 'flagged', 0, '2026-08-25'),
  ('alert-004', 'Banashankari Stage V Park Landscaping', 'Padmanabhanagar', 'Green Earth Horticulture Ltd', 'BBMP', 'Park Development', 1850000, 76, 'high', 'flagged', 0, '2026-08-24'),
  ('alert-005', 'LED Street Light Installation - Hosur Road Stretch', 'Electronics City', 'PowerTech Illumination Systems', 'BESCOM', 'Street Lighting', 2200000, 69, 'medium', 'flagged', 0, '2026-08-22'),
  ('alert-006', 'Public Toilet Complex - 80 Feet Road', 'Koramangala', 'Sanitary Solutions India', 'BBMP', 'Sanitation', 950000, 64, 'medium', 'flagged', 0, '2026-08-20'),
  ('alert-007', 'Cauvery Water Pipeline Augmentation - 8th Cross', 'Malleshwaram', 'AquaFlow Pipeline Contractors', 'BWSSB', 'Water Supply', 2700000, 58, 'medium', 'flagged', 0, '2026-08-18'),
  ('alert-008', 'Mini Road Patch Work - Lavelle Road Extension', 'Shantinagar', 'Shanthi Constructions', 'BBMP', 'Road Asphalt', 680000, 52, 'medium', 'cleared', 0, '2026-08-15'),
  ('alert-009', 'Raja Kaluve Desilting - 4th Block', 'Jayanagar', 'Jayanagar Infra Works', 'BBMP', 'Stormwater Drain', 1300000, 55, 'medium', 'flagged', 0, '2026-08-12'),
  ('alert-010', 'Street Light Pole Replacement - Crescent Road', 'Vasanth Nagar', 'Luminous Urban Systems', 'BESCOM', 'Street Lighting', 420000, 26, 'low', 'cleared', 0, '2026-08-10')
ON CONFLICT (work_id) DO NOTHING;
