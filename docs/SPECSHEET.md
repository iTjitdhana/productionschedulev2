# 🔧 Technical Specification Sheet

## 📋 ข้อมูลโปรเจกต์

**ชื่อโปรเจกต์**: Production Schedule System  
**เวอร์ชัน**: 2.0.0 (Planning Phase 2 & 3)  
**วันที่สร้าง**: 10 ตุลาคม 2025  
**วันที่อัปเดต**: 15 ตุลาคม 2025  
**สถานะ**: Phase 1 Complete → Phase 2 Planning

---

## 🏗️ สถาปัตยกรรมระบบ (Architecture)

### แบบ Monorepo (แนะนำ):
```
production-schedule-system/
├── frontend/                 # Next.js App (Port 3017)
├── backend/                  # Express API (Port 3107)
└── docs/                     # Documentation
```

### หรือแบบ Separate Repositories:
```
├── production-schedule-frontend/
└── production-schedule-backend/
```

---

## 🎨 Frontend Specification

### Technology Stack:
```json
{
  "framework": "Next.js 15.2.4",
  "runtime": "React 19.2.0",
  "language": "TypeScript 5.x",
  "styling": "TailwindCSS 4.1.9",
  "ui-components": "shadcn/ui (Radix UI)",
  "icons": "Lucide React",
  "fonts": "Noto Sans Thai (Google Fonts)",
  "http-client": "fetch API (native)",
  "excel-export": "xlsx (latest)",
  "date-handling": "date-fns 4.1.0"
}
```

### Project Structure:
```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/
│   ├── production-schedule.tsx # Main component
│   ├── task-bar.tsx           # Task display
│   ├── task-detail-modal.tsx  # Modal component
│   └── ui/                    # shadcn components
├── lib/
│   ├── api.ts                 # API client
│   ├── utils.ts               # Utility functions
│   └── constants.ts           # Constants (colors, etc.)
├── types/
│   └── index.ts               # TypeScript types
├── public/
│   └── images/                # Static assets
├── .env.local                 # Environment variables
└── package.json
```

### Environment Variables (.env.local):
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3107
NEXT_PUBLIC_API_TIMEOUT=10000

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_EXCEL_EXPORT=true
NEXT_PUBLIC_ENABLE_PRINT=true
```

### Key Components:

#### 1. ProductionSchedule Component:
```typescript
interface ProductionTask {
  id: number;
  job_code: string;
  job_name: string;
  start_time: string;        // "08:00"
  end_time: string;          // "12:50"
  location: string;          // "ห้องผัก"
  product_image?: string;    // "/fresh-vegetables.jpg"
  color?: string;            // "bg-orange-200" (assigned by frontend)
  assignees: Assignee[];
  steps?: ProcessStep[];     // Phase 2
}

interface Assignee {
  id_code: string;           // "ae", "arm"
  name: string;              // "เอ", "อาร์ม"
  avatar: string;            // "/images/a.jpg"
}

// Phase 2: Standard Time Display
interface ProcessStep {
  process_number: number;
  process_description: string;
  estimated_duration_minutes: number;
  standard_worker_count: number;
  percentage: number;  // % of total time
}

// Phase 3: Add Actual Time Comparison
interface ProcessStepWithActual extends ProcessStep {
  // Actual execution data
  actual_duration_minutes?: number;
  actual_start_time?: string;
  actual_end_time?: string;
  actual_worker_count?: number;
  
  // Comparison metrics
  efficiency_percent?: number;  // (estimated / actual) * 100
  time_status: 'on-time' | 'faster' | 'delayed' | 'pending';
  time_variance_minutes?: number;  // actual - estimated
  
  // Actual operators
  actual_operators?: Assignee[];
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'paused';
}
```

#### 2. Color Palette:
```typescript
const COLOR_PALETTE = [
  'bg-orange-200',    // 1
  'bg-lime-200',      // 2
  'bg-yellow-200',    // 3
  'bg-cyan-200',      // 4
  'bg-purple-200',    // 5
  'bg-emerald-200',   // 6
  'bg-sky-200',       // 7
  'bg-amber-200',     // 8
  'bg-teal-200',      // 9
  'bg-pink-200',      // 10
  'bg-violet-200',    // 11
  'bg-blue-200',      // 12
];

