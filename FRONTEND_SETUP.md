# 🎨 Frontend Setup Guide

## ✅ สิ่งที่สร้างเสร็จแล้ว

### ไฟล์ใหม่ที่สร้าง:
- ✅ `lib/api.ts` - API Client สำหรับเรียก Backend
- ✅ `lib/constants.ts` - Constants (Colors, Avatars, Images mapping)
- ✅ `types/index.ts` - TypeScript Types
- ✅ `components/production-schedule-api.tsx` - Component เวอร์ชันใหม่ (กำลังพัฒนา)

### ไฟล์ที่มีอยู่แล้ว:
- ✅ `components/production-schedule.tsx` - Component เดิม (Hardcoded data)
- ✅ `app/`, `components/ui/`, `public/` - โครงสร้าง Next.js

---

## 🚀 การติดตั้งและรัน

### 1. สร้างไฟล์ `.env.local`
สร้างไฟล์ `.env.local` ที่ root folder:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3107

# Feature Flags
NEXT_PUBLIC_ENABLE_EXCEL_EXPORT=true
NEXT_PUBLIC_ENABLE_PRINT=true
```

### 2. รัน Frontend Development Server
```bash
cd "d:\production-schedule V1"
npm run dev
```

Server จะทำงานที่: `http://localhost:3017`

---

## 📝 วิธีใช้งาน Component ใหม่

### Option 1: ใช้ Component ใหม่ (Recommended)
แก้ไข `app/page.tsx`:
```typescript
import ProductionSchedule from "@/components/production-schedule-api"  // เปลี่ยนจาก production-schedule
//import ProductionSchedule from "@/components/production-schedule"  // Comment เดิม

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="w-full px-2 py-2">
        <div className="mb-2 px-4"></div>
        <ProductionSchedule />
      </div>
    </main>
  )
}
```

### Option 2: ทดสอบทั้งสองเวอร์ชัน
```typescript
"use client"
import { useState } from "react"
import ProductionScheduleOld from "@/components/production-schedule"
import ProductionScheduleNew from "@/components/production-schedule-api"

export default function Home() {
  const [useNew, setUseNew] = useState(true)

  return (
    <main className="min-h-screen bg-background">
      <div className="p-4">
        <button
          onClick={() => setUseNew(!useNew)}
          className="mb-4 px-4 py-2 bg-primary text-white rounded"
        >
          {useNew ? 'ดูเวอร์ชันเก่า (Hardcode)' : 'ดูเวอร์ชันใหม่ (API)'}
        </button>
        
        {useNew ? <ProductionScheduleNew /> : <ProductionScheduleOld />}
      </div>
    </main>
  )
}
```

---

## 🔍 สิ่งที่ต้องทำเพิ่มเติม

### ⚠️ **production-schedule-api.tsx ยังไม่เสร็จ 100%**

ไฟล์นี้สร้างโครงสร้างพื้นฐานแล้ว แต่ยังขาดส่วนแสดงผล (UI) หลัก

**ทำอย่างไหน:**

#### วิธีที่ 1: Copy UI จากเวอร์ชันเดิม (แนะนำ)
1. เปิดไฟล์ `components/production-schedule.tsx` (เดิม)
2. Copy ส่วน JSX ทั้งหมดตั้งแต่บรรทัด ~582 (`return (`) ถึงจบ
3. Paste แทนที่ใน `production-schedule-api.tsx` ส่วน `return ()`
4. แก้ไข:
   - `task.name` → `task.job_name`
   - `task.startTime` → `task.start_time`
   - `task.endTime` → `task.end_time`
   - `task.image` → `task.product_image`

#### วิธีที่ 2: ใช้เวอร์ชันเดิมก่อน แล้วค่อยแก้ไข
ใช้ `production-schedule.tsx` (เดิม) ไปก่อน แล้วค่อยๆ แก้ให้ดึงข้อมูลจาก API ทีละส่วน

---

## 🧪 การทดสอบ

### 1. ตรวจสอบว่า Backend ทำงาน
```bash
# เปิด Browser
http://localhost:3107/api/health
http://localhost:3107/api/workplans?date=2025-10-08
```

