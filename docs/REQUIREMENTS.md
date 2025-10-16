# 📋 ความต้องการระบบ (Requirements)

## 🎯 ภาพรวมโปรเจกต์

**ชื่อระบบ**: ระบบตารางงานและกระบวนการผลิตสินค้าครัวกลาง  
**ประเภท**: Web Application (Frontend + Backend API)  
**วัตถุประสงค์**: แสดงแผนการผลิตรายวันแบบ Gantt Chart โดยดึงข้อมูลจาก Database จริง

---

## 👥 ผู้ใช้งาน

### ผู้ดูแลระบบ/หัวหน้าแผนก:
- ดูแผนการผลิตของวันนี้
- ดูรายละเอียดแต่ละงาน
- Export ข้อมูลเป็น Excel
- พิมพ์ตารางการผลิต

### พนักงานผลิต (อนาคต):
- ดูงานที่ได้รับมอบหมาย
- อัปเดตสถานะการทำงาน

---

## ✅ ฟีเจอร์หลัก (Phase 1 - MVP)

### 1. แสดงตารางการผลิต (Production Schedule)
- [x] แสดงงานทั้งหมดของวันที่เลือก
- [x] แสดงเวลาแบบ Timeline (8:00-17:00)
- [x] แบ่งช่วงเวลา: ช่วงเช้า, พักเที่ยง, ช่วงบ่าย
- [x] แสดง Task Bar ตามระยะเวลาที่ใช้งาน
- [x] สีของงานกำหนดตามลำดับการแสดง (ไม่ฟิกที่งาน)

### 2. แสดงข้อมูลงาน
- [x] ชื่องาน (job_name)
- [x] เวลาเริ่มต้น-สิ้นสุด (start_time - end_time)
- [x] สถานที่ทำงาน (location/room)
- [x] ผู้ปฏิบัติงาน (assignees) พร้อมรูปโปรไฟล์
- [x] รูปภาพสินค้า (product image)
- [ ] ขั้นตอนการทำงานแบบมาตรฐาน (process steps with estimated time) - Phase 2
- [ ] ขั้นตอนการทำงานจริง (actual execution data) - Phase 3

### 3. การเลือกวันที่
- [x] Default: แสดงวันปัจจุบัน (today)
- [x] ระบบใช้ Timezone: Asia/Bangkok
- [x] แสดง "ไม่พบข้อมูล" ถ้าไม่มีข้อมูลในวันนั้น
- [ ] Date Picker เลือกวันได้ - Phase 2

### 4. รายละเอียดงาน (Modal)
- [x] คลิกชื่องานเพื่อดูรายละเอียด
- [x] แสดงข้อมูลครบถ้วน
- [x] แสดงผู้ปฏิบัติงานทั้งหมด
- [x] แสดงรูปภาพสินค้า
- [ ] แสดงขั้นตอนการทำงานพร้อมเวลามาตรฐาน - Phase 2
- [ ] แสดงการเปรียบเทียบเวลามาตรฐาน vs จริง - Phase 3
- [ ] แสดง Efficiency metrics - Phase 3
- [x] Export งานนั้นเป็น Excel

### 5. การส่งออกข้อมูล
- [x] พิมพ์ตารางทั้งหมด (Print)
- [x] Export ทั้งหมดเป็น Excel
- [x] Export งานเดียวเป็น Excel

---

## 🚫 สิ่งที่ไม่รวมใน Phase 1

- ❌ การสร้าง/แก้ไข/ลบแผนการผลิต (CRUD)
- ❌ User Authentication / Login
- ❌ User Management
- ❌ Real-time Updates
- ❌ Notifications
- ❌ Calendar View
- ❌ Reports & Analytics
- ❌ Mobile App
- ❌ การแก้ไข Process Templates

---

## 🎨 UI/UX Requirements

### การแสดงผล:
- แสดง Logo JDN
- ใช้สีตามพาเลตที่กำหนด (12 สี)
- Responsive (รองรับหน้าจอขนาดต่างๆ)
- Support การ Print (ซ่อน elements ที่ไม่จำเป็น)
- รองรับภาษาไทยเต็มรูปแบบ (Font: Noto Sans Thai)

### User Interaction:
- Hover แสดงข้อมูลเพิ่มเติม (Tooltip)
- Click ชื่องานเพื่อดูรายละเอียด (Modal)
- Smooth animations และ transitions
- Loading state ขะหว่างโหลดข้อมูล
- Error handling ที่เหมาะสม

---

## 📊 ข้อมูลที่ใช้

### จาก Database (manufacturing_system):

#### ตารางหลัก:
- `work_plans` - แผนการผลิตรายวัน
- `work_plan_operators` - ผู้ปฏิบัติงาน
- `users` - ข้อมูลพนักงาน
- `production_rooms` - ห้องผลิต
- `production_statuses` - สถานะการผลิต

