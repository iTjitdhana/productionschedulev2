import pool from '../config/database';
import { WorkPlan, WorkPlanRow, OperatorRow, Assignee, ProcessTemplateRow, ProcessStep } from '../types';
import logger from '../utils/logger';

/**
 * Fetch work plans for a specific date
 */
export async function fetchWorkPlans(date: string): Promise<WorkPlan[]> {
  try {
    // Query work_plans with joins
    // @ts-ignore
    const [workPlanRows] = await pool.query(`
      SELECT 
        wp.id,
        wp.production_date,
        wp.job_code,
        wp.job_name,
        TIME_FORMAT(wp.start_time, '%H:%i') as start_time,
        TIME_FORMAT(wp.end_time, '%H:%i') as end_time,
        wp.status_id,
        wp.machine_id,
        wp.production_room_id,
        wp.notes,
        wp.is_special,
        pr.room_name as location,
        ps.name as status,
        m.machine_name
      FROM work_plans wp
      LEFT JOIN production_rooms pr ON wp.production_room_id = pr.id
      LEFT JOIN production_statuses ps ON wp.status_id = ps.id
      LEFT JOIN machines m ON wp.machine_id = m.id
      WHERE wp.production_date = ?
      ORDER BY wp.start_time;
    `, [date]);

    if (workPlanRows.length === 0) {
      return [];
    }

    // Get work_plan_ids
    const workPlanIds = workPlanRows.map(row => row.id);

    // Query operators - JOIN with users using id_code (NOT user_id!)
    const [operatorRows] = await pool.query(`
      SELECT 
        wpo.work_plan_id,
        wpo.user_id,
        wpo.id_code,
        wpo.role,
        u.name as user_name,
        u.position,
        u.department
      FROM work_plan_operators wpo
      LEFT JOIN users u ON wpo.id_code = u.id_code
      WHERE wpo.work_plan_id IN (?)
      ORDER BY wpo.work_plan_id, wpo.id;
    `, [workPlanIds]);

    // Debug: Log operator data
    logger.debug(`Found ${operatorRows.length} operator assignments:`, 
      operatorRows.map(row => ({
        work_plan_id: row.work_plan_id,
        id_code: row.id_code,
        user_name: row.user_name,
        position: row.position,
        department: row.department
      }))
    );

    // Debug: Check if users table has data
    const [userCount] = await pool.query(`SELECT COUNT(*) as count FROM users`);
    logger.debug(`Users table has ${userCount[0].count} records`);

    // Debug: Check specific user
    const [toonUser] = await pool.query(`SELECT * FROM users WHERE id_code = 'toon'`);
    logger.debug(`User 'toon' data:`, toonUser);

    // Group operators by work_plan_id
    const operatorsByPlan = new Map<number, Assignee[]>();
    operatorRows.forEach(row => {
      if (!operatorsByPlan.has(row.work_plan_id)) {
        operatorsByPlan.set(row.work_plan_id, []);
      }
      
      // Use proper name mapping
      const displayName = row.user_name || row.id_code;
      
      // Debug: Log name mapping
      if (!row.user_name) {
        logger.warn(`No user name found for id_code: ${row.id_code}, using id_code as fallback`);
      }
      
      operatorsByPlan.get(row.work_plan_id)!.push({
        id_code: row.id_code,
        name: displayName,
        avatar: '', // Will be mapped by frontend
        position: row.position,
        department: row.department,
        role: row.role,
      });
    });

    // Phase 2: Fetch process steps for each work plan
    const workPlansWithSteps = await Promise.all(
      workPlanRows.map(async (row) => {
        const { hasSteps, steps } = await fetchAndProcessSteps(row);
        
        return {
      id: row.id,
      production_date: row.production_date,
      job_code: row.job_code,
      job_name: row.job_name,
      start_time: row.start_time,
      end_time: row.end_time,
      status_id: row.status_id,
      machine_id: row.machine_id,
      production_room_id: row.production_room_id,
      notes: row.notes,
      is_special: Boolean(row.is_special),
      location: row.location || 'ไม่ระบุห้อง',
      status: row.status || 'ไม่ระบุสถานะ',
      machine_name: row.machine_name,
      assignees: operatorsByPlan.get(row.id) || [],
          hasSteps,    // Phase 2
          steps,       // Phase 2
        };
      })
    );

    return workPlansWithSteps;
  } catch (error) {
    logger.error('Error fetching work plans:', error);
    throw error;
  }
}

/**
 * Fetch a single work plan by ID
 */
