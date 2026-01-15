-- Create job_positions table
CREATE TABLE IF NOT EXISTS job_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to all authenticated users" ON job_positions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated users" ON job_positions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON job_positions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow delete for authenticated users" ON job_positions
  FOR DELETE TO authenticated USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_job_positions_name ON job_positions(name);

-- Insert some default positions
INSERT INTO job_positions (name, description) VALUES
  ('Manager', 'Management position'),
  ('Senior Developer', 'Senior level developer'),
  ('Developer', 'Mid-level developer'),
  ('Junior Developer', 'Entry level developer'),
  ('Team Lead', 'Team leadership position'),
  ('Director', 'Director level position'),
  ('VP', 'Vice President position'),
  ('Analyst', 'Analysis position'),
  ('Specialist', 'Specialist position'),
  ('Coordinator', 'Coordination position')
ON CONFLICT (name) DO NOTHING;