#### ตารางเสริม (Phase 2 - Process Steps):
- `process_templates` - แม่แบบขั้นตอนการผลิต (Standard Time)
  - estimated_duration_minutes
  - standard_worker_count
  - process_number, process_description

#### ตารางเสริม (Phase 3 - Actual Time):
- `process_executions` - บันทึกการทำงานจริง
  - start_time, end_time, duration_minutes
  - actual_worker_count, status
- `process_execution_operators` - ผู้ปฏิบัติงานในแต่ละขั้นตอน
- `production_batches` - ล็อตการผลิต

---

## 🔧 Technical Requirements

### Frontend:
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: TailwindCSS 4
- **Components**: shadcn/ui (Radix UI)
- **Language**: TypeScript
- **Font**: Noto Sans Thai
- **Port**: 3017

### Backend:
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **Language**: TypeScript
- **ORM**: mysql2 (promise-based)
- **Port**: 3107

### Database:
- **Host**: 192.168.0.96
- **Port**: 3306
- **Database**: manufacturing_system
- **Timezone**: Asia/Bangkok (+07:00)
- **Date Format**: YYYY-MM-DD (DATE type)
- **Time Format**: HH:MM:SS (TIME type)

---

## 🌐 Network & Deployment Requirements

### Development:
- Frontend: http://localhost:3017
- Backend: http://localhost:3107
- Database: 192.168.0.96:3306

### Production/Network Access:
- **ต้องรองรับการเข้าถึงจากเครื่องอื่นใน Network**
- Frontend: http://[SERVER_IP]:3017
- Backend: http://[SERVER_IP]:3107
- CORS: ต้องอนุญาตทุก origin ใน network เดียวกัน

### Environment Variables:
- ต้องใช้ Environment Variables สำหรับการตั้งค่า
- ไม่ hardcode IP address หรือ port
- รองรับการเปลี่ยน config ได้ง่าย

---

## 🔒 Security Requirements

### Phase 1 (Read-Only):
- ไม่มี Authentication (read-only access)
- SQL Injection Prevention (Prepared Statements)
- Input Validation
- Error Handling ที่ไม่เปิดเผยข้อมูลระบบ

### Phase 2 (Future):
- User Authentication
- Role-Based Access Control (RBAC)
- Session Management
- Audit Logs

---

## 📱 Browser Support

- Chrome (latest)
- Edge (latest)
- Firefox (latest)
- Safari (latest)

---

## ⚡ Performance Requirements

- หน้าแรกโหลดภายใน 3 วินาที
- API Response Time < 500ms
- รองรับ 20+ งานพร้อมกัน
- รองรับ 50+ concurrent users

---

## 🧪 Testing Requirements (Phase 2)

- Unit Tests (Backend)
- API Integration Tests
- E2E Tests (Frontend)
- Cross-browser Testing

---

## 📦 Deliverables

### Phase 1:
1. ✅ Frontend Application (Next.js)
2. ✅ Backend API (Express)
3. ✅ Database Connection
4. ✅ API Documentation
5. ✅ Deployment Guide
6. ✅ Technical Documentation

### Phase 2 (Process Steps - Standard Time):
1. [ ] แสดงขั้นตอนการผลิตในแท่ง Gantt Chart
2. [ ] ใช้ข้อมูลจาก `process_templates` 
3. [ ] แสดงสัดส่วนเวลามาตรฐาน (estimated_duration_minutes)
4. [ ] Smart Display: มี 2 โหมด
   - โหมด 1: แท่งแบ่งเป็นขั้นตอน (ถ้ามี template ครบ)
   - โหมด 2: แท่งปกติ (ถ้าไม่มีหรือไม่ครบ)
5. [ ] แสดงข้อมูลในแต่ละขั้นตอน:
   - Process number
   - Process description
   - Estimated duration
   - Standard worker count
   - Percentage ของเวลารวม
6. [ ] Backend validation: เช็คความครบถ้วนของ template
7. [ ] Date Picker เลือกวันได้

### Phase 3 (Actual Time Comparison):
1. [ ] แสดงเวลาจริงจากการทำงาน
2. [ ] ใช้ข้อมูลจาก `process_executions`
3. [ ] เปรียบเทียบเวลามาตรฐาน vs เวลาจริง
4. [ ] แสดง efficiency percentage
5. [ ] สถานะเวลา:
   - ✅ On Time (ตรงเวลา)
   - ✨ Faster (เร็วกว่า)
   - ⚠️ Delayed (ช้ากว่า)
   - ⏸️ Pending (ยังไม่เสร็จ)
6. [ ] Visual overlay: แท่งเวลาจริงทับบนเวลามาตรฐาน
7. [ ] แสดงผู้ปฏิบัติงานในแต่ละขั้นตอน (actual)
8. [ ] Reports & Analytics

