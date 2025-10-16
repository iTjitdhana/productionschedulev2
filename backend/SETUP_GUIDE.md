# 🚀 Backend Setup Guide

## ขั้นตอนการติดตั้งและรัน Backend

### ✅ สิ่งที่ทำเสร็จแล้ว:
- [x] สร้างโครงสร้างโปรเจกต์
- [x] ติดตั้ง dependencies
- [x] สร้างไฟล์ .env
- [x] เขียน API endpoints
- [x] Database configuration

### 📝 การรัน Backend

#### 1. **เปิด Terminal แยก** (สำคัญ!)
เปิด Command Prompt หรือ PowerShell แยกหน้าต่างใหม่

#### 2. **เข้าไปที่โฟลเดอร์ backend**
```bash
cd "d:\production-schedule V1\backend"
```

#### 3. **รัน Development Server**
```bash
npm run dev
```

**คุณจะเห็น:**
```
============================================================
🚀 Production Schedule Backend API
   Environment: development
   Server running on: http://0.0.0.0:3107
   API prefix: /api
   CORS: *
============================================================
Available endpoints:
   GET  /api/health
   GET  /api/workplans?date=YYYY-MM-DD
   GET  /api/workplans/:id
============================================================
✅ Database connected successfully
   Host: 192.168.0.96
   Database: manufacturing_system
   Timezone: +07:00
```

✅ **ถ้าเห็นแบบนี้ = สำเร็จ!**

---

### 🧪 ทดสอบ Backend

#### วิธีที่ 1: ใช้ Test Script
เปิด Terminal แยกอีกหน้าต่างใหม่:
```bash
cd "d:\production-schedule V1\backend"
node test-api.js
```

#### วิธีที่ 2: ใช้ Browser
เปิด Browser แล้วไปที่:
- http://localhost:3107/
- http://localhost:3107/api/health
- http://localhost:3107/api/workplans?date=2025-10-08

#### วิธีที่ 3: ใช้ curl (ถ้ามี)
```bash
curl http://localhost:3107/api/health
curl http://localhost:3107/api/workplans?date=2025-10-08
```

---

### ❌ แก้ไขปัญหาที่พบบ่อย

#### ปัญหา 1: Database Connection Failed
```
❌ Database connection failed: ECONNREFUSED
```

**แก้ไข:**
1. ตรวจสอบว่า MySQL Server ทำงานอยู่
2. ตรวจสอบ IP/Port ใน `.env` ถูกต้อง
3. ตรวจสอบ Firewall ไม่บล็อก port 3306
4. ทดสอบด้วย:
   ```bash
   cd "d:\production-schedule V1"
   node test-db-connection.js
   ```

#### ปัญหา 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3107
```

**แก้ไข:**
```bash
# Windows
netstat -ano | findstr :3107
taskkill /F /PID <PID>

# หรือเปลี่ยน PORT ใน .env
PORT=3108
```

#### ปัญหา 3: Cannot Find Module
```
Error: Cannot find module 'express'
```

**แก้ไข:**
```bash
cd "d:\production-schedule V1\backend"
npm install
```

---

### 🌐 การทดสอบจากเครื่องอื่น

#### 1. หา IP ของเครื่องคุณ
```bash
# Windows
ipconfig

# มองหา IPv4 Address เช่น 192.168.0.50
```

#### 2. เปิด Firewall
```powershell
# เปิด port 3107
New-NetFirewallRule -DisplayName "Backend API" -Direction Inbound -LocalPort 3107 -Protocol TCP -Action Allow
```

#### 3. ทดสอบจากเครื่องอื่น
เปิด Browser บนเครื่องอื่นแล้วไปที่:
```
http://192.168.0.50:3107/api/health
http://192.168.0.50:3107/api/workplans?date=2025-10-08
```

---

### 📊 API Response Examples

#### Success Response
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "date": "2025-10-08",
    "total": 17,
    "timezone": "Asia/Bangkok"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)",
  "errors": [
    {
      "field": "date",
      "message": "Invalid date format"
    }
  ]
}
```

#### Empty Data
```json
{
  "success": true,
  "data": [],
  "message": "ไม่พบข้อมูลในวันที่ระบุ",
  "meta": {
    "date": "2025-10-09",
    "total": 0,
    "timezone": "Asia/Bangkok"
  }
}
```

---

### 🛑 หยุด Backend Server

กดที่ Terminal ที่รัน backend แล้วกด:
```
Ctrl + C
```

---

### 📝 หมายเหตุ

- Backend รันบน port **3107**
- ใช้ **0.0.0.0** เพื่อให้เครื่องอื่นเข้าถึงได้
- CORS ตั้งเป็น **\*** (allow all) สำหรับ development
- Timezone ใช้ **Asia/Bangkok** (+07:00)

---

**เมื่อ Backend ทำงานแล้ว** → ไปต่อที่ Frontend! 🎨





