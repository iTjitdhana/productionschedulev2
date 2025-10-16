# ✅ Development Checklist

## 📋 Pre-Development Setup

### ✅ เอกสารและข้อมูล
- [x] REQUIREMENTS.md - ความต้องการระบบ
- [x] SPECSHEET.md - รายละเอียดทางเทคนิค
- [x] DEPLOYMENT_ISSUES.md - ปัญหาที่พบและวิธีแก้
- [x] DATABASE_STRUCTURE.md - โครงสร้าง Database
- [x] ทดสอบการเชื่อมต่อ Database (test-db-connection.js)

### ✅ ข้อมูลที่ได้จาก Database
- [x] โครงสร้างตาราง `work_plans`
- [x] ข้อมูลตัวอย่าง (วันที่ 2025-10-08, 17 งาน)
- [x] การ JOIN ตารางต่างๆ
- [x] ปัญหาที่พบ (user_id NULL, room_id NULL)

### ✅ Mapping & Constants
- [x] Avatar Mapping (id_code → image path)
- [x] Product Image Mapping (job_name → image)
- [x] Color Palette (12 สี)
- [x] Time Grid Calculation logic

---

## 🏗️ Backend Development

### 1️⃣ Project Setup
- [ ] สร้างโฟลเดอร์ `backend/`
- [ ] Initialize project: `npm init -y`
- [ ] Install dependencies:
  ```bash
  npm install express mysql2 dotenv cors express-validator
  npm install -D typescript @types/node @types/express @types/cors ts-node-dev
  ```
- [ ] สร้าง `tsconfig.json`
- [ ] สร้าง `.env` และ `.env.example`
- [ ] สร้างโครงสร้างโฟลเดอร์

### 2️⃣ Database Configuration
- [ ] สร้าง `src/config/database.ts`
- [ ] ตั้งค่า Connection Pool
- [ ] ใช้ `dateStrings: true`
- [ ] ใช้ `timezone: '+07:00'`
- [ ] ทดสอบการเชื่อมต่อ

### 3️⃣ API Development

#### Routes (`src/routes/workplans.ts`)
- [ ] `GET /api/workplans?date=YYYY-MM-DD`
- [ ] `GET /api/workplans/:id`
- [ ] `GET /api/health`

#### Controllers (`src/controllers/workplan.controller.ts`)
- [ ] `getWorkPlans(req, res)`
- [ ] `getWorkPlanById(req, res)`
- [ ] `healthCheck(req, res)`

#### Services (`src/services/workplan.service.ts`)
- [ ] `fetchWorkPlans(date: string)`
  - Query work_plans
  - Query operators
  - Group operators by work_plan_id
  - Map data ตาม spec
- [ ] `fetchWorkPlanById(id: number)`

#### SQL Queries
- [ ] Query work_plans พร้อม JOIN
- [ ] Query operators ด้วย `id_code` (ไม่ใช่ user_id)
- [ ] Handle NULL production_room_id
- [ ] Format TIME เป็น HH:MM

### 4️⃣ Middleware
- [ ] CORS configuration
- [ ] Error handler
- [ ] Input validation (express-validator)
- [ ] Logger (console.log สำหรับ Phase 1)

### 5️⃣ Response Format
```typescript
{
  success: boolean,
  data: any[],
  meta: {
    date: string,
    total: number,
    timezone: string
  },
  message?: string,
  errors?: any[]
}
```

### 6️⃣ Testing
- [ ] ทดสอบ `GET /api/health`
- [ ] ทดสอบ `GET /api/workplans?date=2025-10-08`
- [ ] ทดสอบ error cases (invalid date, no data)
- [ ] ทดสอบจากเครื่องอื่นใน network

---

## 🎨 Frontend Development

### 1️⃣ Project Setup (ใช้ existing)
- [x] Next.js project มีอยู่แล้ว
- [x] Components มีอยู่แล้ว
- [ ] ย้ายโค้ดที่ต้องการ

