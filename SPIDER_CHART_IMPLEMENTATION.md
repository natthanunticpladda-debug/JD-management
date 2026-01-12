# Spider Chart (Radar Chart) Implementation

## ✅ สรุปการเพิ่ม Spider Chart

เพิ่ม Spider Chart (Radar Chart) สำหรับแสดง Core Competencies ในหน้า View Job Description

---

## 📦 Dependencies

### ติดตั้ง Recharts Library
```bash
npm install recharts
```

**Recharts** เป็น charting library ที่:
- ใช้งานง่าย
- รองรับ React
- มี Radar Chart built-in
- Responsive design
- Customizable

---

## 📁 ไฟล์ที่สร้าง/แก้ไข

### 1. สร้าง Component ใหม่

**ไฟล์**: `jd-management/src/components/CompetencyRadarChart.tsx`

```typescript
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface Competency {
  id: string;
  name: string;
}

interface CompetencyScore {
  competency_id: string;
  score: number;
  notes?: string;
  competency?: Competency;
}

interface CompetencyRadarChartProps {
  competencies: CompetencyScore[];
}

export const CompetencyRadarChart = ({ competencies }: CompetencyRadarChartProps) => {
  // Transform data for radar chart
  const chartData = competencies
    .filter(c => c.score > 0)
    .map(c => {
      let competencyName = 'Unknown';
      if (c.competency && typeof c.competency === 'object') {
        competencyName = c.competency.name;
      }
      
      return {
        competency: competencyName,
        score: c.score,
        fullMark: 5,
      };
    });

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <p>No competency scores available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="competency" 
            tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 5]} 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickCount={6}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#f59e0b"
            fill="#fbbf24"
            fillOpacity={0.6}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
```

### 2. แก้ไข ViewJDPage

**ไฟล์**: `jd-management/src/pages/jd/ViewJDPage.tsx`

#### เพิ่ม Import:
```typescript
import { CompetencyRadarChart } from '../../components/CompetencyRadarChart';
```

#### แก้ไขส่วนแสดง Competencies:
```typescript
{/* Competencies */}
{jd.competencies && jd.competencies.length > 0 && (
  <div>
    <h3 className="text-lg font-semibold text-primary-600 mb-4">
      Core Competencies (สมรรถนะหลัก)
    </h3>
    
    {/* Spider Chart */}
    <div className="bg-white rounded-lg p-6 mb-6 border border-primary-100">
      <CompetencyRadarChart competencies={jd.competencies} />
    </div>

    {/* Competency Details */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jd.competencies.map((comp, index) => (
        <div key={index} className="bg-primary-50/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-primary-600">
              {getCompetencyName(comp.competency_id)}
            </h4>
            <span className={`font-bold ${getScoreColor(comp.score)}`}>
              {comp.score}/5
            </span>
          </div>
          {comp.notes && (
            <p className="text-sm text-primary-500">{comp.notes}</p>
          )}
        </div>
      ))}
    </div>
  </div>
)}
```

### 3. แก้ไข API

**ไฟล์**: `jd-management/src/lib/api.ts`

#### อัพเดท getById เพื่อดึงชื่อ Competency:
```typescript
// Fetch related competencies with competency names
const { data: competencies } = await supabase
  .from('jd_competencies')
  .select(`
    *,
    competency:competencies(id, name)
  `)
  .eq('jd_id', id);
```

---

## 🎨 การออกแบบ Spider Chart

### สี (Colors):
- **Stroke**: `#f59e0b` (Orange-500)
- **Fill**: `#fbbf24` (Amber-400)
- **Fill Opacity**: `0.6` (60%)
- **Grid**: `#e5e7eb` (Gray-200)

### ขนาด:
- **Height**: `384px` (h-96)
- **Width**: `100%` (Responsive)

### แกน (Axes):
- **PolarAngleAxis**: แสดงชื่อ Competency
- **PolarRadiusAxis**: แสดงคะแนน 0-5

### Grid:
- **PolarGrid**: แสดงเส้นกริด 6 ระดับ (0, 1, 2, 3, 4, 5)

---

## 📊 ข้อมูลที่แสดง