// Usage: COLOR_PALETTE[index % COLOR_PALETTE.length]
```

#### 3. Avatar Mapping:
```typescript
const AVATAR_MAP: Record<string, string> = {
  'ae': '/images/a.jpg',
  'arm': '/images/arm.jpg',
  'saam': '/images/sam.jpg',
  'noi': '/images/ya-noi.jpg',
  'pha': '/images/pa.jpg',
  'man': '/images/man.jpg',
  'Ola': '/images/ole.jpg',
  'ole': '/images/ole.jpg',
  'toon': '/images/tun.jpg',
  'JJ': '/images/jaran.jpg',
  'Jak': '/images/jack.jpg',
  'sorn': '/placeholder-user.jpg',  // No image available
};

function getAvatar(id_code: string): string {
  const normalized = id_code.toLowerCase();
  return AVATAR_MAP[id_code] || 
         AVATAR_MAP[normalized] || 
         '/placeholder-user.jpg';
}
```

#### 4. Product Image Mapping:
```typescript
const PRODUCT_IMAGE_KEYWORDS: Record<string, string> = {
  'แป้ง': '/measuring-and-mixing-ingredients.jpg',
  'ไก่': '/fresh-ingredients-and-meat.jpg',
  'หมู': '/crispy-pork-belly-golden-brown.jpg',
  'ผัก': '/fresh-vegetables-in-kitchen.jpg',
  'มะนาว': '/fresh-lime-juice-in-bottles.jpg',
  'น้ำจิ้ม': '/peanut-satay-sauce-in-bowl.jpg',
  'ซอส': '/fried-rice-sauce-in-bottles.jpg',
  'เนื้อปู': '/fresh-ingredients-and-meat.jpg',
  'ปลา': '/fried-catfish-crispy-golden.jpg',
};

function getProductImage(job_name: string): string {
  for (const [keyword, image] of Object.entries(PRODUCT_IMAGE_KEYWORDS)) {
    if (job_name.includes(keyword)) {
      return image;
    }
  }
  return '/placeholder.jpg';
}
```

#### 5. Time Grid Calculation:
```typescript
const START_TIME = 8 * 60;      // 8:00 = 480 minutes
const END_TIME = 17 * 60;       // 17:00 = 1020 minutes
const MINUTES_PER_GRID = 5;     // 5 minutes per grid unit
const TOTAL_GRID_COLUMNS = (END_TIME - START_TIME) / MINUTES_PER_GRID; // 108

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function timeToGridColumn(time: string): number {
  const minutes = timeToMinutes(time);
  const minutesFromStart = minutes - START_TIME;
  return Math.floor(minutesFromStart / MINUTES_PER_GRID) + 1;
}
```

#### 6. Phase 2: Step Segment Colors (Smart Gradient)
```typescript
// สร้างสีแบบ gradient ตามสีหลักของงาน
function getStepGradientColors(baseColor: string, stepCount: number): string[] {
  // baseColor เช่น "bg-orange-200"
  const colorMap: Record<string, string[]> = {
    'bg-orange-200': ['bg-orange-100', 'bg-orange-200', 'bg-orange-300', 'bg-orange-400'],
    'bg-lime-200': ['bg-lime-100', 'bg-lime-200', 'bg-lime-300', 'bg-lime-400'],
    'bg-yellow-200': ['bg-yellow-100', 'bg-yellow-200', 'bg-yellow-300', 'bg-yellow-400'],
    // ... และสีอื่นๆ
  };
  
  const colors = colorMap[baseColor] || colorMap['bg-orange-200'];
  return colors.slice(0, stepCount);
}

// Phase 3: Status Colors
const STATUS_COLORS = {
  'on-time': 'bg-blue-500',
  'faster': 'bg-green-500',
  'delayed': 'bg-yellow-500',
  'severely-delayed': 'bg-red-500',  // > 20% เกิน
  'pending': 'bg-gray-300'
};
```

#### 7. Phase 2: Smart Display Logic
```typescript
// ตรวจสอบว่างานมี steps ครบถ้วนหรือไม่
function shouldDisplaySteps(task: ProductionTask): boolean {
  if (!task.steps || task.steps.length === 0) return false;
  
  // เช็คว่าทุกขั้นตอนมีเวลามาตรฐาน
  const allHaveDuration = task.steps.every(
    step => step.estimated_duration_minutes > 0
  );
  
  // เช็คว่าผลรวมเวลาสมเหตุสมผล
  const totalMinutes = task.steps.reduce(
    (sum, step) => sum + step.estimated_duration_minutes, 0
  );
  const taskDuration = timeToMinutes(task.end_time) - timeToMinutes(task.start_time);
  const isReasonable = totalMinutes <= taskDuration * 1.1; // อนุญาตเกิน 10%
  
  return allHaveDuration && isReasonable && task.hasSteps;
}

