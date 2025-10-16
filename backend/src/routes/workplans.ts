import { Router } from 'express';
import { query } from 'express-validator';
import {
  getWorkPlans,
  getWorkPlanById,
  healthCheck,
} from '../controllers/workplan.controller';

const router = Router();

/**
 * GET /api/workplans?date=YYYY-MM-DD
 * Get all work plans for a specific date
 */
router.get(
  '/workplans',
  [
    query('date')
      .notEmpty()
      .withMessage('วันที่จำเป็นต้องระบุ')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)')
      .isDate()
      .withMessage('วันที่ไม่ถูกต้อง'),
  ],
  getWorkPlans
);

/**
 * GET /api/workplans/:id
 * Get a single work plan by ID
 */
router.get('/workplans/:id', getWorkPlanById);

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', healthCheck);

export default router;





