# ✅ Final Setup Instructions

## 🎉 **ทุกอย่างพร้อมแล้ว!**

---

## 🚀 **วิธีรันระบบ (ทีละขั้นตอน)**

### **Step 1: เปิด Terminal สำหรับ Backend**

```powershell
cd "d:\production-schedule V1\backend"
npm run dev
```

**✅ ต้องเห็น:**
```
🔍 Environment check:
   DB_HOST: ✓
   DB_USER: ✓
   DB_PASSWORD: ✓ (hidden)
   DB_NAME: ✓
============================================================
🚀 Production Schedule Backend API
   Server running on: http://0.0.0.0:3107
============================================================
✅ Database connected successfully
   Host: 192.168.0.96
   Database: manufacturing_system
```

---

### **Step 2: เปิด Terminal สำหรับ Frontend (แยกต่างหาก)**

```powershell
cd "d:\production-schedule V1"
npm run dev
```

**✅ ต้องเห็น:**
```
▲ Next.js 15.2.4
- Local:        http://localhost:3017
✓ Ready in XXXms
```

---

### **Step 3: เปิด Browser**

#### 1. ทดสอบ Backend:
- http://localhost:3107/api/health
  
  **ต้องเห็น:**
  ```json
  {
    "success": true,
    "status": "ok",
    "database": "connected"
  }
  ```

- http://localhost:3107/api/workplans?date=2025-10-08
  
  **ต้องเห็น:**
  ```json
  {
    "success": true,
    "data": [ ... 17 งาน ... ],
    "meta": {
      "date": "2025-10-08",
      "total": 17
    }
  }
  ```

#### 2. เปิด Frontend:
- http://localhost:3017

  **ควรเห็น:**
  - ✅ ตารางการผลิต
  - ✅ 17 งาน (วันที่ 2025-10-08)
  - ✅ ผู้ปฏิบัติงานพร้อมรูปโปรไฟล์
  - ✅ สีแตกต่างกันตามลำดับ
  - ✅ Console log: "✅ Loaded XX tasks"

---

## 🎨 **สิ่งที่เปลี่ยนแปลง**

### ✅ **Frontend เชื่อมต่อ API แล้ว!**

**Before (Hardcoded):**
```typescript
const productionTasks = [ ... hardcoded data ... ]
```

**After (API):**
```typescript
// Load from API
useEffect(() => {
  fetchWorkPlans(selectedDate)
    .then(response => {
      const tasks = response.data.map((wp, i) => 
        mapAPIDataToTask(wp, i)
      )
      setProductionTasks(tasks)
    })
}, [selectedDate])
```

### ✅ **Features ที่ทำงาน:**

1. **Data Loading:**
   - ✅ ดึงข้อมูลจาก Database (ผ่าน Backend API)
   - ✅ Loading state ขณะโหลด
   - ✅ Error handling ถ้า API ล้มเหลว
   - ✅ Empty state ถ้าไม่มีข้อมูล

2. **Avatar & Images:**
   - ✅ Map avatar จาก `id_code` → `/images/xxx.jpg`
   - ✅ Map product image จาก `job_name` → รูปที่เหมาะสม
   - ✅ Fallback เป็น placeholder ถ้าไม่มีรูป

3. **Colors:**
   - ✅ กำหนดสีตามลำดับการแสดง (ไม่ฟิกที่งาน)
   - ✅ ใช้ COLOR_PALETTE (12 สี) วนรอบ

4. **Timezone:**
   - ✅ ใช้ Asia/Bangkok (+07:00)
   - ✅ ไม่หลุดวันที่

5. **Export & Print:**
   - ✅ Export ทั้งหมดเป็น Excel
   - ✅ Export งานเดียวเป็น Excel
   - ✅ พิมพ์ตาราง

---

## 📊 **ข้อมูลที่แสดง**

### วันที่มีข้อมูล:
- **2025-10-08** (17 งาน) ← ใช้ทดสอบ
- **2025-10-09** (9 งาน)
- **2025-10-07** (10 งาน)
- **2025-10-06** (11 งาน)

### ตัวอย่างงาน:
```
1. แป้งจุ๋ยก๊วย (08:30-15:00)
2. น่องไก่ติดสะโพกชุบแป้งทอด (08:30-12:00)
3. ซี่โครงตุ๋น (08:30-14:30)
4. น่องไก่ติดสะโพก คละไซส์ - CT (08:30-16:00)
...
```