// Render logic
function TaskBar({ task }: { task: ProductionTask }) {
  const displaySteps = shouldDisplaySteps(task);
  
  return displaySteps 
    ? <TaskBarWithSteps task={task} />
    : <TaskBarSimple task={task} />;
}
```

---

## ⚙️ Backend Specification

### Technology Stack:
```json
{
  "framework": "Express.js 4.18.2",
  "language": "TypeScript 5.x",
  "database-client": "mysql2 3.6.0 (promise-based)",
  "validation": "express-validator 7.0.1",
  "security": "cors 2.8.5, helmet (optional)",
  "env-management": "dotenv 16.3.1",
  "dev-tools": "ts-node-dev 2.0.0"
}
```

### Project Structure:
```
backend/
├── src/
│   ├── config/
│   │   └── database.ts        # MySQL connection
│   ├── routes/
│   │   └── workplans.ts       # API routes
│   ├── controllers/
│   │   └── workplan.controller.ts
│   ├── services/
│   │   └── workplan.service.ts
│   ├── models/
│   │   └── types.ts           # TypeScript interfaces
│   ├── middlewares/
│   │   ├── error.middleware.ts
│   │   └── cors.middleware.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── response.ts
│   └── index.ts               # Express app
├── .env                       # Environment variables
├── .env.example               # Example env file
├── tsconfig.json
└── package.json
```

### Environment Variables (.env):
```env
# Server Configuration
PORT=3107
NODE_ENV=development

# Database Configuration
DB_HOST=192.168.0.96
DB_USER=jitdhana
DB_PASSWORD=Jitdana@2025
DB_NAME=manufacturing_system
DB_PORT=3306
DB_TIMEZONE=+07:00
DB_CONNECTION_LIMIT=10

# CORS Configuration
CORS_ORIGIN=*
# Production: CORS_ORIGIN=http://192.168.0.100:3017,http://192.168.0.101:3017

# API Configuration
API_PREFIX=/api
API_VERSION=v1

# Logging
LOG_LEVEL=info
```

### Database Configuration:
```typescript
// src/config/database.ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  timezone: process.env.DB_TIMEZONE || '+07:00',
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  dateStrings: true,  // Return dates as strings (avoid timezone issues)
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export default pool;
```

### API Endpoints:

#### 1. Get Work Plans by Date
```
GET /api/workplans?date=YYYY-MM-DD
```

**Query Parameters:**
- `date` (required): วันที่ต้องการดูข้อมูล (YYYY-MM-DD)

**Response (200 OK) - Phase 1:**
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
      "status": "เสร็จสิ้น",
      "notes": "80 กก คัด+ตัดแต่ง...",
      "assignees": [
        {
          "id_code": "man",
          "name": "แมน",
          "avatar": "/images/man.jpg"
        },
        {
          "id_code": "toon",
          "name": "พี่ตุ่น",
          "avatar": "/images/tun.jpg"
        }
      ],
      "hasSteps": false,  // Phase 1: ไม่มี steps
      "steps": []
    }
  ],
  "meta": {
    "date": "2025-10-08",
    "total": 17,
    "timezone": "Asia/Bangkok"
  }
}
```