### 2️⃣ API Integration
- [ ] สร้าง `lib/api.ts`
  ```typescript
  - fetchWorkPlans(date: string)
  - fetchWorkPlanById(id: number)
  ```
- [ ] ใช้ `process.env.NEXT_PUBLIC_API_URL`
- [ ] Handle errors
- [ ] Loading states

### 3️⃣ Constants & Mapping
- [ ] สร้าง `lib/constants.ts`
  - COLOR_PALETTE
  - AVATAR_MAP
  - PRODUCT_IMAGE_KEYWORDS
- [ ] Helper functions:
  - `getAvatar(id_code)`
  - `getProductImage(job_name)`
  - `timeToGridColumn(time)`

### 4️⃣ Components

#### Main Component (`components/production-schedule.tsx`)
- [ ] ลบข้อมูล hardcode
- [ ] เพิ่ม state management:
  ```typescript
  const [tasks, setTasks] = useState<ProductionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  ```
- [ ] useEffect fetch data:
  ```typescript
  useEffect(() => {
    loadWorkPlans(selectedDate);
  }, [selectedDate]);
  ```
- [ ] Assign colors dynamically:
  ```typescript
  tasks.map((task, index) => ({
    ...task,
    color: COLOR_PALETTE[index % COLOR_PALETTE.length]
  }))
  ```
- [ ] Map avatars & images
- [ ] Handle loading & error states

#### Loading State
- [ ] Skeleton loader หรือ Spinner
- [ ] แสดง "กำลังโหลดข้อมูล..."

#### Error State
- [ ] แสดง error message
- [ ] ปุ่ม "ลองอีกครั้ง"

#### Empty State
- [ ] แสดง "ไม่พบข้อมูลในวันที่เลือก"

### 5️⃣ Date Handling
- [ ] สร้าง helper function:
  ```typescript
  function getTodayDate(): string {
    return new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Bangkok'
    });
  }
  ```
- [ ] ใช้ date-fns ถ้าจำเป็น

### 6️⃣ TypeScript Types
- [ ] สร้าง `types/index.ts`
  ```typescript
  interface ProductionTask { ... }
  interface Assignee { ... }
  interface ProcessStep { ... }
  interface APIResponse<T> { ... }
  ```

### 7️⃣ Testing
- [ ] ทดสอบแสดงข้อมูล
- [ ] ทดสอบ loading state
- [ ] ทดสอบ error handling
- [ ] ทดสอบ color assignment
- [ ] ทดสอบ avatar/image mapping
- [ ] ทดสอบ Export Excel
- [ ] ทดสอบ Print

---

## 🌐 Network & Deployment

### 1️⃣ Environment Configuration
- [ ] Frontend `.env.local`:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:3107
  ```
- [ ] Backend `.env`:
  ```env
  PORT=3107
  CORS_ORIGIN=*
  DB_HOST=192.168.0.96
  # ... other configs
  ```

### 2️⃣ Backend Network Setup
- [ ] Listen on `0.0.0.0` (ไม่ใช่ localhost)
- [ ] ตั้งค่า CORS อนุญาตทุก origin (Phase 1)

### 3️⃣ Firewall Configuration
- [ ] เปิด port 3017 (Frontend)
- [ ] เปิด port 3107 (Backend)

### 4️⃣ Database Access
- [ ] ตรวจสอบ MySQL user permissions
- [ ] อนุญาตการเข้าถึงจาก Server IP

### 5️⃣ Testing from Other Machines
- [ ] ทดสอบ Backend API: `http://[SERVER_IP]:3107/api/health`
- [ ] ทดสอบ Frontend: `http://[SERVER_IP]:3017`
- [ ] ตรวจสอบ Console errors

---

## 🐛 Bug Fixes & Known Issues

