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
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  try {
    // Test database connection
    const pool = require('../config/database').default;
    const connection = await pool.getConnection();
    connection.release();

    const healthData = {
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
    };

    res.status(200).json(healthData);
  } catch (error: any) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      message: error.message,
    });
  }
}