**Response (200 OK) - Phase 2 (With Steps):**
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
      "status": "เสร็จสิ้น",
      "notes": "80 กก คัด+ตัดแต่ง...",
      "assignees": [...],
      "hasSteps": true,  // ⭐ มี template ครบ
      "steps": [         // ⭐ แสดงขั้นตอนพร้อมเวลามาตรฐาน
        {
          "process_number": 1,
          "process_description": "รับวัตถุดิบ",
          "estimated_duration_minutes": 30,
          "standard_worker_count": 2,
          "percentage": 6.67
        },
        {
          "process_number": 2,
          "process_description": "คัดแยก",
          "estimated_duration_minutes": 180,
          "standard_worker_count": 3,
          "percentage": 40.0
        },
        {
          "process_number": 3,
          "process_description": "ตัดแต่ง",
          "estimated_duration_minutes": 200,
          "standard_worker_count": 2,
          "percentage": 44.44
        },
        {
          "process_number": 4,
          "process_description": "บรรจุ",
          "estimated_duration_minutes": 40,
          "standard_worker_count": 2,
          "percentage": 8.89
        }
      ]
    }
  ],
  "meta": {
    "date": "2025-10-08",
    "total": 17,
    "timezone": "Asia/Bangkok"
  }
}
```

**Response (200 OK) - Phase 3 (With Actual Time):**
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
      "status": "เสร็จสิ้น",
      "assignees": [...],
      "hasSteps": true,
      "steps": [
        {
          "process_number": 1,
          "process_description": "รับวัตถุดิบ",
          // Standard time
          "estimated_duration_minutes": 30,
          "standard_worker_count": 2,
          "percentage": 6.67,
          // ⭐ Actual time (Phase 3)
          "actual_duration_minutes": 35,
          "actual_start_time": "08:30",
          "actual_end_time": "09:05",
          "actual_worker_count": 2,
          "efficiency_percent": 85.71,  // (30/35)*100
          "time_status": "delayed",
          "time_variance_minutes": 5,  // 35 - 30
          "status": "completed",
          "actual_operators": [
            {"id_code": "man", "name": "แมน"},
            {"id_code": "toon", "name": "พี่ตุ่น"}
          ]
        },
        {
          "process_number": 2,
          "process_description": "คัดแยก",
          "estimated_duration_minutes": 180,
          "actual_duration_minutes": 175,
          "efficiency_percent": 102.86,  // เร็วกว่า!
          "time_status": "faster",
          "status": "completed"
        },
        {
          "process_number": 3,
          "process_description": "ตัดแต่ง",
          "estimated_duration_minutes": 200,
          "actual_duration_minutes": null,  // ยังไม่ทำ
          "time_status": "pending",
          "status": "pending"
        }
      ]
    }
  ],
  "meta": {
    "date": "2025-10-08",
    "total": 17,
    "timezone": "Asia/Bangkok"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "ไม่พบข้อมูลในวันที่ระบุ",
  "data": [],
  "meta": {
    "date": "2025-10-09",
    "total": 0
  }
}
```

**Response (400 Bad Request):**
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

#### 2. Get Work Plan Details
```
GET /api/workplans/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 7398,
    "job_code": "135042",
    "job_name": "น่องไก่ติดสะโพก คละไซส์ - CT",
    "start_time": "08:30",
    "end_time": "16:00",
    "location": "ห้องผัก",
    "status": "เสร็จสิ้น",
    "notes": "80 กก คัด+ตัดแต่ง...",
    "machine": null,
    "assignees": [...],
    "steps": []
  }
}
```

#### 3. Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-10T10:30:00+07:00",
  "uptime": 3600,
  "database": "connected"
}
```

### SQL Queries:

#### Main Query - Get Work Plans:
```sql
SELECT 
  wp.id,
  wp.production_date,
  wp.job_code,
  wp.job_name,
  TIME_FORMAT(wp.start_time, '%H:%i') as start_time,
  TIME_FORMAT(wp.end_time, '%H:%i') as end_time,
  wp.notes,
  pr.room_name as location,
  ps.name as status
FROM work_plans wp
LEFT JOIN production_rooms pr ON wp.production_room_id = pr.id
LEFT JOIN production_statuses ps ON wp.status_id = ps.id
WHERE wp.production_date = ?
ORDER BY wp.start_time;
```

#### Get Operators:
```sql
SELECT 
  wpo.work_plan_id,
  wpo.id_code,
  u.name,
  u.position,
  u.department
FROM work_plan_operators wpo
LEFT JOIN users u ON wpo.id_code = u.id_code
WHERE wpo.work_plan_id IN (?)
ORDER BY wpo.work_plan_id;
```

#### Phase 2: Get Process Templates (Standard Time):
```sql
-- ดึง templates ตาม job_code
SELECT 
  pt.id,
  pt.process_number,
  pt.process_description,
  pt.estimated_duration_minutes,
  pt.standard_worker_count,
  pt.required_machine_type,
  pt.required_room_type,
  pt.notes