### Phase 3: Database Schema Requirements

#### 1. Process Category Classification
**วัตถุประสงค์**: จำแนกประเภทของขั้นตอนการผลิตเพื่อการแสดงผลและวิเคราะห์

**ตารางที่ต้องเพิ่ม/แก้ไข**:
```sql
-- เพิ่มคอลัมน์ใน process_templates
ALTER TABLE process_templates 
ADD COLUMN process_category ENUM('prep', 'produce', 'pack', 'clean') DEFAULT 'produce',
ADD COLUMN category_keywords TEXT COMMENT 'Keywords สำหรับ auto-classification';

-- หรือสร้างตารางแยก
CREATE TABLE process_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_code VARCHAR(20) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL,
    display_color VARCHAR(20) NOT NULL,
    keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO process_categories VALUES
(1, 'prep', 'เตรียมวัตถุดิบ', 'bg-blue-200', 'รับวัตถุดิบ,เตรียม,คัด,หมัก,ชั่ง,ตวง,ละลาย'),
(2, 'produce', 'การผลิต', 'bg-orange-200', 'หั่น,ปรุง,ผัด,ทอด,ต้ม,อบ,บด,คั่ว'),
(3, 'pack', 'บรรจุภัณฑ์', 'bg-gray-400', 'แพค,แพ็ค,แวค,ใส่ถุง,บรรจุ,ซีล,ติดสติ๊กเกอร์'),
(4, 'clean', 'ทำความสะอาด', 'bg-gray-200', 'ล้าง,ทำความสะอาด,sanitize,เก็บล้าง');
```

#### 2. Job Type Classification
**วัตถุประสงค์**: จำแนกประเภทงานเพื่อการแสดงผลสีที่เหมาะสม

**ตารางที่ต้องเพิ่ม/แก้ไข**:
```sql
-- เพิ่มคอลัมน์ใน work_plans
ALTER TABLE work_plans 
ADD COLUMN job_type ENUM('production', 'repack', 'maintenance', 'cleaning') DEFAULT 'production',
ADD COLUMN display_color VARCHAR(20) COMMENT 'สีสำหรับแสดงผล';

-- หรือสร้างตารางแยก
CREATE TABLE job_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_code VARCHAR(20) NOT NULL UNIQUE,
    type_name VARCHAR(100) NOT NULL,
    display_color VARCHAR(20) NOT NULL,
    pattern_keywords TEXT COMMENT 'Keywords สำหรับ auto-detection',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO job_types VALUES
(1, 'production', 'การผลิต', 'bg-orange-200', ''),
(2, 'repack', 'บรรจุใหม่', 'bg-gray-400', '(repack),repack,บรรจุใหม่'),
(3, 'maintenance', 'บำรุงรักษา', 'bg-yellow-200', 'บำรุง,ซ่อม,maintenance'),
(4, 'cleaning', 'ทำความสะอาด', 'bg-gray-200', 'ล้าง,ทำความสะอาด,cleaning');
```

#### 3. Enhanced Process Templates
**วัตถุประสงค์**: เพิ่มข้อมูลสำหรับการจำแนกและแสดงผล

```sql
-- อัปเดต process_templates
ALTER TABLE process_templates 
ADD COLUMN process_category_id INT,
ADD COLUMN display_priority INT DEFAULT 0 COMMENT 'ลำดับความสำคัญในการแสดงผล',
ADD COLUMN estimated_complexity ENUM('low', 'medium', 'high') DEFAULT 'medium',
ADD COLUMN required_skills TEXT COMMENT 'ทักษะที่จำเป็น',
ADD FOREIGN KEY (process_category_id) REFERENCES process_categories(id);
```

#### 4. Process Execution Enhancements
**วัตถุประสงค์**: บันทึกข้อมูลการทำงานจริงพร้อมการจำแนก

```sql
-- อัปเดต process_executions
ALTER TABLE process_executions 
ADD COLUMN actual_category_id INT,
ADD COLUMN efficiency_rating ENUM('excellent', 'good', 'average', 'poor') DEFAULT 'average',
ADD COLUMN quality_score DECIMAL(3,2) COMMENT 'คะแนนคุณภาพ 0.00-1.00',
ADD COLUMN notes TEXT COMMENT 'หมายเหตุเพิ่มเติม',
ADD FOREIGN KEY (actual_category_id) REFERENCES process_categories(id);
```

#### 5. Data Migration Scripts
**วัตถุประสงค์**: ย้ายข้อมูลเดิมให้เข้ากับ schema ใหม่