export async function fetchWorkPlanById(id: number): Promise<WorkPlan | null> {
  try {
    // Query work_plan
    const [workPlanRows] = await pool.query(`
      SELECT 
        wp.id,
        wp.production_date,
        wp.job_code,
        wp.job_name,
        TIME_FORMAT(wp.start_time, '%H:%i') as start_time,
        TIME_FORMAT(wp.end_time, '%H:%i') as end_time,
        wp.status_id,
        wp.machine_id,
        wp.production_room_id,
        wp.notes,
        wp.is_special,
        pr.room_name as location,
        ps.name as status,
        m.machine_name
      FROM work_plans wp
      LEFT JOIN production_rooms pr ON wp.production_room_id = pr.id
      LEFT JOIN production_statuses ps ON wp.status_id = ps.id
      LEFT JOIN machines m ON wp.machine_id = m.id
      WHERE wp.id = ?;
    `, [id]);

    if (workPlanRows.length === 0) {
      return null;
    }

    const row = workPlanRows[0];

    // Query operators
    const [operatorRows] = await pool.query(`
      SELECT 
        wpo.work_plan_id,
        wpo.user_id,
        wpo.id_code,
        wpo.role,
        u.name as user_name,
        u.position,
        u.department
      FROM work_plan_operators wpo
      LEFT JOIN users u ON wpo.id_code = u.id_code
      WHERE wpo.work_plan_id = ?
      ORDER BY wpo.id;
    `, [id]);

    const assignees: Assignee[] = operatorRows.map(op => ({
      id_code: op.id_code,
      name: op.user_name || op.id_code,
      avatar: '',
      position: op.position,
      department: op.department,
      role: op.role,
    }));

    // Phase 2: Fetch process steps
    const { hasSteps, steps } = await fetchAndProcessSteps(row);

    const workPlan: WorkPlan = {
      id: row.id,
      production_date: row.production_date,
      job_code: row.job_code,
      job_name: row.job_name,
      start_time: row.start_time,
      end_time: row.end_time,
      status_id: row.status_id,
      machine_id: row.machine_id,
      production_room_id: row.production_room_id,
      notes: row.notes,
      is_special: Boolean(row.is_special),
      location: row.location || 'ไม่ระบุห้อง',
      status: row.status || 'ไม่ระบุสถานะ',
      machine_name: row.machine_name,
      assignees,
      hasSteps,    // Phase 2
      steps,       // Phase 2
    };

    return workPlan;
  } catch (error) {
    logger.error('Error fetching work plan by ID:', error);
    throw error;
  }
}

// ==================== Phase 2: Process Templates ====================

/**
 * Fetch process templates for a job_code (product_code)
 * Phase 2: Get standard time for each process step
 */