FROM process_templates pt
WHERE pt.product_code = ?  -- job_code จาก work_plans
  AND pt.is_active = TRUE
  AND pt.version = (
    SELECT MAX(version)
    FROM process_templates pt2
    WHERE pt2.product_code = pt.product_code
      AND pt2.is_active = TRUE
  )
ORDER BY pt.process_number;
```

#### Phase 3: Get Process Executions (Actual Time):
```sql
-- ดึงข้อมูลการทำงานจริง
SELECT 
  pe.id,
  pe.work_plan_id,
  pe.template_id,
  pe.process_number,
  pe.process_description,
  pe.start_time,
  pe.end_time,
  pe.duration_minutes,  -- Generated column
  pe.actual_worker_count,
  pe.status,
  pe.notes,
  pe.issues,
  -- ข้อมูลผู้ปฏิบัติงาน
  GROUP_CONCAT(
    CONCAT(u.id_code, ':', u.name)
    SEPARATOR ','
  ) as operators
FROM process_executions pe
LEFT JOIN process_execution_operators peo ON pe.id = peo.execution_id
LEFT JOIN users u ON peo.user_id = u.id
WHERE pe.work_plan_id = ?
GROUP BY pe.id
ORDER BY pe.process_number;
```

#### Phase 3: Compare Standard vs Actual:
```sql
-- เปรียบเทียบเวลามาตรฐานกับเวลาจริง
SELECT 
  pt.process_number,
  pt.process_description,
  pt.estimated_duration_minutes as standard_time,
  pe.duration_minutes as actual_time,
  ROUND((pt.estimated_duration_minutes / pe.duration_minutes) * 100, 2) as efficiency_percent,
  (pe.duration_minutes - pt.estimated_duration_minutes) as variance_minutes,
  CASE 
    WHEN pe.duration_minutes IS NULL THEN 'pending'
    WHEN pe.duration_minutes <= pt.estimated_duration_minutes THEN 'on-time'
    WHEN pe.duration_minutes <= pt.estimated_duration_minutes * 1.1 THEN 'slightly-delayed'
    ELSE 'delayed'
  END as time_status
FROM process_templates pt
LEFT JOIN process_executions pe 
  ON pt.product_code = pe.product_code 
  AND pt.process_number = pe.process_number
WHERE pt.product_code = ?
  AND pt.is_active = TRUE
  AND pe.work_plan_id = ?
ORDER BY pt.process_number;
```

### Error Handling:
```typescript
// src/middlewares/error.middleware.ts
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,
      error: err
    });
  } else {
    res.status(err.statusCode).json({
      success: false,
      message: err.isOperational ? err.message : 'เกิดข้อผิดพลาดของระบบ'
    });
  }
};
```

---

## 🗄️ Database Specification

### Connection Details:
```
Host: 192.168.0.96
Port: 3306
Database: manufacturing_system
User: jitdhana
Timezone: Asia/Bangkok (+07:00)
Charset: utf8mb4
Collation: utf8mb4_unicode_ci
```

### Tables Used:

**Phase 1 (Current):**
1. **work_plans** - แผนการผลิต
2. **work_plan_operators** - ผู้ปฏิบัติงาน
3. **users** - ข้อมูลพนักงาน
4. **production_rooms** - ห้องผลิต
5. **production_statuses** - สถานะการผลิต

**Phase 2 (Process Steps - Standard Time):**
6. **process_templates** - แม่แบบขั้นตอนการผลิต
7. **products** - ข้อมูลสินค้า (สำหรับ mapping job_code → product_code)

**Phase 3 (Actual Time Comparison):**
8. **process_executions** - บันทึกการทำงานจริง
9. **process_execution_operators** - ผู้ปฏิบัติงานในแต่ละขั้นตอน
10. **production_batches** - ล็อตการผลิต (optional)

### Important Notes:
- `production_date`: DATE type (YYYY-MM-DD)
- `start_time`, `end_time`: TIME type (HH:MM:SS)
- `dateStrings: true` ใน mysql2 config เพื่อหลีกเลี่ยงปัญหา timezone
- **ปัญหาที่พบ**: `work_plan_operators.user_id` เป็น NULL, ใช้ `id_code` แทน

### Join Strategy:
```sql
-- ❌ Wrong (user_id is NULL)
LEFT JOIN users u ON wpo.user_id = u.id