### Competencies ที่รองรับ:
1. **Execution** (การปฏิบัติงาน)
2. **Communication** (การสื่อสาร)
3. **Self Awareness** (การรับรู้ตนเอง)
4. **Leadership** (ภาวะผู้นำ)
5. **Business Mind** (ความคิดเชิงธุรกิจ)
6. **Long-term Thinking** (การคิดระยะยาว)

### คะแนน:
- **Scale**: 0-5
- **0**: ไม่มีสมรรถนะ (ไม่แสดงใน chart)
- **1**: ปรับปรุง
- **2**: พัฒนา
- **3**: ดี
- **4**: ดีมาก
- **5**: เชี่ยวชาญ

---

## 🎯 Features

### 1. Responsive Design
- Chart ปรับขนาดตามหน้าจออัตโนมัติ
- ใช้ `ResponsiveContainer` จาก Recharts

### 2. Data Filtering
- แสดงเฉพาะ competencies ที่มีคะแนน > 0
- ถ้าไม่มีข้อมูล แสดงข้อความ "No competency scores available"

### 3. Visual Hierarchy
- Spider Chart อยู่ด้านบน (ภาพรวม)
- Competency Details อยู่ด้านล่าง (รายละเอียด)

### 4. Styling
- ใช้ Tailwind CSS
- สีสอดคล้องกับ theme ของระบบ
- Border และ shadow เบาๆ

---

## 🧪 การทดสอบ

### Test Case 1: JD มี Competencies ครบ 6 ด้าน
**Expected**: แสดง Spider Chart รูปหกเหลี่ยม

### Test Case 2: JD มี Competencies บางด้าน
**Expected**: แสดง Spider Chart ตามจำนวนที่มี

### Test Case 3: JD ไม่มี Competencies
**Expected**: แสดงข้อความ "No competency scores available"

### Test Case 4: Competencies มีคะแนน 0
**Expected**: ไม่แสดงใน chart (ถูกกรองออก)

---

## 📱 Responsive Behavior

### Desktop (> 768px):
- Chart แสดงเต็มความกว้าง
- Competency details แสดง 2 columns

### Mobile (< 768px):
- Chart ปรับขนาดตามหน้าจอ
- Competency details แสดง 1 column

---

## 🎨 Customization Options

### เปลี่ยนสี:
```typescript
<Radar
  stroke="#your-color"      // สีเส้นขอบ
  fill="#your-color"        // สีพื้นหลัง
  fillOpacity={0.6}         // ความโปร่งใส
  strokeWidth={2}           // ความหนาของเส้น
/>
```

### เปลี่ยนขนาด:
```typescript
<div className="w-full h-96">  // เปลี่ยน h-96 เป็นขนาดอื่น
```

### เปลี่ยน Scale:
```typescript
<PolarRadiusAxis 
  domain={[0, 5]}           // เปลี่ยนช่วงคะแนน
  tickCount={6}             // จำนวนเส้นกริด
/>
```

---

## 🐛 Troubleshooting

### ปัญหา 1: Chart ไม่แสดง
**สาเหตุ**: ไม่มีข้อมูล competencies
**แก้ไข**: ตรวจสอบว่า JD มี competencies scores

### ปัญหา 2: ชื่อ Competency แสดง "Unknown"
**สาเหตุ**: API ไม่ได้ดึงชื่อ competency มา
**แก้ไข**: ตรวจสอบ API query ว่ามี join กับ competencies table

### ปัญหา 3: Chart ไม่ responsive
**สาเหตุ**: ไม่ได้ใช้ ResponsiveContainer
**แก้ไข**: ตรวจสอบว่าใช้ ResponsiveContainer ครอบ RadarChart

---

## 📚 Resources

- [Recharts Documentation](https://recharts.org/)
- [Radar Chart Examples](https://recharts.org/en-US/examples/SimpleRadarChart)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)

---

## ✅ สรุป

**Spider Chart ถูกเพิ่มเรียบร้อยแล้ว!**

เมื่อกดปุ่ม "View" ใน Browse Job Descriptions จะเห็น:
- ✅ Spider Chart แสดง Core Competencies
- ✅ Competency Details แสดงคะแนนและหมายเหตุ
- ✅ Responsive design
- ✅ สีสวยงามสอดคล้องกับ theme

**ระบบพร้อมใช้งานแล้ว!** 🎉
