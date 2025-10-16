# 🚨 ปัญหาที่พบบ่อยและวิธีแก้ไข (Common Deployment Issues)

## ⚠️ ปัญหาหลัก: เชื่อมต่อ Database ไม่ได้เมื่อเข้าจากเครื่องอื่น

### 🔴 Symptom (อาการ):
- ✅ Dev บนเครื่องตัวเอง (localhost) → **ใช้งานได้ปกติ**
- ❌ Deploy ไป Server หรือเข้าจาก IP เครื่อง Server → **เชื่อมต่อ Database ไม่ได้**
- ❌ ผู้ใช้เข้าผ่าน IP ของเครื่อง Server → **เชื่อมต่อ Database ไม่ได้**

### 📋 ตัวอย่างสถานการณ์:

**Development (localhost):**
```
Browser → Frontend (localhost:3017) → Backend (localhost:3107) → Database (192.168.0.96:3306)
✅ ใช้งานได้
```

**Production/Network Access:**
```
Browser (192.168.0.100) → Frontend (192.168.0.50:3017) → Backend (192.168.0.50:3107) → Database (192.168.0.96:3306)
❌ เชื่อมต่อไม่ได้
```

---

## 🔍 สาเหตุที่เป็นไปได้

### 1️⃣ **Hardcoded API URL ใน Frontend**

**ปัญหา:**
```typescript
// ❌ Wrong - Hardcoded localhost
const API_URL = 'http://localhost:3107';

// เมื่อเข้าจากเครื่องอื่น localhost จะหมายถึงเครื่องของผู้ใช้ ไม่ใช่ Server
```

**วิธีแก้:**
```typescript
// ✅ Correct - Use Environment Variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3107';
```

**ตั้งค่า .env.local:**
```env
# Development (localhost)
NEXT_PUBLIC_API_URL=http://localhost:3107

# Production (ใช้ IP ของ Server)
NEXT_PUBLIC_API_URL=http://192.168.0.50:3107
```

---

### 2️⃣ **Backend Listen เฉพาะ localhost**

**ปัญหา:**
```typescript
// ❌ Wrong - Listen only on localhost
app.listen(3107, 'localhost', () => {
  console.log('Server running on localhost:3107');
});

// เครื่องอื่นใน network เข้าไม่ถึง
```

**วิธีแก้:**
```typescript
// ✅ Correct - Listen on all interfaces
app.listen(3107, '0.0.0.0', () => {
  console.log('Server running on 0.0.0.0:3107');
});

// หรือไม่ระบุ host (default = 0.0.0.0)
app.listen(3107, () => {
  console.log('Server running on port 3107');
});
```

---

### 3️⃣ **CORS Configuration ผิด**

**ปัญหา:**
```typescript
// ❌ Wrong - Allow only localhost
app.use(cors({
  origin: 'http://localhost:3017'
}));

// เมื่อเข้าจาก IP จะถูก CORS block
```

**วิธีแก้:**
```typescript
// ✅ Correct - Allow multiple origins or all
app.use(cors({
  origin: process.env.CORS_ORIGIN === '*' 
    ? '*'  // Allow all (Development)
    : process.env.CORS_ORIGIN?.split(','), // Specific IPs (Production)
  credentials: true
}));
```

**ตั้งค่า .env:**
```env
# Development - Allow all
CORS_ORIGIN=*

# Production - Specific IPs
CORS_ORIGIN=http://192.168.0.50:3017,http://192.168.0.51:3017,http://192.168.0.52:3017
```

---

### 4️⃣ **Firewall บล็อก Port**

**ปัญหา:**
- Firewall (Windows/Linux) บล็อก port 3017, 3107

**ตรวจสอบ:**
```bash
# Windows
netstat -ano | findstr :3107

# Linux
netstat -tulpn | grep 3107
```

**วิธีแก้ (Windows):**
```powershell
# เปิด Firewall ให้ port 3017, 3107
New-NetFirewallRule -DisplayName "Frontend Port 3017" -Direction Inbound -LocalPort 3017 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Backend Port 3107" -Direction Inbound -LocalPort 3107 -Protocol TCP -Action Allow
```

