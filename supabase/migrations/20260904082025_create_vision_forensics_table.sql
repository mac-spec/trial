/*
# Create vision_forensics table for Spatial-Temporal Vision Audit

1. New Tables
- `vision_forensics`: Stores AI vision analysis results for each work order's uploaded construction photo.
  - `id` (uuid, primary key)
  - `work_id` (text, unique — links to work_orders.work_id)
  - `contractor_photo_url` (text, nullable — public URL of uploaded photo in storage)
  - `gps_coordinates` (text, GPS coordinates extracted from EXIF or inferred)
  - `gps_verified` (boolean, whether GPS matches expected work location)
  - `timestamp_verified` (boolean, whether photo timestamp is valid)
  - `shadow_geometry_score` (numeric, 0-100 match score between photo and AI baseline)
  - `duplicate_detected` (boolean, whether image was found in prior work orders)
  - `ai_status` (text, 'pending' | 'analyzing' | 'completed' | 'funds_frozen')
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `vision_forensics`.
- Single-tenant dashboard with no sign-in, so anon + authenticated get full CRUD.
*/

CREATE TABLE IF NOT EXISTS vision_forensics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id text UNIQUE NOT NULL,
  contractor_photo_url text,
  gps_coordinates text DEFAULT '12.9698°N, 77.7500°E (Varthur)',
  gps_verified boolean DEFAULT true,
  timestamp_verified boolean DEFAULT true,
  shadow_geometry_score numeric DEFAULT 67.3,
  duplicate_detected boolean DEFAULT false,
  ai_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vision_forensics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_vision_forensics" ON vision_forensics;
CREATE POLICY "anon_select_vision_forensics" ON vision_forensics FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_vision_forensics" ON vision_forensics;
CREATE POLICY "anon_insert_vision_forensics" ON vision_forensics FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_vision_forensics" ON vision_forensics;
CREATE POLICY "anon_update_vision_forensics" ON vision_forensics FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_vision_forensics" ON vision_forensics;
CREATE POLICY "anon_delete_vision_forensics" ON vision_forensics FOR DELETE
  TO anon, authenticated USING (true);

-- Seed vision forensics rows for existing work orders
INSERT INTO vision_forensics (work_id, contractor_photo_url, gps_coordinates, gps_verified, timestamp_verified, shadow_geometry_score, duplicate_detected, ai_status)
SELECT
  w.work_id,
  'https://images.pexels.com/photos/2058120/pexels-photo-2058120.jpeg?auto=compress&cs=tinysrgb&w=800',
  '12.9698°N, 77.7500°E (Varthur)',
  true,
  true,
  67.3,
  false,
  'pending'
FROM work_orders w
ON CONFLICT (work_id) DO NOTHING;