### 2. ตรวจสอบ Console
เปิด Browser DevTools (F12) → Console Tab

**ดูข้อความ:**
- ✅ `Loading work plans for date: YYYY-MM-DD`
- ✅ `Loaded XX tasks`

**ถ้าเจอ Error:**
- ❌ `Failed to fetch` → Backend ไม่ทำงาน หรือ CORS ผิด
- ❌ `404 Not Found` → URL API ผิด
- ❌ `CORS error` → Backend CORS config ผิด

### 3. ทดสอบ Features
- [  ] แสดงตารางการผลิต
- [  ] มีข้อมูลจาก Database (ไม่ใช่ hardcode)
- [  ] Avatar แสดงถูกต้อง
- [  ] Product Images แสดง (หรือ placeholder)
- [  ] สีของงานถูกต้อง (ตามลำดับ)
- [  ] Export Excel ได้
- [  ] พิมพ์ได้

---

## 🐛 แก้ไขปัญหาที่พบบ่อย

### ปัญหา 1: Cannot find module '@/lib/api'
```bash
# ตรวจสอบว่าไฟล์อยู่ที่ถูกต้อง
ls lib/api.ts
ls lib/constants.ts
ls types/index.ts

# ถ้าไม่มี ให้สร้างใหม่ตามเอกสาร
```

### ปัญหา 2: Failed to fetch
```
Error: Failed to fetch from http://localhost:3107
```

**แก้ไข:**
1. ตรวจสอบ Backend ทำงานหรือไม่ (port 3107)
2. ตรวจสอบ `.env.local` มีการตั้งค่า `NEXT_PUBLIC_API_URL` ถูกต้อง
3. Restart Next.js dev server

### ปัญหา 3: CORS Error
```
Access to fetch at 'http://localhost:3107/api/workplans' 
from origin 'http://localhost:3017' has been blocked by CORS policy
```

**แก้ไข:**
ตรวจสอบ Backend `.env`:
```env
CORS_ORIGIN=*
```

### ปัญหา 4: Avatar/Image ไม่แสดง
**เหตุผล:** Path ไม่ถูกต้อง หรือไฟล์ไม่มีอยู่จริง

**ตรวจสอบ:**
```bash
# ตรวจสอบไฟล์รูป
ls public/images/*.jpg
ls public/*.jpg
```

**แก้ไข:**
- ใช้ `/placeholder-user.jpg` สำหรับ avatar ที่ไม่มี
- ใช้ `/placeholder.jpg` สำหรับ product image ที่ไม่มี

---

## 📊 การเปรียบเทียบ

| Feature | เวอร์ชันเดิม (Hardcode) | เวอร์ชันใหม่ (API) |
|---------|------------------------|-------------------|
| ข้อมูล | Hardcoded ในไฟล์ | ดึงจาก Database |
| สี | ฟิกต่องาน | ฟิกต่อลำดับ |
| Avatar | Hardcoded path | Map จาก id_code |
| Product Image | Hardcoded | Map จาก job_name |
| วันที่ | วันนี้ (hardcode) | วันที่จาก API |
| Loading State | ไม่มี | มี |
| Error Handling | ไม่มี | มี |

---

## 🎯 Next Steps

1. [ ] สร้างไฟล์ `.env.local`
2. [ ] รัน Backend (`npm run dev` ใน /backend)
3. [ ] รัน Frontend (`npm run dev` ใน root)
4. [ ] ทดสอบ API endpoint
5. [ ] เลือก Component version ที่จะใช้
6. [ ] (Optional) เพิ่ม Date Picker
7. [ ] (Optional) เพิ่ม Process Steps

---

## 📞 ต้องการความช่วยเหลือ?

- ดูเอกสารใน `/docs` folder
- ตรวจสอบ `backend/SETUP_GUIDE.md`
- ตรวจสอบ `docs/DEPLOYMENT_ISSUES.md`

---

**Created**: 10 ตุลาคม 2025  
**Status**: Development In Progress  
**Next**: Complete production-schedule-api.tsx UI