**วิธีแก้ (Linux):**
```bash
# UFW
sudo ufw allow 3017/tcp
sudo ufw allow 3107/tcp

# iptables
sudo iptables -A INPUT -p tcp --dport 3017 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3107 -j ACCEPT
```

---

### 5️⃣ **Database Connection จาก Server IP**

**ปัญหา:**
```typescript
// ❌ Database บล็อกการเข้าถึงจาก IP ของ Server
```

**ตรวจสอบ MySQL User Permissions:**
```sql
-- ดู Host ที่อนุญาต
SELECT User, Host FROM mysql.user WHERE User = 'jitdhana';

-- ผลลัพธ์:
+----------+---------------+
| User     | Host          |
+----------+---------------+
| jitdhana | 192.168.0.96  | ← อนุญาตเฉพาะ 192.168.0.96
+----------+---------------+
```

**วิธีแก้:**
```sql
-- สร้าง user ที่อนุญาตจากทุก IP ใน subnet
CREATE USER 'jitdhana'@'192.168.0.%' IDENTIFIED BY 'Jitdana@2025';
GRANT ALL PRIVILEGES ON manufacturing_system.* TO 'jitdhana'@'192.168.0.%';
FLUSH PRIVILEGES;

-- หรืออนุญาตจาก IP ของ Server โดยเฉพาะ
CREATE USER 'jitdhana'@'192.168.0.50' IDENTIFIED BY 'Jitdana@2025';
GRANT ALL PRIVILEGES ON manufacturing_system.* TO 'jitdhana'@'192.168.0.50';
FLUSH PRIVILEGES;
```

---

### 6️⃣ **Next.js Static Export Issues**

**ปัญหา:**
```bash
# ถ้าใช้ next export (static site)
npm run build && npm run export

# API routes จะไม่ทำงาน (Next.js API routes ต้องใช้ Node.js server)
```

**วิธีแก้:**
```json
// package.json
{
  "scripts": {
    "dev": "next dev -p 3017",
    "build": "next build",
    "start": "next start -p 3017",  // ✅ ใช้ next start (ไม่ใช่ export)
    "lint": "next lint"
  }
}
```

---

### 7️⃣ **Environment Variables ไม่ถูกโหลด**

**ปัญหา:**
```typescript
// process.env.NEXT_PUBLIC_API_URL = undefined
```

**วิธีแก้:**

**Option 1: ใช้ .env.local (Development)**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://192.168.0.50:3107
```

**Option 2: ส่งตอน Build (Production)**
```bash
# Build with environment variable
NEXT_PUBLIC_API_URL=http://192.168.0.50:3107 npm run build

# Or use .env.production
```

**Option 3: ตั้งค่าเป็น System Environment Variable**
```bash
# Windows
set NEXT_PUBLIC_API_URL=http://192.168.0.50:3107

# Linux/Mac
export NEXT_PUBLIC_API_URL=http://192.168.0.50:3107
```

---

### 8️⃣ **Network Configuration (VPN, Proxy)**

**ปัญหา:**
- Server อยู่ใน VPN แยกจากผู้ใช้
- มี Proxy ขัดขวาง

**วิธีแก้:**
- ตรวจสอบว่าเครื่องอยู่ใน network เดียวกัน
- Ping ทดสอบ: `ping 192.168.0.50`
- Telnet ทดสอบ port: `telnet 192.168.0.50 3107`

---

## ✅ Checklist สำหรับ Deployment

### Frontend (Next.js):
- [ ] ตั้งค่า `NEXT_PUBLIC_API_URL` ใน environment variable
- [ ] Build project: `npm run build`
- [ ] Run: `npm run start -p 3017` (ไม่ใช่ export)
- [ ] ตรวจสอบว่า fetch API ใช้ `process.env.NEXT_PUBLIC_API_URL`

### Backend (Express):
- [ ] Listen on `0.0.0.0` หรือไม่ระบุ host
- [ ] ตั้งค่า `CORS_ORIGIN` ให้ถูกต้อง
- [ ] ตั้งค่า environment variables ทั้งหมด
- [ ] ตรวจสอบ database connection string

### Database:
- [ ] MySQL user มีสิทธิ์เข้าถึงจาก Server IP
- [ ] Port 3306 ไม่ถูก firewall block
- [ ] Database server ทำงานปกติ

### Network:
- [ ] Firewall อนุญาต port 3017, 3107
- [ ] Server และ Client อยู่ใน network เดียวกัน
- [ ] ทดสอบ ping และ telnet

### Testing:
```bash
# 1. ทดสอบ Backend API
curl http://192.168.0.50:3107/api/health

