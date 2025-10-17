# 🔧 DEV STANDARD – ส่วนเพิ่มเติม (Lessons Learned)

> ⚠️ เพิ่มส่วนนี้เข้าไปใน DEV_STANDARD.md เพื่อป้องกันปัญหาที่พบบ่อย

---

## 19. Docker Deployment Best Practices

### 🔹 Network Mode Selection

**กฎสำคัญ:** Backend ที่ต้องเชื่อมต่อ Database ภายนอก Docker ควรใช้ **host network**

```yaml
# ❌ ไม่แนะนำ: Bridge network (ถ้า DB อยู่นอก Docker)
services:
  backend:
    networks:
      - app-network
    # Backend จะใช้ IP แบบ 172.x.x.x
    # MySQL ต้องให้สิทธิ์ทุก Docker IP range

# ✅ แนะนำ: Host network (ถ้า DB อยู่นอก Docker)
services:
  backend:
    network_mode: "host"
    # Backend ใช้ host IP โดยตรง
    # MySQL เห็น connection จาก server IP
```

**เหตุผล:**
- ✅ Database ไม่ต้องเปิดสิทธิ์ให้ Docker subnet ทั้งหมด
- ✅ ปลอดภัยกว่า (ควบคุม IP ได้ชัดเจน)
- ✅ ไม่ต้องแก้ database permissions

**ข้อจำกัด:**
- ⚠️ Backend ต้อง bind port ที่ไม่ซ้ำกับ host
- ⚠️ ใช้ได้ดีกับ Linux, อาจมีข้อจำกัดบน Mac/Windows

---

## 20. Environment Files Management

### 🔹 .gitignore Configuration for .env

**ปัญหา:** `.env.*` ทั้งหมดถูก ignore รวมถึง `.env.example`

**วิธีแก้:**
```gitignore
# Environment variables
.env
.env.*
!.env.example          # ⚠️ MUST allow .env.example to be committed
!backend/.env.example  # รวมถึง backend
!frontend/.env.example # และ frontend
```

**กฎสำคัญ:**
1. ✅ **ต้อง commit `.env.example`** เพื่อให้คนอื่น clone ได้ง่าย
2. ✅ `.env.example` ต้อง**ไม่มี credentials จริง**
3. ✅ ใช้ค่า placeholder เช่น `DB_PASSWORD=your_password_here`
4. ❌ **ห้าม commit `.env.development` หรือ `.env.production`**

### 🔹 Setup Script Pattern

สร้าง script สำหรับ setup environment:

**`setup-env.sh` (Linux/Mac):**
```bash
#!/bin/bash
echo "🔧 Setting up environment files..."

# Copy templates
cp .env.example .env.development
cp backend/.env.example backend/.env.development

echo "✅ Done! Please update credentials in .env files"
```

**`setup-env.ps1` (Windows PowerShell):**
```powershell
Write-Host "🔧 Setting up environment files..." -ForegroundColor Cyan
Copy-Item .env.example .env.development
Copy-Item backend\.env.example backend\.env.development
Write-Host "✅ Done! Please update credentials in .env files" -ForegroundColor Green
```

---

## 21. Dependencies Selection Guidelines

### 🔹 หลีกเลี่ยง ESM/CommonJS Conflicts

**ปัญหา:** package บางตัว (เช่น `uuid` v9+) เป็น pure ESM แต่ TypeScript compile เป็น CommonJS

**แนวทางแก้:**

#### วิธีที่ 1: ใช้ Node.js Built-in Modules (แนะนำ)
```typescript
// ❌ ไม่แนะนำ: External package ที่อาจมี ESM conflict
import { v4 as uuidv4 } from 'uuid';

// ✅ แนะนำ: ใช้ Node.js built-in
import crypto from 'crypto';
const id = crypto.randomUUID();
```

**Node.js Built-in Modules ที่ควรใช้:**
- `crypto.randomUUID()` แทน `uuid`
- `crypto.createHash()` แทน `bcrypt` (สำหรับ hash อย่างง่าย)
- `fs/promises` แทน `fs-extra`
- `path`, `url`, `querystring` built-in