### ต้องแก้ไข:
- [ ] ปัญหา `user_id` เป็น NULL → ใช้ `id_code`
- [ ] ปัญหา `production_room_id` เป็น NULL → แสดง "ไม่ระบุห้อง"
- [ ] Avatar mapping case-sensitive → Handle case-insensitive
- [ ] วันที่หลุด 1 วัน → ใช้ Asia/Bangkok timezone

### รองรับกรณีพิเศษ:
- [ ] id_code ไม่ match users → แสดง placeholder
- [ ] job_name ไม่ match product image → แสดง "No Image"
- [ ] ไม่มีข้อมูลในวันที่เลือก → แสดง empty state

---

## 📝 Documentation

### Code Documentation
- [ ] Comment ใน code ที่ซับซ้อน
- [ ] JSDoc สำหรับ functions สำคัญ
- [ ] README ในแต่ละโฟลเดอร์

### API Documentation
- [ ] เขียนใน README หรือ Postman Collection
- [ ] ตัวอย่าง Request/Response
- [ ] Error codes

### Deployment Guide
- [ ] Step-by-step deployment
- [ ] Environment setup
- [ ] Troubleshooting guide

---

## ✅ Final Checklist

### Before Testing:
- [ ] ทุก environment variables ถูกตั้งค่า
- [ ] Database connection ทำงาน
- [ ] CORS ตั้งค่าถูกต้อง
- [ ] Port ไม่ชนกัน

### Testing Checklist:
- [ ] ✅ แสดงตารางการผลิต
- [ ] ✅ มีข้อมูลจาก Database
- [ ] ✅ สีแสดงถูกต้อง (ตามลำดับ)
- [ ] ✅ ผู้ปฏิบัติงานแสดงพร้อมรูป
- [ ] ✅ รูปภาพสินค้าแสดง (หรือ No Image)
- [ ] ✅ Modal รายละเอียดทำงาน
- [ ] ✅ Export Excel ได้
- [ ] ✅ Print ได้
- [ ] ✅ Loading state แสดง
- [ ] ✅ Error handling ทำงาน
- [ ] ✅ เข้าจากเครื่องอื่นได้

### Code Quality:
- [ ] ไม่มี console errors
- [ ] ไม่มี TypeScript errors
- [ ] Code อ่านง่าย maintainable
- [ ] Follow best practices

### Performance:
- [ ] หน้าแรกโหลดเร็ว (< 3s)
- [ ] API response เร็ว (< 500ms)
- [ ] ไม่มี memory leaks

---

## 🚀 Ready to Deploy?

### Pre-deployment:
- [ ] ทุก tests ผ่าน
- [ ] Documentation ครบถ้วน
- [ ] Environment variables พร้อม
- [ ] Database backup

### Deployment:
- [ ] Build frontend: `npm run build`
- [ ] Build backend: `npm run build`
- [ ] Start services
- [ ] Verify deployment

### Post-deployment:
- [ ] Monitor logs
- [ ] Test from production
- [ ] Get user feedback

---

## 📊 Phase 2: Process Steps Display (Standard Time)

### Backend Development

#### 1️⃣ Database Queries
- [ ] สร้าง query สำหรับดึง `process_templates`
  ```sql
  SELECT process_number, process_description, 
         estimated_duration_minutes, standard_worker_count
  FROM process_templates
  WHERE product_code = ? AND is_active = TRUE
    AND version = (SELECT MAX(version) ...)
  ```
- [ ] Mapping `job_code` → `product_code`

#### 2️⃣ Service Layer
- [ ] `fetchProcessTemplates(jobCode: string)`
- [ ] `validateTemplateCompleteness(templates)`
  - เช็คว่ามีข้อมูลครบทุกขั้นตอน
  - ทุกขั้นตอนมี `estimated_duration_minutes > 0`
  - ผลรวมเวลาสมเหตุสมผล
- [ ] `calculateStepPercentages(templates, workPlan)`
  - คำนวณ % ของแต่ละขั้นตอน
  - คำนวณ estimated start/end time