# 2. ทดสอบ Database จาก Backend
# (ควรมี health check endpoint ที่ทดสอบ DB)

# 3. เปิด Browser ทดสอบ Frontend
http://192.168.0.50:3017
```

---

## 🛠️ Quick Fix Script

สร้างไฟล์ `check-connection.js`:
```javascript
const mysql = require('mysql2/promise');
const fetch = require('node-fetch');

async function checkConnections() {
  console.log('=== Connection Check ===\n');

  // 1. Check Database
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '192.168.0.96',
      user: process.env.DB_USER || 'jitdhana',
      password: process.env.DB_PASSWORD || 'Jitdana@2025',
      database: process.env.DB_NAME || 'manufacturing_system',
    });
    console.log('✅ Database connection: OK');
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection: FAILED');
    console.error('   Error:', error.message);
  }

  // 2. Check Backend API
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3107';
    const response = await fetch(`${apiUrl}/api/health`);
    if (response.ok) {
      console.log('✅ Backend API: OK');
    } else {
      console.log('⚠️  Backend API: Responded but not OK');
    }
  } catch (error) {
    console.error('❌ Backend API: FAILED');
    console.error('   Error:', error.message);
  }

  console.log('\n=== Check Complete ===');
}

checkConnections();
```

**รัน:**
```bash
node check-connection.js
```

---

## 📝 Recommended Deployment Flow

### Step 1: Configuration
```bash
# 1. สร้าง .env files
# Frontend: .env.local หรือ .env.production
NEXT_PUBLIC_API_URL=http://192.168.0.50:3107

# Backend: .env
PORT=3107
DB_HOST=192.168.0.96
CORS_ORIGIN=*
```

### Step 2: Build & Start
```bash
# Frontend
cd frontend
npm run build
npm run start -p 3017

# Backend
cd backend
npm run build  # (ถ้าใช้ TypeScript)
npm start
```

### Step 3: Test
```bash
# จากเครื่องอื่นใน network
curl http://192.168.0.50:3107/api/health
curl http://192.168.0.50:3107/api/workplans?date=2025-10-08

# เปิด browser
http://192.168.0.50:3017
```

### Step 4: Verify
- ✅ เห็นตารางการผลิต
- ✅ มีข้อมูลแสดง
- ✅ ไม่มี CORS error ใน console
- ✅ ดึงข้อมูลจาก Database ได้

---

## 🚀 Production Deployment Best Practices

### 1. ใช้ Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start Backend
cd backend
pm2 start dist/index.js --name "production-schedule-backend"

# Start Frontend
cd frontend
pm2 start npm --name "production-schedule-frontend" -- start

# Save & Auto-restart
pm2 save
pm2 startup
```

### 2. ใช้ Nginx เป็น Reverse Proxy
```nginx
# /etc/nginx/sites-available/production-schedule
server {
    listen 80;
    server_name production-schedule.local;

    # Frontend
    location / {
        proxy_pass http://localhost:3017;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3107;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. ใช้ HTTPS (Optional)
```bash
# Let's Encrypt with Certbot
sudo certbot --nginx -d production-schedule.local
```

---

## 📞 Troubleshooting Commands

### Check if Port is Open:
```bash
# Windows
netstat -ano | findstr :3107
telnet 192.168.0.50 3107