#### วิธีที่ 2: Lock Package Version
```json
{
  "dependencies": {
    "uuid": "8.3.2"  // ใช้ version เก่าที่ยัง support CommonJS
  }
}
```

#### วิธีที่ 3: เปลี่ยนเป็น ESM ทั้งหมด
```json
// package.json
{
  "type": "module",  // เปลี่ยน project เป็น ESM
  ...
}
```

### 🔹 Dependencies Checklist

ก่อนติดตั้ง package ใหม่:
- [ ] ตรวจสอบ package เป็น ESM หรือ CommonJS
- [ ] ดูว่ามี Node.js built-in แทนได้หรือไม่
- [ ] ตรวจสอบ bundle size และ dependencies tree
- [ ] อ่าน CHANGELOG เพื่อหา breaking changes

---

## 22. Port Management Strategy

### 🔹 Port Allocation Standard

**กำหนด port range ให้ชัดเจนตั้งแต่เริ่มโปรเจกต์:**

```bash
# Development
Frontend:  3000-3099
Backend:   3100-3199
Database:  3200-3299

# Production/Staging
Frontend:  4000-4099
Backend:   4100-4199
```

**ตัวอย่าง:**
```yaml
# infra/docker-compose.dev.yml
services:
  frontend:
    ports:
      - "3017:3017"  # Dev port
  backend:
    ports:
      - "3107:3107"  # Dev port

# infra/docker-compose.prod.yml
services:
  frontend:
    ports:
      - "4017:3017"  # Prod external:internal
  backend:
    network_mode: "host"  # Use host network
    # PORT=4107 in .env
```

### 🔹 Port Conflict Resolution

**ขั้นตอนตรวจสอบ:**
```bash
# Linux
sudo lsof -i :3017
sudo netstat -tlnp | grep 3017

# Windows
netstat -ano | findstr :3017

# Docker
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

**ถ้า port ถูกใช้:**
1. หยุด service ที่ใช้ port นั้น (ถ้าไม่ต้องการ)
2. เปลี่ยน port ใน docker-compose.yml
3. อัปเดต .env.production ให้ตรงกัน

---

## 23. Database Access Patterns

### 🔹 Connection Pool Configuration

**ตาม DEV_STANDARD ข้อ 18 + เพิ่มเติม:**

```typescript
// ✅ ใช้ Connection Pool (แนะนำ)
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// ❌ ห้ามใช้ createConnection (single connection)
```

### 🔹 Database Permissions Setup

**สำหรับ Production:**
```sql
-- สร้าง user เฉพาะสำหรับ application
CREATE USER 'app_user'@'192.168.0.%' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON app_db.* TO 'app_user'@'192.168.0.%';
FLUSH PRIVILEGES;

-- ❌ ห้ามใช้ root
-- ❌ ห้ามใช้ '%' wildcard (ยกเว้น development)
```

---

## 24. Docker Troubleshooting Guide

### 🔹 Common Issues

#### 1. Container Restarting Loop
```bash
# ดู logs
docker logs container-name

# สาเหตุที่พบบ่อย:
# - Missing .env file
# - Database connection failed
# - Port already in use
# - Module import error
```

#### 2. Build Failed
```bash
# ลบ cache และ rebuild
docker compose down --rmi all -v
docker system prune -f
docker compose up -d --build --no-cache
```

#### 3. Network Issues
```bash
# ตรวจสอบ network
docker network ls
docker network inspect infra_prod-network

# สร้าง network ใหม่
docker network rm infra_prod-network
docker compose up -d
```

#### 4. Database Connection Failed
```bash
# ตรวจสอบจาก container
docker exec -it container-name sh
ping database-host
mysql -h host -u user -p

# แก้ไข: ใช้ host network
services:
  backend:
    network_mode: "host"
```

---

## 25. Deployment Checklist

### 🔹 Pre-Deployment

- [ ] สร้าง `.env.production` และตรวจสอบ credentials
- [ ] สร้าง git tag สำหรับ version
- [ ] Backup database
- [ ] ทดสอบ build บน local
- [ ] ตรวจสอบ ports ไม่ conflict
- [ ] อัปเดต CORS_ORIGIN ให้ตรง
- [ ] เปลี่ยน LOG_LEVEL=info สำหรับ production
- [ ] เปิด Helmet และ Rate Limiting

### 🔹 Deployment

```bash
# 1. Pull code
git fetch --all
git checkout v1.5.0

