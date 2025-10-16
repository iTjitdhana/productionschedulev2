// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  date?: string;
  total?: number;
  timezone?: string;
  [key: string]: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Work Plan Types
export interface WorkPlan {
  id: number;
  production_date: string;
  job_code: string;
  job_name: string;
  start_time: string;        // Format: "HH:MM"
  end_time: string;          // Format: "HH:MM"
  status_id: number;
  machine_id: number | null;
  production_room_id: number | null;
  notes: string | null;
  is_special: boolean;
  location: string | null;   // From production_rooms.room_name
  status: string | null;     // From production_statuses.name
  machine_name: string | null;
  assignees: Assignee[];
  hasSteps: boolean;         // Phase 2: Flag บอกว่ามี steps ครบหรือไม่
  steps: ProcessStep[];      // Phase 2: ขั้นตอนการผลิต
}

export interface Assignee {
  id_code: string;           // "ae", "arm", etc.
  name: string;              // "เอ", "อาร์ม", etc.
  avatar: string;            // "/images/a.jpg" (mapped by frontend or backend)
  position?: string | null;
  department?: string | null;
  role?: 'operator' | 'supervisor' | 'qa' | 'helper';
}

// Phase 2: Standard Time Display
export interface ProcessStep {
  process_number: number;
  process_description: string;
  estimated_duration_minutes: number;  // เวลามาตรฐาน
  standard_worker_count: number;
  percentage: number;                  // % ของเวลารวม
}

// Database Query Result Types
export interface WorkPlanRow {
  id: number;
  production_date: string;
  job_code: string;
  job_name: string;
  start_time: string;
  end_time: string;
  status_id: number;
  machine_id: number | null;
  production_room_id: number | null;
  notes: string | null;
  is_special: number;        // MySQL returns TINYINT as number
  location: string | null;
  status: string | null;
  machine_name: string | null;
}

export interface OperatorRow {
  work_plan_id: number;
  user_id: number | null;
  id_code: string;
  role: 'operator' | 'supervisor' | 'qa' | 'helper';
  user_name: string | null;
  position: string | null;
  department: string | null;
}

// Phase 2: Process Template Query Result
export interface ProcessTemplateRow {
  id: number;
  product_code: string;
  version: number;
  process_number: number;
  process_description: string;
  estimated_duration_minutes: number;
  standard_worker_count: number;
  required_machine_type: string | null;
  required_room_type: string | null;
  notes: string | null;
  is_active: number;  // MySQL TINYINT(1) returns as number
}

export interface ProcessExecutionRow {
  id: number;
  work_plan_id: number;
  process_number: number;
  process_description: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'paused';
  actual_worker_count: number | null;
}

// Health Check Types
export interface HealthCheck {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: 'connected' | 'disconnected';
  environment: string;
}





