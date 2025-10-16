/**
 * TypeScript Types for Production Schedule Frontend
 */

export interface ProductionTask {
  id: number;
  job_code: string;
  job_name: string;
  start_time: string;        // "HH:MM"
  end_time: string;          // "HH:MM"
  color: string;             // Assigned by frontend (e.g., "bg-orange-200")
  location: string;
  product_image?: string;    // Mapped by frontend
  status?: string;
  notes?: string | null;
  is_special?: boolean;
  assignees: Assignee[];
  hasSteps: boolean;         // Phase 2: Flag บอกว่ามี steps ครบหรือไม่
  steps: ProcessStep[];      // Phase 2: ขั้นตอนการผลิต
}

export interface Assignee {
  id_code: string;
  name: string;
  avatar: string;            // Mapped by frontend using getAvatar()
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

export interface TimeSlot {
  time: string;
  period: "morning" | "lunch" | "afternoon";
  widthMultiplier?: number;
}





