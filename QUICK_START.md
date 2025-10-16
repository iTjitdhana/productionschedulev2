# ⚡ Quick Start Guide

## 🚀 รันระบบใน 5 นาที

### ขั้นตอนที่ 1: Backend (Terminal #1)
```bash
cd "d:\production-schedule V1\backend"

# สร้าง .env (ถ้ายังไม่มี)
echo PORT=3107 > .env
echo DB_HOST=192.168.0.96 >> .env
echo DB_USER=jitdhana >> .env
echo DB_PASSWORD=Jitdana@2025 >> .env
echo DB_NAME=manufacturing_system >> .env
echo CORS_ORIGIN=* >> .env

# รัน Backend
npm run dev
```

**✅ ต้องเห็นข้อความ:**
```
============================================================
🚀 Production Schedule Backend API
   Server running on: http://0.0.0.0:3107
============================================================
✅ Database connected successfully
```

---

### ขั้นตอนที่ 2: Frontend (Terminal #2)
```bash
cd "d:\production-schedule V1"

# สร้าง .env.local (ถ้ายังไม่มี)
echo NEXT_PUBLIC_API_URL=http://localhost:3107 > .env.local

# รัน Frontend
npm run dev
```

**✅ ต้องเห็นข้อความ:**
```
Ready in XXXms
Local: http://localhost:3017
```

---

### ขั้นตอนที่ 3: ทดสอบ

#### 1. ทดสอบ Backend
เปิด Browser: http://localhost:3107/api/health

**ต้องเห็น:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

#### 2. ทดสอบ API
เปิด: http://localhost:3107/api/workplans?date=2025-10-08

**ต้องเห็นข้อมูลงาน 17 รายการ**

#### 3. ทดสอบ Frontend
เปิด: http://localhost:3017

**ควรเห็นตารางการผลิต**

---

## 🐛 แก้ไขปัญหา

### Backend ไม่ทำงาน
```bash
# ตรวจสอบ port ชน
netstat -ano | findstr :3107

# Kill process
taskkill /F /PID <PID>
```

### Database ไม่เชื่อมต่อ
```bash
# ทดสอบ Database
cd "d:\production-schedule V1"
node test-db-connection.js
```

### Frontend Error
```bash
# ตรวจสอบ .env.local
cat .env.local

# ควรมี
NEXT_PUBLIC_API_URL=http://localhost:3107
```

---

## 📚 เอกสารเพิ่มเติม

- `PROJECT_SUMMARY.md` - สรุปทุกอย่าง
- `backend/SETUP_GUIDE.md` - Backend detailed guide
- `FRONTEND_SETUP.md` - Frontend detailed guide
- `docs/DEPLOYMENT_ISSUES.md` - แก้ปัญหาการ Deploy

---

## ✅ Checklist

- [ ] Backend รันได้ (port 3107)
- [ ] Database เชื่อมต่อสำเร็จ
- [ ] API ส่งข้อมูลได้ (/api/health, /api/workplans)
- [ ] Frontend รันได้ (port 3017)
- [ ] .env.local มีการตั้งค่า API_URL
- [ ] เห็นตารางการผลิต

---

**หาก Checklist ✅ หมด → พร้อมใช้งาน! 🎉**