-- ✅ Correct
LEFT JOIN users u ON wpo.id_code = u.id_code
```

---

## 🌐 Network & CORS Configuration

### CORS Setup (Backend):
```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.CORS_ORIGIN === '*' 
    ? '*' 
    : process.env.CORS_ORIGIN?.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### Frontend API Client:
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3107';

export async function fetchWorkPlans(date: string) {
  const response = await fetch(`${API_BASE_URL}/api/workplans?date=${date}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Date หลุดหนึ่งวัน
**สาเหตุ**: Timezone conversion
**แก้ไข**:
```typescript
// ❌ Wrong
const today = new Date().toISOString().split('T')[0];

// ✅ Correct
const today = new Date().toLocaleDateString('en-CA', {
  timeZone: 'Asia/Bangkok'
}); // Returns: YYYY-MM-DD
```

### Issue 2: Cannot access from other machines
**แก้ไข**: ดูใน DEPLOYMENT_ISSUES.md

### Issue 3: user_id is NULL
**สาเหตุ**: Database ใช้ id_code แทน user_id
**แก้ไข**: JOIN ด้วย id_code

---

## 🚀 Performance Optimization

### Backend:
- Connection Pooling (mysql2)
- Query optimization (SELECT specific columns)
- Index optimization (ใช้ index ที่มีอยู่)
- Response caching (Phase 2)

### Frontend:
- Code splitting (Next.js automatic)
- Image optimization (Next.js Image)
- Lazy loading components
- Memoization (React.memo, useMemo)

---

## 📊 Monitoring & Logging

### Backend Logging:
```typescript
// Simple console logging for Phase 1
console.log(`[${new Date().toISOString()}] ${method} ${url} - ${statusCode}`);

// Phase 2: Use winston or pino
```

### Error Tracking:
- Console errors (Development)
- Error logs (Production)
- Database connection errors
- API request errors

---

## 🔐 Security Considerations

### Phase 1:
- ✅ SQL Injection Prevention (Prepared statements)
- ✅ CORS Configuration
- ✅ Input Validation
- ✅ Environment Variables
- ❌ No Authentication (Read-only)
- ❌ No Rate Limiting

### Phase 2 & 3:
- Same security requirements as Phase 1
- Additional validation for template data
- Performance monitoring for complex queries

### Phase 4 (Future):
- [ ] Authentication (JWT)
- [ ] Authorization (RBAC)
- [ ] Rate Limiting
- [ ] Helmet.js
- [ ] HTTPS

---

## 📊 Phase Summary

### ✅ Phase 1: Basic Display (Complete)
**Features:**
- แสดงแผนการผลิตรายวันแบบ Gantt Chart
- แสดงเวลาเริ่ม-สิ้นสุดของแต่ละงาน
- แสดงผู้ปฏิบัติงาน (assignees)
- Export & Print

**Data Sources:**
- work_plans, work_plan_operators, users, production_rooms, production_statuses

---

### 🔄 Phase 2: Process Steps - Standard Time
**Features:**
- แสดงขั้นตอนการผลิตในแท่ง Gantt Chart
- แสดงสัดส่วนเวลามาตรฐานของแต่ละขั้นตอน
- Smart Display: 2 โหมด (มี steps / ไม่มี steps)
- แสดง process details (number, description, duration, worker count)

**Data Sources:**
- + process_templates (เพิ่มเติมจาก Phase 1)
- + products (สำหรับ mapping job_code → product_code)

**Key Logic:**
```typescript
// เช็คว่างานมี template ครบถ้วน
hasSteps = 
  templates.length > 0 &&
  templates.every(t => t.estimated_duration_minutes > 0) &&
  totalMinutes <= workPlanMinutes * 1.1

// ถ้า hasSteps = true → แสดงแบบแบ่งขั้นตอน
// ถ้า hasSteps = false → แสดงแบบปกติ (Phase 1)
```

**Visual:**
```
งาน: น่องไก่ติดสะโพก (08:30 - 16:00)
┌─────┬──────────────┬───────────────┬──────┐
│  1  │      2       │       3       │  4   │
│30min│   180min     │    200min     │40min │
└─────┴──────────────┴───────────────┴──────┘
 6.7%     40.0%          44.4%        8.9%
```

---

### 📈 Phase 3: Actual Time Comparison
**Features:**
- เปรียบเทียบเวลามาตรฐาน vs เวลาจริง
- แสดง efficiency percentage
- สถานะเวลา: ✅ On Time / ✨ Faster / ⚠️ Delayed / ⏸️ Pending
- Visual overlay: แท่งเวลาจริงทับบนเวลามาตรฐาน
- แสดงผู้ปฏิบัติงานจริงในแต่ละขั้นตอน

**Data Sources:**
- + process_executions (เพิ่มเติมจาก Phase 2)
- + process_execution_operators

**Calculations:**
```typescript
efficiency_percent = (estimated / actual) * 100
time_variance = actual - estimated

time_status = 
  actual === null ? 'pending' :
  actual <= estimated ? 'on-time' :
  actual <= estimated * 1.1 ? 'slightly-delayed' :
  'delayed'
```

**Visual:**
```
ขั้นตอน: รับวัตถุดิบ
┌─────────────────────────────┐
│ มาตรฐาน: 30min ░░░░░░░░     │
│ จริง:     35min ████████    │ ⚠️ +5min
│ ประสิทธิภาพ: 85.71%         │
└─────────────────────────────┘
```

---

### 🚀 Phase 4: Future Enhancements
- Real-time Updates
- User Authentication & Authorization
- Mobile Responsive Improvements
- Reports & Analytics Dashboard
- Calendar View
- Push Notifications
- Advanced Filtering

---

## ✅ Phase 2.5: UI/UX Improvements (Completed)

### Frontend Enhancements:
- **Hidden UI Elements**: ซ่อนปุ่มพิมพ์, ปุ่มเปิด Production Task Detail Modal, ตัวเช็คเวลาเริ่ม
- **Task Numbering**: เพิ่มเลขลำดับหน้าชื่องาน (1. ชื่องาน, 2. ชื่องาน, ...)
- **Step Layout Logic**: แท่งขั้นตอนใช้เวลามาตรฐานสะสมจากเวลาเริ่มงาน และตัดที่ 17:00
- **Color Classification System**: 
  - Pack steps: สีเทาเข้ม (`bg-gray-400`)
  - Clean steps: สีเทาอ่อน (`bg-gray-200`)
  - Repack jobs (ไม่มี steps): สีเทาเข้ม
- **Removed Red Overrun Bar**: ไม่แสดงแท่งสีแดงสำหรับเวลาเกินแผน
- **Web Title & Favicon**: เปลี่ยนเป็น "ตารางงานและกระบวนการผลิตสินค้าครัวกลาง"

### Backend Adjustments:
- **Relaxed Validation**: ไม่บล็อกการแสดง steps เมื่อเวลามาตรฐานรวมมากกว่าเวลาตามแผน
- **Step Duration Logic**: ใช้เวลามาตรฐานสะสมแทนการคำนวณตาม percentage

### Technical Implementation:
```typescript
// Feature flags for UI control
const SHOW_START_LABEL = false
const SHOW_PRINT_BUTTON = false  
const SHOW_TASK_DETAIL_BUTTON = false

// Step color classification
type ProcessCategory = 'prep' | 'produce' | 'pack' | 'clean'

function getStepBackgroundClass(description: string, baseColor: string): string {
  const category = classifyStepCategory(description)
  if (category === 'pack') return 'bg-gray-400'
  if (category === 'clean') return 'bg-gray-200'
  return baseColor
}

// Repack job detection
const isRepackJob = task.job_name.toLowerCase().includes('(repack)')
const taskColor = isRepackJob ? 'bg-gray-400' : task.color
```

---

**เอกสารนี้สร้างเมื่อ**: 10 ตุลาคม 2025  
**อัปเดตล่าสุด**: 16 ตุลาคม 2025  
**เวอร์ชัน**: 2.5 (เพิ่ม Phase 2.5 Complete & Phase 3 Schema)  
**Next Review**: หลังจาก Phase 3 Schema Implementation





