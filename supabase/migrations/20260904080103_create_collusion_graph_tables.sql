/*
# Create graph_nodes and graph_edges tables for Collusion Network Graph

1. New Tables
- `graph_nodes`: Stores entities in the collusion network (MPs, contractors, sub-contractors, bank accounts).
  - `id` (text, primary key — e.g. "mp1", "con1")
  - `label` (text, display name)
  - `type` (text, 'mp' | 'contractor' | 'subcontractor' | 'bank')
  - `x` (integer, SVG x coordinate for rendering)
  - `y` (integer, SVG y coordinate for rendering)
  - `risk_score` (integer, 0-100 risk rating)

- `graph_edges`: Stores relationships between nodes.
  - `id` (uuid, primary key)
  - `from_node` (text, foreign key to graph_nodes.id)
  - `to_node` (text, foreign key to graph_nodes.id)
  - `label` (text, description of the relationship)
  - `is_suspicious` (boolean, whether this link is flagged as suspicious)

2. Security
- Enable RLS on both tables.
- Single-tenant dashboard with no sign-in, so anon + authenticated get full CRUD (data is shared/public for auditor use).
*/

CREATE TABLE IF NOT EXISTS graph_nodes (
  id text PRIMARY KEY,
  label text NOT NULL,
  type text NOT NULL DEFAULT 'contractor',
  x integer NOT NULL DEFAULT 0,
  y integer NOT NULL DEFAULT 0,
  risk_score integer NOT NULL DEFAULT 0
);

ALTER TABLE graph_nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_graph_nodes" ON graph_nodes;
CREATE POLICY "anon_select_graph_nodes" ON graph_nodes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_graph_nodes" ON graph_nodes;
CREATE POLICY "anon_insert_graph_nodes" ON graph_nodes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_graph_nodes" ON graph_nodes;
CREATE POLICY "anon_update_graph_nodes" ON graph_nodes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_graph_nodes" ON graph_nodes;
CREATE POLICY "anon_delete_graph_nodes" ON graph_nodes FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS graph_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node text NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  to_node text NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  is_suspicious boolean NOT NULL DEFAULT false
);

ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_graph_edges" ON graph_edges;
CREATE POLICY "anon_select_graph_edges" ON graph_edges FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_graph_edges" ON graph_edges;
CREATE POLICY "anon_insert_graph_edges" ON graph_edges FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_graph_edges" ON graph_edges;
CREATE POLICY "anon_update_graph_edges" ON graph_edges FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_graph_edges" ON graph_edges;
CREATE POLICY "anon_delete_graph_edges" ON graph_edges FOR DELETE
  TO anon, authenticated USING (true);

-- Seed nodes
INSERT INTO graph_nodes (id, label, type, x, y, risk_score) VALUES
  ('mp1',   'MP — R. Jigajinagi',          'mp',            400, 80,  45),
  ('con1',  'Sri Venkateshwara Infra',     'contractor',    200, 180, 88),
  ('con2',  'GVR Constructions',           'contractor',    550, 180, 79),
  ('sub1',  'Sub: Varthur Civil Works',    'subcontractor', 100, 320, 71),
  ('sub2',  'Sub: East Blr Materials',     'subcontractor', 300, 320, 66),
  ('sub3',  'Sub: Indiranagar BuildCo',    'subcontractor', 620, 320, 59),
  ('bank1', 'Acct: HDFC ****4421',         'bank',          180, 440, 82),
  ('bank2', 'Acct: ICICI ****8830',        'bank',          400, 440, 75),
  ('bank3', 'Acct: SBI ****1107',          'bank',          600, 440, 68)
ON CONFLICT (id) DO NOTHING;

-- Seed edges
INSERT INTO graph_edges (from_node, to_node, label, is_suspicious) VALUES
  ('mp1',   'con1',  'Awarded 4 works',            true),
  ('mp1',   'con2',  'Awarded 3 works',            true),
  ('con1',  'sub1',  'Subcontracted 60%',          true),
  ('con1',  'sub2',  'Subcontracted 40%',          false),
  ('con2',  'sub3',  'Subcontracted 55%',          true),
  ('sub1',  'bank1', 'Payroll + transfer',         true),
  ('sub2',  'bank2', 'Material payments',          false),
  ('sub3',  'bank3', 'Single-signatory acct',      true),
  ('bank1', 'bank2', 'Inter-acct transfer Rs18L',  true),
  ('sub1',  'bank2', 'Shared account routing',     true),
  ('sub2',  'bank2', 'Shared account routing',     true)
ON CONFLICT DO NOTHING;