### Operators (แสดงพร้อมรูป):
- ae → เอ → `/images/a.jpg`
- arm → อาร์ม → `/images/arm.jpg`
- pha → พี่ภา → `/images/pa.jpg`
- noi → ป้าน้อย → `/images/ya-noi.jpg`
- etc.

---

## 🔍 **ตรวจสอบการทำงาน**

### เปิด Browser Console (F12):

**ถ้าสำเร็จจะเห็น:**
```
🔄 Loading work plans for date: 2025-10-08
✅ Loaded 17 tasks
```

**ถ้ามี Error:**
```
❌ Error loading work plans: ...
```
- ตรวจสอบว่า Backend ทำงานอยู่
- ตรวจสอบ .env.local มี `NEXT_PUBLIC_API_URL`
- ตรวจสอบ CORS

---

## 🌐 **เข้าถึงจากเครื่องอื่น**

### 1. หา IP ของเครื่อง Server:
```powershell
ipconfig
```
มองหา **IPv4 Address** เช่น `192.168.0.50`

### 2. เปิด Firewall:
```powershell
# เปิด port 3017 และ 3107
New-NetFirewallRule -DisplayName "Frontend 3017" -Direction Inbound -LocalPort 3017 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Backend 3107" -Direction Inbound -LocalPort 3107 -Protocol TCP -Action Allow
```

### 3. จากเครื่องอื่น:
```
http://192.168.0.50:3017     ← Frontend
http://192.168.0.50:3107/api/health  ← Backend
```

**⚠️ ต้องแก้ `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://192.168.0.50:3107
```
*(แทน localhost)*

---

## 🐛 **Troubleshooting**

### Backend ไม่ทำงาน
```bash
# ตรวจสอบ port
netstat -ano | findstr :3107

# Kill process
taskkill /F /PID <PID>

# รันใหม่
cd "d:\production-schedule V1\backend"
npm run dev
```

### Frontend ไม่เชื่อม Backend
```bash
# ตรวจสอบ .env.local
cat .env.local

# ต้องมี
NEXT_PUBLIC_API_URL=http://localhost:3107
```

### Database ไม่เชื่อมต่อ
```bash
# ทดสอบ
cd "d:\production-schedule V1"
node test-db-connection.js
```

---

## ✅ **Checklist สุดท้าย**

- [ ] Backend รันได้ (Terminal 1)
- [ ] Frontend รันได้ (Terminal 2)
- [ ] เปิด http://localhost:3017 เห็นตาราง
- [ ] เห็นข้อมูลจาก Database (ไม่ใช่ hardcode)
- [ ] Console log แสดง "✅ Loaded XX tasks"
- [ ] Avatar แสดงถูกต้อง
- [ ] Product images แสดง (หรือ placeholder)
- [ ] Export Excel ทำงาน
- [ ] พิมพ์ทำงาน

**ถ้าครบทุกข้อ → สำเร็จ! 🎉**

---

## 📝 **โครงสร้างที่ได้**

```
d:\production-schedule V1/
├── backend/              ✅ Express API (Port 3107)
│   ├── src/
│   │   ├── config/      ✅ Database
│   │   ├── controllers/ ✅ API Controllers
│   │   ├── services/    ✅ Business Logic
│   │   ├── routes/      ✅ API Routes
│   │   └── middlewares/ ✅ CORS, Errors
│   ├── .env             ✅ Config
│   └── package.json     ✅
│
├── app/                 ✅ Next.js (Port 3017)
├── components/          ✅ React Components
│   └── production-schedule.tsx  ✅ เชื่อม API แล้ว
├── lib/                 ✅ API Client & Helpers
│   ├── api.ts          ✅ fetchWorkPlans()
│   └── constants.ts    ✅ Colors, Avatars, Images
├── types/              ✅ TypeScript Types
├── public/images/      ✅ Worker Avatars
├── docs/               ✅ Documentation
└── .env.local          ✅ Frontend Config
```

---

## 🎯 **Next Steps (อนาคต)**

- [ ] Date Picker (เลือกวันได้)
- [ ] Process Steps Display (ขั้นตอนย่อย)
- [ ] User Authentication
- [ ] CRUD Operations
- [ ] Real-time Updates

---

**Created**: 10 ตุลาคม 2025  
**Status**: ✅ COMPLETED  
**Ready to Use**: YES 🚀