#### 3️⃣ API Response Enhancement
- [ ] เพิ่ม field `hasSteps: boolean`
- [ ] เพิ่ม field `steps: ProcessStep[]`
  ```typescript
  {
    process_number: number,
    process_description: string,
    estimated_duration_minutes: number,
    standard_worker_count: number,
    percentage: number
  }
  ```

#### 4️⃣ Testing
- [ ] ทดสอบงานที่มี template ครบ
- [ ] ทดสอบงานที่ไม่มี template
- [ ] ทดสอบงานที่มี template ไม่ครบ
- [ ] ทดสอบการคำนวณ percentage

---

### Frontend Development

#### 1️⃣ TypeScript Types
- [ ] อัปเดต `ProductionTask` interface
  ```typescript
  interface ProductionTask {
    // ... existing fields
    hasSteps: boolean;
    steps: ProcessStep[];
  }
  
  interface ProcessStep {
    process_number: number;
    process_description: string;
    estimated_duration_minutes: number;
    standard_worker_count: number;
    percentage: number;
  }
  ```

#### 2️⃣ Components
- [ ] สร้าง `TaskBarWithSteps` component
  - แสดงแท่งแบ่งเป็นส่วนๆ
  - แต่ละส่วนมีสีต่างกัน (gradient)
  - แสดง process number, name, duration
- [ ] อัปเดต `TaskBar` component
  ```typescript
  {task.hasSteps ? (
    <TaskBarWithSteps task={task} />
  ) : (
    <TaskBarSimple task={task} />
  )}
  ```

#### 3️⃣ Styling & Colors
- [ ] สร้าง color gradient สำหรับขั้นตอน
  ```typescript
  // ถ้างานใช้ bg-orange-200
  // ขั้นตอนจะใช้:
  bg-orange-100, bg-orange-200, bg-orange-300, bg-orange-400
  ```
- [ ] Responsive design สำหรับ step segments

#### 4️⃣ Tooltips & Interactions
- [ ] Hover แสดงรายละเอียดขั้นตอน
  - Process name
  - Estimated duration
  - Standard worker count
  - Percentage
- [ ] Click เปิด Modal แสดงข้อมูลเต็ม

#### 5️⃣ Testing
- [ ] ทดสอบแสดงงานที่มี steps
- [ ] ทดสอบแสดงงานที่ไม่มี steps (fallback)
- [ ] ทดสอบสัดส่วนความกว้างแท่ง
- [ ] ทดสอบ responsive

---

## 📈 Phase 3: Actual Time Comparison

### Backend Development

#### 1️⃣ Database Queries
- [ ] ดึงข้อมูล `process_executions`
  ```sql
  SELECT pe.*, peo.user_id, u.name
  FROM process_executions pe
  LEFT JOIN process_execution_operators peo ON pe.id = peo.execution_id
  LEFT JOIN users u ON peo.user_id = u.id
  WHERE pe.work_plan_id = ?
  ```
- [ ] JOIN กับ `process_templates` เพื่อเปรียบเทียบ

#### 2️⃣ Service Layer
- [ ] `fetchProcessExecutions(workPlanId: number)`
- [ ] `calculateEfficiency(estimated, actual)`
  ```typescript
  efficiency = (estimated / actual) * 100
  ```
- [ ] `determineTimeStatus(estimated, actual)`
  - On Time: actual <= estimated
  - Faster: actual < estimated * 0.9
  - Delayed: actual > estimated * 1.1

#### 3️⃣ API Response Enhancement
- [ ] เพิ่มข้อมูล actual execution ใน steps
  ```typescript
  {
    // ... standard fields
    actual_duration_minutes?: number,
    actual_start_time?: string,
    actual_end_time?: string,
    efficiency_percent?: number,
    time_status: 'on-time' | 'faster' | 'delayed' | 'pending',
    actual_operators?: Assignee[]
  }
  ```

