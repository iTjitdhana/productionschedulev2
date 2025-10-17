# 📊 Production Schedule System

ระบบตารางงานและกระบวนการผลิตสินค้าครัวกลาง - แสดงแผนการผลิตรายวันแบบ Gantt Chart

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-development-yellow)
![License](https://img.shields.io/badge/license-Proprietary-red)

---

## 🎯 ภาพรวม

ระบบนี้พัฒนาขึ้นเพื่อแสดงแผนการผลิตรายวันของครัวกลาง โดยดึงข้อมูลจาก Database จริง แสดงผลในรูปแบบ Timeline/Gantt Chart พร้อมรายละเอียดงาน ผู้ปฏิบัติงาน และสามารถ Export ข้อมูลเป็น Excel

### ✨ Features (Phase 1 - MVP)

- ✅ แสดงตารางการผลิตแบบ Timeline (8:00-17:00)
- ✅ ดึงข้อมูลจาก Database จริง (MySQL)
- ✅ แสดงผู้ปฏิบัติงานพร้อมรูปโปรไฟล์
- ✅ แสดงรูปภาพสินค้า
- ✅ รายละเอียดงานแบบ Modal
- ✅ Export ข้อมูลเป็น Excel
- ✅ พิมพ์ตาราง
- ✅ รองรับภาษาไทยเต็มรูปแบบ

---

## 🏗️ สถาปัตยกรรม

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │────► │   Backend   │────► │  Database   │
│  Next.js    │      │  Express    │      │   MySQL     │
│  Port: 3017 │      │  Port: 3107 │      │  Port: 3306 │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Technology Stack:

**Frontend:**
- Next.js 15.2.4
- React 19
- TypeScript
- TailwindCSS 4
- shadcn/ui

**Backend:**
- Express.js
- TypeScript
- mysql2 (promise-based)
- CORS

**Database:**
- MySQL 8.0+
- Configuration: See `.env.development` / `.env.production`
- Connection: Via environment variables (no hardcoded credentials)

---

## 📋 เอกสารประกอบ

- 📄 [REQUIREMENTS.md](./docs/REQUIREMENTS.md) - ความต้องการระบบ
- 🔧 [SPECSHEET.md](./docs/SPECSHEET.md) - รายละเอียดทางเทคนิค
- 🚨 [DEPLOYMENT_ISSUES.md](./docs/DEPLOYMENT_ISSUES.md) - ปัญหาที่พบบ่อยและวิธีแก้
- 📊 [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md) - โครงสร้าง Database

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm หรือ pnpm
- MySQL 8.0
- Access ไปยัง Database (192.168.0.96:3306)

### Installation

#### 1. Clone Repository (เตรียมไว้)
```bash
git clone <repository-url>
cd production-schedule-system
```

#### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

#### 3. Configuration

⚠️ **Environment Setup** (DEV_STANDARD Compliant)

**Step 1:** Create environment files from templates:

```bash
# Frontend
cp .env.example .env.development
cp .env.example .env.production

# Backend
cp backend/.env.example backend/.env.development
cp backend/.env.example backend/.env.production
```

**Step 2:** Update credentials in `.env.development` and `.env.production`

**⚠️ Never commit `.env*` files with real credentials to Git!**

Example values (see `.env.example` for full template):
```env
# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3107

# Backend
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=***
DB_NAME=manufacturing_system
```

#### 4. Run Development

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

#### 5. Open Browser
```
http://localhost:3017
```

---

## 🏗️ Project Structure

```
production-schedule-system/
├── frontend/                 # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── production-schedule.tsx
│   │   └── ui/              # shadcn components
│   ├── lib/
│   │   ├── api.ts          # API client
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── public/
│   │   └── images/         # Worker avatars
│   └── package.json
│
├── backend/                 # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── routes/
│   │   │   └── workplans.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   └── index.ts
│   ├── .env
│   └── package.json
│
├── docs/                    # Documentation
│   ├── REQUIREMENTS.md
│   ├── SPECSHEET.md
│   └── DEPLOYMENT_ISSUES.md
│
├── test-db-connection.js   # Database test script
└── README.md
```

---

## 🔧 API Endpoints

### Get Work Plans
```
GET /api/workplans?date=YYYY-MM-DD
```

**Example:**
```bash
curl http://localhost:3107/api/workplans?date=2025-10-08
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 7398,
      "job_code": "135042",
      "job_name": "น่องไก่ติดสะโพก คละไซส์ - CT",
      "start_time": "08:30",
      "end_time": "16:00",
      "location": "ห้องผัก",
      "assignees": [...]
    }
  ],
  "meta": {
    "date": "2025-10-08",
    "total": 17
  }
}
```

### Health Check
```
GET /api/health
```

---

## 🎨 Color Palette

สีของงานกำหนดตามลำดับการแสดง (ไม่ฟิกที่งาน):

```typescript
const COLOR_PALETTE = [
  'bg-orange-200',    // งานที่ 1
  'bg-lime-200',      // งานที่ 2
  'bg-yellow-200',    // งานที่ 3
  'bg-cyan-200',      // งานที่ 4
  'bg-purple-200',    // งานที่ 5
  'bg-emerald-200',   // งานที่ 6
  'bg-sky-200',       // งานที่ 7
  'bg-amber-200',     // งานที่ 8
  'bg-teal-200',      // งานที่ 9
  'bg-pink-200',      // งานที่ 10
  'bg-violet-200',    // งานที่ 11
  'bg-blue-200',      // งานที่ 12
];
```

---

## 🐛 Troubleshooting

### ปัญหา: เชื่อมต่อ Database ไม่ได้

```bash
# ทดสอบการเชื่อมต่อ
node test-db-connection.js
```

**ตรวจสอบ:**
- ✅ Database server ทำงาน
- ✅ User/Password ถูกต้อง
- ✅ Network เข้าถึง 192.168.0.96:3306 ได้
- ✅ Firewall ไม่บล็อก port

### ปัญหา: CORS Error

**แก้ไข Backend (.env):**
```env
CORS_ORIGIN=*
```

### ปัญหา: วันที่หลุด 1 วัน

**ใช้ Timezone ที่ถูกต้อง:**
```typescript
const today = new Date().toLocaleDateString('en-CA', {
  timeZone: 'Asia/Bangkok'
});
```

### ปัญหา: เข้าจากเครื่องอื่นไม่ได้

**ดู:** [DEPLOYMENT_ISSUES.md](./docs/DEPLOYMENT_ISSUES.md)

---

## 📦 Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm run start -p 3017
```

**Backend:**
```bash
cd backend
npm run build
npm start
```

### Environment Variables (Production)

Use `.env.production` files (created from `.env.example`):

**Frontend:** `.env.production`
```env
NEXT_PUBLIC_API_BASE_URL=http://your-server-ip:3107
NODE_ENV=production
```

**Backend:** `backend/.env.production`
```env
NODE_ENV=production
DB_HOST=your_db_host
DB_USER=***
DB_PASSWORD=***
CORS_ORIGIN=http://your-server-ip:3017
```

**⚠️ Security:** Update credentials and use strong passwords in production!

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start services
pm2 start ecosystem.config.js

# Save & Auto-restart
pm2 save
pm2 startup
```

---

## 🧪 Testing

### Test Database Connection
```bash
node test-db-connection.js
```

### Test Backend API
```bash
# Health check
curl http://localhost:3107/api/health

# Get work plans
curl http://localhost:3107/api/workplans?date=2025-10-08
```

---

## 📝 Known Issues

1. ⚠️ `production_room_id` เป็น NULL ในข้อมูล work_plans
2. ⚠️ `work_plan_operators.user_id` เป็น NULL, ใช้ `id_code` แทน
3. ⚠️ บาง `id_code` ไม่ match กับ users (เช่น 'Ola' vs 'ole')
4. ⚠️ ไม่มีข้อมูล `process_executions` (steps) สำหรับบางงาน

---

## 📦 Git Workflow & Version Control

This project follows **DEV_STANDARD.md** for version control and deployment.

### Branch Strategy
- `main` → Production-ready releases (tagged)
- `develop` → Integration branch for features
- `feature/<name>` → New features
- `fix/<name>` → Bug fixes

### Commit Message Convention
Follow **Conventional Commits**:

```bash
feat: เพิ่มระบบ export CSV
fix: แก้ปัญหา timezone ที่วันที่หลุด
chore: อัปเดต dependencies
docs: เพิ่มคำอธิบาย deployment
```

### Tagging & Releases

**Version Format:** `vMAJOR.MINOR.PATCH`

- **Major (v2.0.0):** Breaking changes
- **Minor (v1.1.0):** New features
- **Patch (v1.0.1):** Bug fixes

**Example:**
```bash
# After completing feature
git add .
git commit -m "feat: เพิ่มระบบจัดการผู้ใช้"
git tag v1.4.0
git push && git push --tags
```

### Deployment (Linux Server)

**Deploy new version:**
```bash
# On server
git fetch --all
git checkout v1.4.0
docker compose -f infra/docker-compose.prod.yml up -d --build
```

**Using Docker Compose:**
```bash
# Development
docker compose -f infra/docker-compose.dev.yml up -d

# Production
docker compose -f infra/docker-compose.prod.yml up -d --build
```

### Rollback Procedure

**If something goes wrong, rollback to previous version:**

```bash
# Step 1: Check available versions
git tag

# Step 2: Checkout previous stable version
git checkout v1.3.1

# Step 3: Rebuild and restart
docker compose -f infra/docker-compose.prod.yml up -d --build

# Step 4: Verify
curl http://localhost:3107/api/health
```

**Quick Rollback Commands:**
```bash
# Stop current version
docker compose -f infra/docker-compose.prod.yml down

# Checkout previous tag
git checkout v1.3.1

# Restart
docker compose -f infra/docker-compose.prod.yml up -d --build
```

---

## 🗺️ Roadmap

### Phase 1 (Current) - MVP
- [x] Basic UI/UX
- [x] Database integration
- [x] Display work plans
- [x] Export to Excel
- [x] Environment-based configuration (DEV_STANDARD)
- [x] Security middleware (Helmet, Rate Limit)
- [x] Health check endpoint with trace ID
- [ ] Bug fixes & optimization

### Phase 2 (Future)
- [ ] Process steps display
- [ ] Date picker
- [ ] User authentication
- [ ] CRUD operations
- [ ] Real-time updates
- [ ] Mobile responsive
- [ ] Reports & Analytics

---

## 👥 Team

- **Development**: [Your Team]
- **Database Admin**: [DBA Name]
- **Project Manager**: [PM Name]

---

## 📄 License

Proprietary - ใช้ภายในองค์กรเท่านั้น

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 📞 Support

หากพบปัญหาหรือมีคำถาม:
1. ดูเอกสารใน `/docs`
2. ตรวจสอบ [DEPLOYMENT_ISSUES.md](./docs/DEPLOYMENT_ISSUES.md)
3. ติดต่อทีมพัฒนา

---

**เอกสารนี้สร้างเมื่อ**: 10 ตุลาคม 2025  
**เวอร์ชัน**: 1.0.0  
**สถานะ**: Active Development





