# ⚠️ ต้องทำก่อนใช้งาน Job Positions!

## Error: "Could not find the table 'public.job_positions'"

### วิธีแก้ (ใช้เวลา 2 นาที):

1. **เปิด Supabase SQL Editor**
   - คลิกลิงก์นี้: https://supabase.com/dashboard/project/smwqkrpkwhbkvdatebsi/sql/new

2. **Copy SQL ด้านล่างนี้ทั้งหมด**

```sql
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
```

3. **Paste ใน SQL Editor**

4. **กด Run (หรือ Ctrl+Enter)**

5. **รอจนเห็นข้อความ "Success"**

6. **Refresh หน้าเว็บของคุณ (Ctrl+Shift+R)**

7. **เสร็จแล้ว!** ตอนนี้หน้า Job Positions จะใช้งานได้แล้ว

---

## หลังจากรัน SQL แล้ว คุณจะสามารถ:

✅ เพิ่มตำแหน่งงานใหม่
✅ แก้ไขตำแหน่งงาน
✅ ลบตำแหน่งงาน
✅ Import จากไฟล์ CSV
✅ ข้อมูลจะถูกบันทึกในฐานข้อมูล Supabase

---

## ถ้ายังไม่ได้รัน SQL:
- หน้า Job Positions จะแสดง error "Could not find the table"
- ไม่สามารถเพิ่มหรือแก้ไขข้อมูลได้

## หลังจากรัน SQL แล้ว:
- Error จะหายไป
- จะมีตำแหน่งงาน 10 ตำแหน่งเริ่มต้นให้ใช้งาน
- สามารถเพิ่ม/ลบ/แก้ไขได้ตามต้องการ
