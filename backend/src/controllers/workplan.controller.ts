import { Request, Response } from 'express';
import { fetchWorkPlans, fetchWorkPlanById } from '../services/workplan.service';
import { sendSuccess, sendError, sendNotFound, sendServerError } from '../utils/response';
import { validationResult } from 'express-validator';
import logger from '../utils/logger';

/**
 * GET /api/workplans?date=YYYY-MM-DD
 * Get all work plans for a specific date
 */
export async function getWorkPlans(req: Request, res: Response): Promise<void> {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, 'รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)', 
        errors.array().map(err => ({
          field: err.type === 'field' ? (err as any).path : 'unknown',
          message: err.msg
        }))
      );
      return;
    }

    const date = req.query.date as string;

    logger.info(`Fetching work plans for date: ${date}`);

    const workPlans = await fetchWorkPlans(date);

    if (workPlans.length === 0) {
      sendSuccess(
        res,
        [],
        'ไม่พบข้อมูลในวันที่ระบุ',
        {
          date,
          total: 0,
          timezone: 'Asia/Bangkok',
        },
        200
      );
      return;
    }

    sendSuccess(
      res,
      workPlans,
      undefined,
      {
        date,
        total: workPlans.length,
        timezone: 'Asia/Bangkok',
      }
    );
  } catch (error: any) {
    logger.error('Error in getWorkPlans:', error);
    sendServerError(res, error.message, error);
  }
}

/**
 * GET /api/workplans/:id
 * Get a single work plan by ID
 */
export async function getWorkPlanById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      sendError(res, 'รหัสงานไม่ถูกต้อง');
      return;
    }

    logger.info(`Fetching work plan with ID: ${id}`);

    const workPlan = await fetchWorkPlanById(id);

    if (!workPlan) {
      sendNotFound(res, 'ไม่พบข้อมูลงานที่ระบุ');
      return;
    }

    sendSuccess(res, workPlan);
  } catch (error: any) {
    logger.error('Error in getWorkPlanById:', error);
    sendServerError(res, error.message, error);
  }
}

/**
 * GET /api/health
 * Health check endpoint
 * Reference: DEV_STANDARD.md Section 15 (Logging & Monitoring)
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  const traceId = req.traceId || 'unknown';
  const startTime = Date.now();
  
  try {
    // Test database connection
    const pool = require('../config/database').default;
    const dbStart = Date.now();
    const connection = await pool.getConnection();
    connection.release();
    const dbResponseTime = Date.now() - dbStart;

    const healthData = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      traceId,
      service: {
        name: 'Production Schedule API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor(process.uptime()),
        memoryUsage: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        }
      },
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`,
        host: process.env.DB_HOST,
        name: process.env.DB_NAME
      },
      responseTime: `${Date.now() - startTime}ms`
    };

    logger.info(`[${traceId}] Health check: OK (${dbResponseTime}ms DB response)`);
    res.status(200).json(healthData);
  } catch (error: any) {
    logger.error(`[${traceId}] Health check failed:`, error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      traceId,
      service: {
        name: 'Production Schedule API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor(process.uptime()),
      },
      database: {
        status: 'disconnected',
        error: error.message,
      },
      responseTime: `${Date.now() - startTime}ms`
    });
  }
}