#### 4️⃣ Testing
- [ ] ทดสอบงานที่มีข้อมูล execution
- [ ] ทดสอบงานที่ยังไม่มี execution
- [ ] ทดสอบการคำนวณ efficiency
- [ ] ทดสอบการกำหนด status

---

### Frontend Development

#### 1️⃣ Components
- [ ] สร้าง `StepComparisonBar` component
  - แท่งโปร่งใส (standard time)
  - แท่งทึบ overlay (actual time)
  - สีตามสถานะ (green/yellow/red)

#### 2️⃣ Visual Indicators
- [ ] Status icons: ✅ ✨ ⚠️ ❌ ⏸️
- [ ] Progress indicators
- [ ] Efficiency badges

#### 3️⃣ Analytics Display
- [ ] Overall efficiency percentage
- [ ] Time variance (± minutes)
- [ ] Status summary
  - On time: X steps
  - Faster: Y steps
  - Delayed: Z steps

#### 4️⃣ Enhanced Tooltips
- [ ] แสดงการเปรียบเทียบ
  ```
  ขั้นตอน: เตรียมวัตถุดิบ
  ━━━━━━━━━━━━━━━
  มาตรฐาน: 30 นาที
  จริง:     35 นาที
  ส่วนต่าง: +5 นาที (+16.7%)
  ประสิทธิภาพ: 85.7%
  สถานะ: ⚠️ เกินเวลา
  ```

#### 5️⃣ Testing
- [ ] ทดสอบแสดง overlay
- [ ] ทดสอบ status colors
- [ ] ทดสอบ efficiency calculations
- [ ] ทดสอบ responsive

---

## 📞 Need Help?

- 📄 ดูเอกสารใน `/docs`
- 🐛 ตรวจสอบ [DEPLOYMENT_ISSUES.md](./DEPLOYMENT_ISSUES.md)
- 💬 ถามทีมพัฒนา

---

## ✅ Phase 2.5: UI/UX Improvements (Completed)

### Frontend Enhancements:
- [x] **Hidden UI Elements**: ซ่อนปุ่มพิมพ์, ปุ่มเปิด Production Task Detail Modal, ตัวเช็คเวลาเริ่ม
- [x] **Task Numbering**: เพิ่มเลขลำดับหน้าชื่องาน (1. ชื่องาน, 2. ชื่องาน, ...)
- [x] **Step Layout Logic**: แท่งขั้นตอนใช้เวลามาตรฐานสะสมจากเวลาเริ่มงาน และตัดที่ 17:00
- [x] **Color Classification System**: 
  - Pack steps: สีเทาเข้ม (`bg-gray-400`)
  - Clean steps: สีเทาอ่อน (`bg-gray-200`)
  - Repack jobs (ไม่มี steps): สีเทาเข้ม
- [x] **Removed Red Overrun Bar**: ไม่แสดงแท่งสีแดงสำหรับเวลาเกินแผน
- [x] **Web Title & Favicon**: เปลี่ยนเป็น "ตารางงานและกระบวนการผลิตสินค้าครัวกลาง"

### Backend Adjustments:
- [x] **Relaxed Validation**: ไม่บล็อกการแสดง steps เมื่อเวลามาตรฐานรวมมากกว่าเวลาตามแผน
- [x] **Step Duration Logic**: ใช้เวลามาตรฐานสะสมแทนการคำนวณตาม percentage

### Code Quality:
- [x] **Feature Flags**: ใช้ constants สำหรับควบคุมการแสดง UI elements
- [x] **Type Safety**: เพิ่ม TypeScript types สำหรับ ProcessCategory
- [x] **Clean Code**: แยก logic การ classify และ styling

---

**Created**: 10 ตุลาคม 2025  
**Updated**: 16 ตุลาคม 2025 (เพิ่ม Phase 2.5 Complete)  
**Status**: Phase 2.5 Complete, Phase 3 Planning  
**Priority**: High





