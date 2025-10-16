const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = Number(process.env.PORT) || 3105;
const API_PREFIX = process.env.API_PREFIX || '/api';

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
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

// Routes
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected'
  });
});

// Mock data for testing
const mockWorkPlans = [
  {
    id: 1,
    job_code: "TEST001",
    job_name: "ทดสอบงาน 1",
    start_time: "08:00",
    end_time: "12:00",
    location: "ห้องทดสอบ",
    status: "กำลังดำเนินการ",
    notes: "งานทดสอบ",
    assignees: [
      {
        id_code: "test1",
        name: "ผู้ทดสอบ 1",
        avatar: "/placeholder-user.jpg"
      }
    ],
    hasSteps: false,
    steps: []
  }
];

app.get(`${API_PREFIX}/workplans`, (req, res) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({
      success: false,
      message: "วันที่ไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)",
      data: [],
      meta: {
        date: null,
        total: 0
      }
    });
  }

  res.json({
    success: true,
    data: mockWorkPlans,
    meta: {
      date: date,
      total: mockWorkPlans.length,
      timezone: "Asia/Bangkok"
    }
  });
});

app.get(`${API_PREFIX}/workplans/:id`, (req, res) => {
  const { id } = req.params;
  const workPlan = mockWorkPlans.find(wp => wp.id === parseInt(id));
  
  if (!workPlan) {
    return res.status(404).json({
      success: false,
      message: "ไม่พบข้อมูลงานที่ระบุ",
      data: null
    });
  }

  res.json({
    success: true,
    data: workPlan
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'เกิดข้อผิดพลาดของระบบ',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'ไม่พบ API endpoint ที่ระบุ'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}${API_PREFIX}`);
  console.log(`🏥 Health check: http://localhost:${PORT}${API_PREFIX}/health`);
});