# Linux/Mac
netstat -tulpn | grep 3107
nc -zv 192.168.0.50 3107
```

### Check Firewall:
```bash
# Windows
netsh advfirewall show rule name=all | findstr 3107

# Linux
sudo ufw status
sudo iptables -L -n | grep 3107
```

### Check Process:
```bash
# Windows
tasklist | findstr node

# Linux/Mac
ps aux | grep node
```

### Kill Process:
```bash
# Windows
taskkill /F /PID <PID>

# Linux/Mac
kill -9 <PID>
```

---

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [MySQL User Management](https://dev.mysql.com/doc/refman/8.0/en/user-account-management.html)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

## 🆕 Phase 2: Process Steps Display Issues

### 🔴 Issue: งานแสดงเป็นแท่งปกติแทนที่จะเป็นแท่งแบ่งขั้นตอน

#### Symptom (อาการ):
- ✅ Backend: ดึง process_templates ได้ถูกต้อง (มี is_active = 1, version ล่าสุด)
- ✅ Backend: Debug logs แสดง templates ครบถ้วน
- ❌ Frontend: ยังแสดงเป็นแท่งปกติ (ไม่แบ่งขั้นตอน)
- ❌ Terminal: แสดง "Templates incomplete or unreasonable"

#### สาเหตุที่พบ:

**1. ปัญหา Mapping: job_code ≠ product_code**
```
work_plans.job_code = "ลาบหมูนึ่ง 6 ชิ้น(40 กรัม: ชิ้น)"
process_templates.product_code = "235213-2"
```
- ระบบเดิมใช้ job_code เป็น product_code โดยตรง
- ข้อมูลจริง: job_code เป็นชื่องาน, product_code เป็นรหัสตัวเลข

**2. ปัญหา Validation: เวลาไม่ตรงกัน**
```
Template duration: 232 นาที (10+95+87+30+10)
Work plan duration: 180 นาที (09:30-12:30)
Validation: 232 <= 198 (180 * 1.1) = FALSE
```
- Template มีเวลามากกว่า Work plan
- Validation เดิมเข้มงวดเกินไป (อนุญาตเกิน 10% เท่านั้น)

**3. ปัญหา Debug Logging: is_active แสดงเป็น 'N/A'**
- SQL query ไม่ได้ SELECT `is_active` column
- TypeScript interface ไม่มี `is_active` field

#### วิธีแก้ไข:

**1. แก้ไข Mapping Logic:**
```typescript
// backend/src/services/workplan.service.ts
export async function fetchProcessTemplates(jobCode: string): Promise<ProcessTemplateRow[]> {
  // Step 1: Try direct match first
  let [templates] = await pool.query(`
    SELECT ... FROM process_templates 
    WHERE product_code = ? AND is_active = TRUE
  `, [jobCode]);

  if (templates.length > 0) return templates;

  // Step 2: Try mapping via products table
  const [productMapping] = await pool.query(`
    SELECT product_code, product_name
    FROM products 
    WHERE product_name LIKE ? OR product_code LIKE ?
  `, [`%${jobCode}%`, `%${jobCode}%`]);

  // Try each potential product_code
  for (const product of productMapping) {
    const [mappedTemplates] = await pool.query(`
      SELECT ... FROM process_templates 
      WHERE product_code = ? AND is_active = TRUE
    `, [product.product_code]);
    
    if (mappedTemplates.length > 0) return mappedTemplates;
  }
}
```

**2. แก้ไข Validation Logic:**
```typescript
// ยืดหยุ่นมากขึ้น: อนุญาตเกิน 30% หรือ 50 นาที
const maxAllowedMinutes = Math.max(
  workPlanDurationMinutes * 1.3,  // 30% เกิน
  workPlanDurationMinutes + 50    // หรือ +50 นาที
);

const isReasonable = totalMinutes <= maxAllowedMinutes;
```

**3. แก้ไข SQL Query และ TypeScript:**
```typescript
// เพิ่ม is_active ใน SELECT
SELECT pt.is_active, pt.version, ...

