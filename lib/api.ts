/**
 * API Client for Production Schedule System
 * ⚠️ All configurations must come from environment variables
 */

// API Configuration from ENV (DEV_STANDARD compliant)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || '/api';

// Validate required environment variables
if (!API_BASE_URL) {
  throw new Error(
    '❌ NEXT_PUBLIC_API_BASE_URL is not defined! ' +
    'Please create .env.development or .env.production from .env.example'
  );
}

// Debug: Log API configuration (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', {
    API_BASE_URL,
    API_PREFIX,
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.NEXT_PUBLIC_APP_ENV
  });
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
  meta?: {
    date?: string;
    total?: number;
    timezone?: string;
    [key: string]: any;
  };
}

export interface WorkPlanResponse {
  id: number;
  production_date: string;
  job_code: string;
  job_name: string;
  start_time: string;        // "HH:MM"
  end_time: string;          // "HH:MM"
  status_id: number;
  machine_id: number | null;
  production_room_id: number | null;
  notes: string | null;
  is_special: boolean;
  location: string;
  status: string;
  machine_name: string | null;
  assignees: AssigneeResponse[];
  hasSteps: boolean;         // Phase 2: Flag บอกว่ามี steps ครบหรือไม่
  steps: ProcessStepResponse[];  // Phase 2
}

export interface AssigneeResponse {
  id_code: string;
  name: string;
  avatar: string;
  position?: string | null;
  department?: string | null;
  role?: string;
}

// Phase 2: Process Step (Standard Time)
export interface ProcessStepResponse {
  process_number: number;
  process_description: string;
  estimated_duration_minutes: number;
  standard_worker_count: number;
  percentage: number;
}

/**
 * Fetch work plans for a specific date
 */
export async function fetchWorkPlans(date: string): Promise<APIResponse<WorkPlanResponse[]>> {
  try {
    const url = `${API_BASE_URL}${API_PREFIX}/workplans?date=${date}`;
    
    console.log(`Fetching work plans from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        success: false,
        message: `HTTP error! status: ${response.status}`
      }));
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: APIResponse<WorkPlanResponse[]> = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching work plans:', error);
    throw new Error(error.message || 'ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
  }
}

/**
 * Fetch a single work plan by ID
 */
export async function fetchWorkPlanById(id: number): Promise<APIResponse<WorkPlanResponse>> {
  try {
    const url = `${API_BASE_URL}${API_PREFIX}/workplans/${id}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        success: false,
        message: `HTTP error! status: ${response.status}`
      }));
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: APIResponse<WorkPlanResponse> = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching work plan:', error);
    throw new Error(error.message || 'ไม่สามารถดึงข้อมูลได้');
  }
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; [key: string]: any }> {
  try {
    const url = `${API_BASE_URL}${API_PREFIX}/health`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Health check failed:', error);
    throw error;
  }
}





