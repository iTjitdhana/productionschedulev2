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
- MySQL 8.0
- Database: manufacturing_system
- Host: 192.168.0.96

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

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3107
```

**Backend (.env):**
```env
PORT=3107
DB_HOST=192.168.0.96
DB_USER=jitdhana
DB_PASSWORD=Jitdana@2025
DB_NAME=manufacturing_system
DB_PORT=3306
DB_TIMEZONE=+07:00
CORS_ORIGIN=*
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

**Frontend:**
```env
NEXT_PUBLIC_API_URL=http://192.168.0.50:3107
```

**Backend:**
```env
PORT=3107
NODE_ENV=production
CORS_ORIGIN=http://192.168.0.50:3017
# ... database config
```

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

## 🗺️ Roadmap

### Phase 1 (Current) - MVP
- [x] Basic UI/UX
- [x] Database integration
- [x] Display work plans
- [x] Export to Excel
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





