# Backend API - Production Schedule System

Backend API สำหรับระบบตารางการผลิตครัวกลาง

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
สร้างไฟล์ `.env` (หรือ copy จาก `.env.example`):
```env
PORT=3107
DB_HOST=192.168.0.96
DB_USER=jitdhana
DB_PASSWORD=Jitdana@2025
DB_NAME=manufacturing_system
DB_PORT=3306
CORS_ORIGIN=*
```

### 3. Run Development Server
```bash
npm run dev
```

Server จะทำงานที่: `http://localhost:3107`

### 4. Build for Production
```bash
npm run build
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database connection
│   ├── controllers/
│   │   └── workplan.controller.ts
│   ├── services/
│   │   └── workplan.service.ts
│   ├── routes/
│   │   └── workplans.ts
│   ├── middlewares/
│   │   ├── cors.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/
│   │   ├── response.ts
│   │   └── logger.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts                 # Main app
├── .env                         # Environment variables
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-10T10:00:00.000Z",
  "uptime": 123.45,
  "database": "connected",
  "environment": "development"
}
```

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
      "status": "เสร็จสิ้น",
      "assignees": [
        {
          "id_code": "man",
          "name": "แมน",
          "avatar": "",
          "role": "operator"
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

### Get Work Plan by ID
```
GET /api/workplans/:id
```

**Example:**
```bash
curl http://localhost:3107/api/workplans/7398
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3107` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | Database host | `192.168.0.96` |
| `DB_USER` | Database user | `jitdhana` |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | `manufacturing_system` |
| `DB_PORT` | Database port | `3306` |
| `DB_TIMEZONE` | Database timezone | `+07:00` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |

## 🐛 Troubleshooting

### Cannot connect to database
```bash
# Test database connection from another script
node ../test-db-connection.js
```

### Port already in use
```bash
# Windows
netstat -ano | findstr :3107
taskkill /F /PID <PID>

# Linux/Mac
lsof -i :3107
kill -9 <PID>
```

### CORS errors
Make sure `CORS_ORIGIN` is set correctly in `.env`:
```env
# Development - allow all
CORS_ORIGIN=*

# Production - specific origins
CORS_ORIGIN=http://192.168.0.50:3017,http://192.168.0.51:3017
```

## 📝 Notes

- Server listens on `0.0.0.0` to allow connections from other machines
- Uses `dateStrings: true` in MySQL config to avoid timezone issues
- `work_plan_operators` joins with `users` using `id_code` (NOT `user_id`)
- Avatar paths are handled by frontend (backend returns empty string)

## 🔐 Security

- SQL Injection prevention (Prepared statements)
- Input validation (express-validator)
- Error handling (no sensitive data leaks)
- CORS configuration

## 📚 Documentation

See `/docs` folder for more documentation:
- [REQUIREMENTS.md](../docs/REQUIREMENTS.md)
- [SPECSHEET.md](../docs/SPECSHEET.md)
- [DEPLOYMENT_ISSUES.md](../docs/DEPLOYMENT_ISSUES.md)