# 2. Setup environment
cp .env.example .env.production
nano .env.production  # แก้ไขค่า

# 3. Deploy
docker compose -f infra/docker-compose.prod.yml up -d --build

# 4. Verify
docker compose -f infra/docker-compose.prod.yml ps
curl http://localhost:PORT/api/health

# 5. Monitor logs
docker compose -f infra/docker-compose.prod.yml logs -f
```

### 🔹 Post-Deployment

- [ ] ทดสอบ API endpoints
- [ ] ตรวจสอบ database connections
- [ ] ทดสอบจากเครื่องอื่นใน LAN
- [ ] ตั้ง monitoring/alerts
- [ ] บันทึก version ที่ deploy

### 🔹 Rollback Plan

```bash
# ถ้ามีปัญหา - rollback ทันที
git checkout v1.4.0
docker compose -f infra/docker-compose.prod.yml up -d --build
```

---

## 26. AI Assistant Guidelines

### 🔹 คำสั่งสำหรับ Cursor/AI

เมื่อ AI ช่วยพัฒนา ต้อง:

1. **อ่าน DEV_STANDARD.md ก่อนเสมอ**
   - ตรวจสอบว่าโค้ดใหม่เป็นไปตามมาตรฐาน
   - ไม่ hardcode ค่าใดๆ

2. **ตรวจสอบ dependencies**
   - เลือก package ที่ไม่มี ESM conflict
   - ใช้ Node.js built-in เมื่อเป็นไปได้

3. **Docker deployment**
   - ใช้ host network สำหรับ backend + external DB
   - ตรวจสอบ port conflicts

4. **Environment files**
   - สร้าง `.env.example` ที่ commit ได้
   - ไม่ commit `.env.production`

5. **Git workflow**
   - ใช้ Conventional Commits
   - สร้าง tag ทุกครั้งที่ deploy

---

## 27. Quick Reference

### 🔹 คำสั่งที่ใช้บ่อย

```bash
# Development
npm run dev                    # Frontend
cd backend && npm run dev      # Backend

# Production Deploy
git pull origin main
docker compose -f infra/docker-compose.prod.yml up -d --build

# Troubleshooting
docker compose -f infra/docker-compose.prod.yml logs -f backend
docker exec -it container-name sh
curl http://localhost:PORT/api/health

# Rollback
git checkout v1.4.0
docker compose -f infra/docker-compose.prod.yml up -d --build
```

### 🔹 ไฟล์สำคัญที่ต้องตรวจสอบ

```
project/
├─ .env.example              ✅ Must commit
├─ .env.production           ❌ Never commit
├─ backend/.env.example      ✅ Must commit
├─ backend/.env.production   ❌ Never commit
├─ infra/
│   ├─ docker-compose.dev.yml
│   ├─ docker-compose.prod.yml
│   └─ nginx.conf (optional)
├─ DEV_STANDARD.md          ✅ Must read first
└─ README.md                ✅ Update regularly
```

---

## สรุป: Lessons Learned

จากการ deploy จริง พบปัญหาและแก้ไขดังนี้:

1. ✅ **.env.example ต้อง commit ได้** - แก้ .gitignore
2. ✅ **ใช้ Node.js built-in แทน external packages** - หลีกเลี่ยง conflicts
3. ✅ **Backend ใช้ host network** - แก้ปัญหา DB permissions
4. ✅ **จัดการ ports อย่างมีระบบ** - ป้องกัน conflicts
5. ✅ **มี troubleshooting guide** - แก้ปัญหาได้เร็วขึ้น

**ข้อเสนอแนะ:**
- เพิ่มส่วนนี้เข้าไปใน DEV_STANDARD.md
- อัปเดตทุกครั้งที่เจอปัญหาใหม่
- ทำให้ AI assistant อ่านก่อนเริ่มงาน