export async function fetchProcessTemplates(jobCode: string): Promise<ProcessTemplateRow[]> {
  try {
    // Step 1: Try direct match first
    let [templates] = await pool.query(`
      SELECT 
        pt.id,
        pt.product_code,
        pt.version,
        pt.process_number,
        pt.process_description,
        pt.estimated_duration_minutes,
        pt.standard_worker_count,
        pt.required_machine_type,
        pt.required_room_type,
        pt.notes,
        pt.is_active
      FROM process_templates pt
      WHERE pt.product_code = ?
        AND pt.is_active = TRUE
        AND pt.version = (
          SELECT MAX(version)
          FROM process_templates pt2
          WHERE pt2.product_code = pt.product_code
            AND pt2.is_active = TRUE
        )
      ORDER BY pt.process_number;
    `, [jobCode]);

    if (templates.length > 0) {
      logger.debug(`Found ${templates.length} templates for direct match job_code: ${jobCode}`);
      return templates;
    }

    // Step 2: Try mapping via products table (job_code might be job_name)
    logger.debug(`No direct match for job_code: ${jobCode}, trying product mapping...`);
    
    // เพิ่มการค้นหาแบบ keyword matching สำหรับ job_code ที่เป็นชื่องาน
    const [productMapping] = await pool.query<any[]>(`
      SELECT p.product_code, p.product_name
      FROM products p
      WHERE p.product_name LIKE ? 
         OR p.product_code LIKE ?
         OR (
           ? REGEXP '[ก-๙]' AND (
             p.product_name LIKE CONCAT('%', ?, '%')
             OR p.product_name LIKE CONCAT('%', REPLACE(?, ' ', '%'), '%')
           )
         )
      LIMIT 10;
    `, [`%${jobCode}%`, `%${jobCode}%`, jobCode, jobCode, jobCode]);

    // เพิ่มการค้นหาแบบ exact match สำหรับกรณีที่ job_code เป็นชื่อเต็มของสินค้า
    if (productMapping.length === 0 && jobCode.includes('กุ้งทอดมัน')) {
      // 1. Exact match
      const [exactMatch] = await pool.query<any[]>(`
        SELECT p.product_code, p.product_name
        FROM products p
        WHERE p.product_name = ?
      `, [jobCode]);
      
      if (exactMatch.length > 0) {
        productMapping.push(...exactMatch);
        logger.debug(`🐛 DEBUG กุ้งทอดมัน: Found exact match:`, exactMatch);
      }

      // 2. Manual mapping สำหรับ "กุ้งทอดมัน" → "240031"
      if (productMapping.length === 0) {
        const manualMapping = [{
          product_code: '240031',
          product_name: 'กุ้งทอดมัน'
        }];
        productMapping.push(...manualMapping);
        logger.debug(`🐛 DEBUG กุ้งทอดมัน: Using manual mapping:`, manualMapping);
      }
    }

    // Debug: ตรวจสอบเฉพาะ "กุ้งทอดมัน"
    if (jobCode.includes('กุ้งทอดมัน')) {
      logger.debug(`🐛 DEBUG กุ้งทอดมัน mapping: searching for "${jobCode}"`);
      logger.debug(`🐛 Product mapping results:`, productMapping);
      
      // ถ้าไม่เจอ ให้ลองค้นหาแบบ keyword extraction
      if (productMapping.length === 0) {
        const keywords = jobCode.split(/[\s\(\)\-]/).filter(word => word.length > 1);
        logger.debug(`🐛 Extracted keywords:`, keywords);
        
        for (const keyword of keywords) {
          const [keywordMapping] = await pool.query<any[]>(`
            SELECT p.product_code, p.product_name
            FROM products p
            WHERE p.product_name LIKE CONCAT('%', ?, '%')
            LIMIT 5;
          `, [keyword]);
          
          if (keywordMapping.length > 0) {
            logger.debug(`🐛 Keyword "${keyword}" found:`, keywordMapping);
            productMapping.push(...keywordMapping);
          }
        }
      }
    } else {
      logger.debug(`Product mapping results for "${jobCode}":`, productMapping);
    }

    if (productMapping.length > 0) {
      // Try each potential product_code
      for (const product of productMapping) {
        const [mappedTemplates] = await pool.query(`
          SELECT 
            pt.id,
            pt.product_code,
            pt.version,
            pt.process_number,
            pt.process_description,
            pt.estimated_duration_minutes,
            pt.standard_worker_count,
            pt.required_machine_type,
            pt.required_room_type,
            pt.notes,
            pt.is_active
          FROM process_templates pt
          WHERE pt.product_code = ?
            AND pt.is_active = TRUE
            AND pt.version = (
              SELECT MAX(version)
              FROM process_templates pt2
              WHERE pt2.product_code = pt.product_code
                AND pt2.is_active = TRUE
            )
          ORDER BY pt.process_number;
        `, [product.product_code]);

        if (mappedTemplates.length > 0) {
          // Debug: ตรวจสอบเฉพาะ "กุ้งทอดมัน"
          if (jobCode.includes('กุ้งทอดมัน')) {
            logger.debug(`🐛 DEBUG กุ้งทอดมัน: Found ${mappedTemplates.length} templates for product_code: ${product.product_code}`);
            logger.debug(`🐛 Templates:`, mappedTemplates.map(t => ({
              process_number: t.process_number,
              duration: t.estimated_duration_minutes,
              is_active: t.is_active,
              version: t.version
            })));
          } else {
            logger.debug(`Found ${mappedTemplates.length} templates for mapped product_code: ${product.product_code} (from job_code: ${jobCode})`);
          }
          return mappedTemplates;
        }
      }
    }

    logger.debug(`No templates found for job_code: ${jobCode}`);
    return [];
  } catch (error) {
    logger.error(`Error fetching process templates for job_code: ${jobCode}`, error);
    return []; // Return empty array if error
  }
}

/**
 * Validate if templates are complete
 * Phase 2: Check if all required data exists
 */
function validateTemplateCompleteness(
  templates: ProcessTemplateRow[], 
  workPlanDurationMinutes: number
): boolean {
  // ไม่มี template
  if (!templates || templates.length === 0) {
    return false;
  }

  // ทุกขั้นตอนต้องมี estimated_duration_minutes > 0
  const allHaveDuration = templates.every(
    t => t.estimated_duration_minutes && t.estimated_duration_minutes > 0
  );

  if (!allHaveDuration) {
    return false;
  }

  // ปรับตามความต้องการ Phase 2:
  // ไม่บล็อกกรณีเวลามาตรฐานรวมมากกว่าเวลาตามแผน
  // ฝั่ง frontend จะเรนเดอร์จากเวลาเริ่มและตัดแท่งที่ 17:00 แทน
  return true;
}