```sql
-- Auto-classify existing process_templates
UPDATE process_templates pt
JOIN process_categories pc ON (
    pt.process_description LIKE CONCAT('%', SUBSTRING_INDEX(pc.keywords, ',', 1), '%') OR
    pt.process_description LIKE CONCAT('%', SUBSTRING_INDEX(pc.keywords, ',', 2), '%') OR
    pt.process_description LIKE CONCAT('%', SUBSTRING_INDEX(pc.keywords, ',', 3), '%')
)
SET pt.process_category_id = pc.id
WHERE pt.process_category_id IS NULL;

-- Auto-classify existing work_plans
UPDATE work_plans wp
JOIN job_types jt ON (
    wp.job_name LIKE CONCAT('%', SUBSTRING_INDEX(jt.pattern_keywords, ',', 1), '%') OR
    wp.job_name LIKE CONCAT('%', SUBSTRING_INDEX(jt.pattern_keywords, ',', 2), '%')
)
SET wp.job_type = jt.type_code, wp.display_color = jt.display_color
WHERE wp.job_type IS NULL;
```

### Phase 4 (Future):
1. [ ] Real-time Updates
2. [ ] User Authentication
3. [ ] Mobile Responsive Improvements
4. [ ] Push Notifications
5. [ ] Calendar View

---

## 📅 Timeline

**Phase 1 (MVP - Read-Only Display)**: ✅ เสร็จแล้ว
- Setup Project Structure: 1 วัน
- Backend API Development: 2-3 วัน
- Frontend Development: 3-4 วัน
- Integration & Testing: 2-3 วัน
- Documentation: 1 วัน

**Phase 2 (Process Steps - Standard Time)**: 2-3 วัน
- Backend: ดึงข้อมูล process_templates (1 วัน)
  - Query templates by job_code
  - Validate completeness
  - Calculate percentages
- Frontend: แสดงแท่งขั้นตอน (1-2 วัน)
  - Smart display logic (2 modes)
  - Step segments visualization
  - Tooltips & details
- Testing & Refinement (0.5 วัน)

**Phase 3 (Actual Time Comparison)**: 3-5 วัน
- Backend: ดึงข้อมูล process_executions (1-2 วัน)
  - Query actual executions
  - Calculate efficiency
  - Compare standard vs actual
- Frontend: แสดงการเปรียบเทียบ (2-3 วัน)
  - Overlay visualization
  - Status indicators
  - Performance metrics
- Testing & Analytics (1 วัน)

**Phase 4 (Future)**: TBD

---

## 🎯 Success Criteria

### Phase 1:
- [x] แสดงตารางการผลิตได้ถูกต้อง
- [x] ดึงข้อมูลจาก Database จริง
- [x] แสดงผู้ปฏิบัติงานพร้อมรูปภาพ
- [x] Export ข้อมูลเป็น Excel ได้
- [x] พิมพ์ตารางได้
- [x] เข้าถึงจากเครื่องอื่นใน Network ได้
- [ ] ไม่มี Critical Bugs

---

## 📝 Notes

- ระบบนี้เป็น Read-Only ในระยะแรก
- เน้นความถูกต้องของข้อมูลและ UI/UX
- เตรียมโครงสร้างสำหรับ Phase 2 (CRUD, Authentication)
- ใช้ Best Practices ในการพัฒนา
- Code ต้องอ่านง่าย maintainable

---

---

## 📋 Phase 2.5: Completed Features Summary

### ✅ UI/UX Improvements (Completed):
- **Hidden UI Elements**: ซ่อนปุ่มพิมพ์, ปุ่มเปิด Production Task Detail Modal, ตัวเช็คเวลาเริ่ม
- **Task Numbering**: เพิ่มเลขลำดับหน้าชื่องาน (1. ชื่องาน, 2. ชื่องาน, ...)
- **Step Layout Logic**: แท่งขั้นตอนใช้เวลามาตรฐานสะสมจากเวลาเริ่มงาน และตัดที่ 17:00
- **Color Classification**: 
  - Pack steps: สีเทาเข้ม (`bg-gray-400`)
  - Clean steps: สีเทาอ่อน (`bg-gray-200`)
  - Repack jobs (ไม่มี steps): สีเทาเข้ม
- **Removed Red Overrun Bar**: ไม่แสดงแท่งสีแดงสำหรับเวลาเกินแผน
- **Web Title & Favicon**: เปลี่ยนเป็น "ตารางงานและกระบวนการผลิตสินค้าครัวกลาง"

### 🔧 Backend Adjustments (Completed):
- **Relaxed Validation**: ไม่บล็อกการแสดง steps เมื่อเวลามาตรฐานรวมมากกว่าเวลาตามแผน
- **Step Duration Logic**: ใช้เวลามาตรฐานสะสมแทนการคำนวณตาม percentage

---

**เอกสารนี้สร้างเมื่อ**: 10 ตุลาคม 2025  
**เวอร์ชัน**: 2.5 (เพิ่ม Phase 3 Schema Requirements)  
**อัปเดตล่าสุด**: 16 ตุลาคม 2025  
**ผู้จัดทำ**: Development Team





