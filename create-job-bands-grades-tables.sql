-- Create job_bands table
CREATE TABLE IF NOT EXISTS job_bands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_grades table
CREATE TABLE IF NOT EXISTS job_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  job_band_id UUID NOT NULL REFERENCES job_bands(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default job bands
INSERT INTO job_bands (name, order_index) VALUES
  ('JB 1', 1),
  ('JB 2', 2),
  ('JB 3', 3),
  ('JB 4', 4),
  ('JB 5', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert default job grades
INSERT INTO job_grades (name, job_band_id, order_index)
SELECT 'JG 1.1', id, 1 FROM job_bands WHERE name = 'JB 1'
UNION ALL
SELECT 'JG 1.2', id, 2 FROM job_bands WHERE name = 'JB 1'
UNION ALL
SELECT 'JG 1.3', id, 3 FROM job_bands WHERE name = 'JB 1'
UNION ALL
SELECT 'JG 2.1', id, 1 FROM job_bands WHERE name = 'JB 2'
UNION ALL
SELECT 'JG 2.2', id, 2 FROM job_bands WHERE name = 'JB 2'
UNION ALL
SELECT 'JG 2.3', id, 3 FROM job_bands WHERE name = 'JB 2'
UNION ALL
SELECT 'JG 3.1', id, 1 FROM job_bands WHERE name = 'JB 3'
UNION ALL
SELECT 'JG 3.2', id, 2 FROM job_bands WHERE name = 'JB 3'
UNION ALL
SELECT 'JG 3.3', id, 3 FROM job_bands WHERE name = 'JB 3'
UNION ALL
SELECT 'JG 4.1', id, 1 FROM job_bands WHERE name = 'JB 4'
UNION ALL
SELECT 'JG 4.2', id, 2 FROM job_bands WHERE name = 'JB 4'
UNION ALL
SELECT 'JG 4.3', id, 3 FROM job_bands WHERE name = 'JB 4'
UNION ALL
SELECT 'JG 5.1', id, 1 FROM job_bands WHERE name = 'JB 5'
UNION ALL
SELECT 'JG 5.2', id, 2 FROM job_bands WHERE name = 'JB 5'
UNION ALL
SELECT 'JG 5.3', id, 3 FROM job_bands WHERE name = 'JB 5'
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE job_bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_grades ENABLE ROW LEVEL SECURITY;

-- Create policies for job_bands
CREATE POLICY "Allow read access to all users" ON job_bands FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON job_bands FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON job_bands FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON job_bands FOR DELETE USING (true);

-- Create policies for job_grades
CREATE POLICY "Allow read access to all users" ON job_grades FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON job_grades FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON job_grades FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON job_grades FOR DELETE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_job_bands_order ON job_bands(order_index);
CREATE INDEX IF NOT EXISTS idx_job_grades_band ON job_grades(job_band_id);
CREATE INDEX IF NOT EXISTS idx_job_grades_order ON job_grades(order_index);