/**
 * Calculate step percentages
 * Phase 2: Calculate percentage of each step relative to total time
 */
function calculateStepPercentages(templates: ProcessTemplateRow[]): ProcessStep[] {
  const totalMinutes = templates.reduce(
    (sum, t) => sum + t.estimated_duration_minutes, 
    0
  );

  return templates.map(template => ({
    process_number: template.process_number,
    process_description: template.process_description,
    estimated_duration_minutes: template.estimated_duration_minutes,
    standard_worker_count: template.standard_worker_count,
    percentage: totalMinutes > 0 
      ? Math.round((template.estimated_duration_minutes / totalMinutes) * 10000) / 100  // 2 decimal places
      : 0
  }));
}

/**
 * Calculate work plan duration in minutes
 */
function calculateDurationMinutes(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  return endTotalMinutes - startTotalMinutes;
}

/**
 * Fetch and process steps for a work plan
 * Phase 2: Main function to get steps with validation
 */
async function fetchAndProcessSteps(workPlan: WorkPlanRow): Promise<{ hasSteps: boolean; steps: ProcessStep[] }> {
  try {
    logger.debug(`Processing steps for work plan: ${workPlan.job_name} (job_code: ${workPlan.job_code})`);
    
    // Debug: ตรวจสอบเฉพาะ "กุ้งทอดมัน"
    if (workPlan.job_name.includes('กุ้งทอดมัน') || workPlan.job_code.includes('กุ้งทอดมัน')) {
      logger.debug(`🐛 DEBUG กุ้งทอดมัน: job_code="${workPlan.job_code}", job_name="${workPlan.job_name}"`);
      logger.debug(`🐛 Work plan time: ${workPlan.start_time} - ${workPlan.end_time}`);
    }
    
    // 1. ดึง templates ตาม job_code
    const templates = await fetchProcessTemplates(workPlan.job_code);

    if (templates.length === 0) {
      // Debug: ตรวจสอบเฉพาะ "กุ้งทอดมัน"
      if (workPlan.job_name.includes('กุ้งทอดมัน') || workPlan.job_code.includes('กุ้งทอดมัน')) {
        logger.debug(`🐛 DEBUG กุ้งทอดมัน: No templates found for job_code="${workPlan.job_code}"`);
      } else {
        logger.debug(`No templates found for job_code: ${workPlan.job_code}`);
      }
      return { hasSteps: false, steps: [] };
    }

    logger.debug(`Found ${templates.length} templates for ${workPlan.job_code}:`, templates.map(t => ({
      process_number: t.process_number,
      description: t.process_description,
      duration: t.estimated_duration_minutes,
      is_active: t.is_active,
      version: t.version
    })));

    // 2. คำนวณระยะเวลาของงาน (คงไว้เพื่อ logging แต่ไม่ใช้บล็อกการแสดงผล)
    const workPlanDuration = calculateDurationMinutes(workPlan.start_time, workPlan.end_time);
    logger.debug(`Work plan duration: ${workPlanDuration} minutes (${workPlan.start_time} - ${workPlan.end_time})`);

    // 3. Validate ความครบถ้วน (ไม่เช็คเกินเวลาตามแผนอีกต่อไป)
    const isComplete = validateTemplateCompleteness(templates, workPlanDuration);

    if (!isComplete) {
      // Debug: ตรวจสอบเฉพาะ "กุ้งทอดมัน"
      if (workPlan.job_name.includes('กุ้งทอดมัน') || workPlan.job_code.includes('กุ้งทอดมัน')) {
        logger.debug(`🐛 DEBUG กุ้งทอดมัน: Templates incomplete (missing duration or no templates)`);
        logger.debug(`🐛 Work plan duration: ${workPlanDuration} minutes`);
        logger.debug(`🐛 Template durations:`, templates.map(t => t.estimated_duration_minutes));
      } else {
        logger.debug(`Templates incomplete for job_code: ${workPlan.job_code}`);
      }
      return { hasSteps: false, steps: [] };
    }

    // 4. คำนวณ percentages
    const steps = calculateStepPercentages(templates);

    logger.debug(`Successfully processed ${steps.length} steps for job_code: ${workPlan.job_code}`, {
      steps: steps.map(s => ({ number: s.process_number, percentage: s.percentage, duration: s.estimated_duration_minutes }))
    });

    return { hasSteps: true, steps };
  } catch (error) {
    logger.error(`Error processing steps for job_code: ${workPlan.job_code}`, error);
    return { hasSteps: false, steps: [] };
  }
}



