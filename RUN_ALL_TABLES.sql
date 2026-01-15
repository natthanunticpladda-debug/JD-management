-- ============================================
-- RUN THIS SQL IN SUPABASE SQL EDITOR
-- สร้าง tables ที่ยังไม่มี
-- ============================================

-- 1. CREATE JOB_POSITIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS job_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read job_positions" ON job_positions
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert job_positions" ON job_positions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update job_positions" ON job_positions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete job_positions" ON job_positions
  FOR DELETE TO authenticated USING (true);

-- 2. CREATE COMPANY_ASSETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS company_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE company_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read company_assets" ON company_assets
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert company_assets" ON company_assets
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update company_assets" ON company_assets
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete company_assets" ON company_assets
  FOR DELETE TO authenticated USING (true);

-- 3. INSERT DEFAULT COMPANY ASSETS
-- ============================================
INSERT INTO company_assets (name, description) VALUES
  ('คอมพิวเตอร์โน้ตบุ๊ค', 'Laptop computer'),
  ('เครื่องโทรศัพท์', 'Mobile phone device'),
  ('เบอร์โทรศัพท์', 'Phone number'),
  ('ค่าโทรศัพท์', 'Phone allowance'),
  ('รถยนต์', 'Company car'),
  ('Fleet Card', 'Fleet card for fuel'),
  ('บัตรรองรถ', 'Parking card'),
  ('บัตร Easy Pass', 'Easy Pass card'),
  ('เครื่อง Ipad', 'iPad device')
ON CONFLICT (name) DO NOTHING;

-- 4. CREATE UPDATED_AT TRIGGER FUNCTION (if not exists)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. CREATE TRIGGERS FOR UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_job_positions_updated_at ON job_positions;
CREATE TRIGGER update_job_positions_updated_at
  BEFORE UPDATE ON job_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_assets_updated_at ON company_assets;
CREATE TRIGGER update_company_assets_updated_at
  BEFORE UPDATE ON company_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Tables created successfully
-- ============================================