// อัปเดต interface
export interface ProcessTemplateRow {
  // ... existing fields
  is_active: number;  // MySQL TINYINT(1)
}

// แก้ไข debug logging
logger.debug(`Found templates:`, templates.map(t => ({
  process_number: t.process_number,
  duration: t.estimated_duration_minutes,
  is_active: t.is_active,      // ✅ แสดงค่า 1 จริง
  version: t.version
})));
```

#### การป้องกัน:

**1. Database Design:**
- ใช้ `product_code` เป็น primary key ใน work_plans
- หรือสร้าง mapping table `job_code_mapping`

**2. Validation Rules:**
- ตั้ง tolerance ที่สมเหตุสมผล (30% หรือ +50 นาที)
- เพิ่ม warning logs เมื่อเวลาต่างกันมาก

**3. Debug Tools:**
- เพิ่ม comprehensive logging ในทุกขั้นตอน
- แสดง mapping results ใน debug logs

#### Testing Checklist:
- [ ] ทดสอบงานที่มี direct match (job_code = product_code)
- [ ] ทดสอบงานที่ต้อง mapping (job_code ≠ product_code)
- [ ] ทดสอบงานที่ template duration > work plan duration
- [ ] ทดสอบงานที่ไม่มี template
- [ ] ตรวจสอบ debug logs แสดงข้อมูลถูกต้อง

---

## 🆕 Phase 2: Debug Logging Best Practices

### 📋 Debug Information ที่ควรแสดง:

**1. Template Fetching:**
```typescript
logger.debug(`Processing steps for: ${workPlan.job_name} (${workPlan.job_code})`);
logger.debug(`Product mapping results:`, productMapping);
logger.debug(`Found ${templates.length} templates:`, templates.map(t => ({
  number: t.process_number,
  description: t.process_description,
  duration: t.estimated_duration_minutes,
  is_active: t.is_active,
  version: t.version
})));
```

**2. Validation Details:**
```typescript
logger.debug(`Duration validation:`, {
  totalMinutes,
  workPlanDurationMinutes,
  maxAllowedMinutes,
  isReasonable: `${totalMinutes} <= ${maxAllowedMinutes}`,
  tolerance: `${Math.round((maxAllowedMinutes / workPlanDurationMinutes - 1) * 100)}%`
});
```

**3. Final Result:**
```typescript
logger.debug(`Successfully processed ${steps.length} steps:`, {
  steps: steps.map(s => ({
    number: s.process_number,
    percentage: s.percentage,
    duration: s.estimated_duration_minutes
  }))
});
```

---

## 🆕 Phase 2.5: UI/UX Improvements (Completed)

### ✅ Completed Features:
- **Hidden UI Elements**: ซ่อนปุ่มพิมพ์, ปุ่มเปิด Production Task Detail Modal, และตัวเช็คเวลาเริ่ม
- **Task Numbering**: เพิ่มเลขลำดับหน้าชื่องาน (1. ชื่องาน, 2. ชื่องาน, ...)
- **Step Layout Logic**: แท่งขั้นตอนใช้เวลามาตรฐานสะสมจากเวลาเริ่มงาน และตัดที่ 17:00
- **Color Classification**: 
  - Pack steps: สีเทาเข้ม (`bg-gray-400`)
  - Clean steps: สีเทาอ่อน (`bg-gray-200`)
  - Repack jobs (ไม่มี steps): สีเทาเข้ม
- **Removed Red Overrun Bar**: ไม่แสดงแท่งสีแดงสำหรับเวลาเกินแผน
- **Web Title & Favicon**: เปลี่ยนเป็น "ตารางงานและกระบวนการผลิตสินค้าครัวกลาง"

### 🔧 Technical Implementation:
```typescript
// Feature flags for UI control
const SHOW_START_LABEL = false
const SHOW_PRINT_BUTTON = false  
const SHOW_TASK_DETAIL_BUTTON = false

// Step color classification
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
**สถานะ**: Active - Phase 2.5 Complete, Phase 3 Planning





