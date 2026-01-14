# Vercel Deployment Guide

## วิธีการ Deploy JD Management System ไปยัง Vercel

### ขั้นตอนที่ 1: เตรียม Vercel Account

1. ไปที่ https://vercel.com
2. คลิก "Sign Up" หรือ "Log In"
3. เลือก "Continue with GitHub" เพื่อเชื่อมต่อกับ GitHub account ของคุณ

### ขั้นตอนที่ 2: Import Project

1. หลังจาก login แล้ว คลิกปุ่ม "Add New..." > "Project"
2. เลือก "Import Git Repository"
3. ค้นหา repository: `natthanunticpladda-debug/JD-management`
4. คลิก "Import"

### ขั้นตอนที่ 3: Configure Project

Vercel จะตรวจจับ settings อัตโนมัติ แต่ให้ตรวจสอบว่า:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### ขั้นตอนที่ 4: เพิ่ม Environment Variables

คลิกที่ "Environment Variables" และเพิ่ม:

1. **VITE_SUPABASE_URL**
   - Value: URL ของ Supabase project (จาก .env file)
   - ตัวอย่าง: `https://xxxxxxxxxxxxx.supabase.co`

2. **VITE_SUPABASE_ANON_KEY**
   - Value: Anon key ของ Supabase (จาก .env file)
   - ตัวอย่าง: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**สำคัญ**: ต้องเพิ่มทั้ง 2 ตัวแปรนี้ไม่งั้นระบบจะไม่ทำงาน!

### ขั้นตอนที่ 5: Deploy

1. คลิกปุ่ม "Deploy"
2. รอ Vercel build และ deploy (ประมาณ 2-3 นาที)
3. เมื่อเสร็จแล้วจะได้ URL เช่น: `https://jd-management-xxxxx.vercel.app`

### ขั้นตอนที่ 6: ตั้งค่า Custom Domain (Optional)

ถ้าต้องการใช้ domain ของตัวเอง:

1. ไปที่ Project Settings > Domains
2. เพิ่ม domain ที่ต้องการ
3. ตั้งค่า DNS ตามที่ Vercel แนะนำ

### การ Deploy อัตโนมัติ

หลังจาก setup เสร็จแล้ว:
- ทุกครั้งที่ push code ไปที่ `main` branch บน GitHub
- Vercel จะ build และ deploy ใหม่อัตโนมัติ
- ใช้เวลาประมาณ 2-3 นาที

### การตรวจสอบ Deployment

1. ไปที่ Vercel Dashboard
2. เลือก project "JD-management"
3. ดู Deployments tab เพื่อดูประวัติการ deploy
4. คลิกที่ deployment เพื่อดู logs ถ้ามีปัญหา

### Troubleshooting

#### ปัญหา: Build Failed
- ตรวจสอบว่า Environment Variables ถูกต้อง
- ดู Build Logs ใน Vercel Dashboard
- ตรวจสอบว่า `npm run build` ทำงานได้บนเครื่อง local

#### ปัญหา: 404 Not Found เมื่อ Refresh หน้า
- ตรวจสอบว่ามีไฟล์ `vercel.json` ที่มี rewrites configuration

#### ปัญหา: Supabase Connection Error
- ตรวจสอบว่า Environment Variables ถูกต้อง
- ตรวจสอบว่า Supabase URL และ Key ไม่หมดอายุ

### ข้อมูลเพิ่มเติม

- Vercel Documentation: https://vercel.com/docs
- Vite Deployment Guide: https://vitejs.dev/guide/static-deploy.html#vercel

### การอัพเดท Production

เมื่อต้องการอัพเดทเว็บไซต์:

1. แก้ไข code บนเครื่อง local
2. Test ให้แน่ใจว่าทำงานถูกต้อง
3. Commit และ push ไปที่ GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
4. Vercel จะ deploy อัตโนมัติภายใน 2-3 นาที

### ข้อมูล Project

- **GitHub Repository**: https://github.com/natthanunticpladda-debug/JD-management
- **Framework**: React + TypeScript + Vite
- **Database**: Supabase
- **Hosting**: Vercel

---

**หมายเหตุ**: อย่าลืม commit และ push ไฟล์ `vercel.json` และ `.vercelignore` ไปที่ GitHub ก่อน deploy
