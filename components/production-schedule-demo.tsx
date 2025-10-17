"use client"

import { useState, useEffect, useRef } from "react"
import * as XLSX from "xlsx"
import { Clock, ChevronRight, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { SimpleDatePicker } from "@/components/ui/simple-date-picker"
import { fetchWorkPlans } from "@/lib/api"
import type { WorkPlanResponse } from "@/lib/api"
import { 
  COLOR_PALETTE, 
  getAvatar, 
  getProductImage,
  getTodayDate,
  formatDuration as formatDurationHelper,
  timeToMinutes as timeToMinutesHelper,
  timeToGridColumn as timeToGridColumnHelper,
  getGridColumnSpan as getGridColumnSpanHelper,
  getStepGradientColors  // Phase 2
} from "@/lib/constants"

interface TimeSlot {
  time: string
  period: "morning" | "lunch" | "afternoon"
  widthMultiplier?: number
}

// Phase 2: Process Step (Standard Time)
interface ProcessStep {
  process_number: number
  process_description: string
  estimated_duration_minutes: number
  standard_worker_count: number
  percentage: number
}

interface Assignee {
  name: string
  avatar: string
}

interface ProductionTask {
  id: number
  job_code: string
  job_name: string
  name: string // Alias for job_name (for compatibility)
  startTime: string
  endTime: string
  start_time: string // API format
  end_time: string // API format
  color: string
  location: string
  image?: string // Added image field for product sample images
  status?: string
  notes?: string | null
  hasSteps: boolean       // Phase 2: Flag บอกว่ามี steps ครบหรือไม่
  steps: ProcessStep[]    // Phase 2: ขั้นตอนการผลิต
  assignee?: Assignee // Single assignee (for backward compatibility)
  assignees?: Assignee[] // Added support for multiple assignees
  // เพิ่มข้อมูลสำหรับ Demo
  taskStatus?: {
    type: 'normal' | 'warning' | 'error'
    color: string
    icon: string
    issues: string[]
    message: string
  }
  hasIssues?: boolean
}

const timeSlots: TimeSlot[] = [
  { time: "8:00-8:30", period: "morning" },
  { time: "8:30-9:00", period: "morning" },
  { time: "9:00-9:30", period: "morning" },
  { time: "9:30-10:00", period: "morning" },
  { time: "10:00-10:30", period: "morning" },
  { time: "10:30-11:00", period: "morning" },
  { time: "11:00-11:30", period: "morning" },
  { time: "11:30-12:00", period: "morning" },
  { time: "12:00-12:30", period: "morning" },
  { time: "12:30-13:00", period: "lunch" },
  { time: "13:00-13:30", period: "lunch" },
  { time: "13:30-14:00", period: "afternoon" },
  { time: "14:00-14:30", period: "afternoon" },
  { time: "14:30-15:00", period: "afternoon" },
  { time: "15:00-15:30", period: "afternoon" },
  { time: "15:30-16:00", period: "afternoon" },
  { time: "16:00-16:30", period: "afternoon" },
  { time: "16:30-17:00", period: "afternoon" },
]

function calculateEndTime(startTime: string, durationMinutes: number): string {
  if (!startTime) return "17:00" // Default end time if no start time
  const [hours, minutes] = startTime.split(":").map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const endHours = Math.floor(totalMinutes / 60)
  const endMinutes = totalMinutes % 60
  return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`
}


// Task validation functions
function getTaskIssues(task: any) {
  const issues = []
  
  if (!task.start_time) issues.push("ไม่มีเวลาเริ่มต้น")
  if (!task.end_time) issues.push("ไม่มีเวลาสิ้นสุด")
  if (!task.assignees?.length) issues.push("ไม่มีผู้รับผิดชอบ")
  if (!task.location) issues.push("ไม่ได้ระบุสถานที่")
  if (!task.status) issues.push("ไม่มีสถานะงาน")
  
  return issues
}

function getTaskStatus(task: any): {
  type: 'normal' | 'warning' | 'error'
  color: string
  icon: string
  issues: string[]
  message: string
} {
  const issues = getTaskIssues(task)
  
  if (issues.length === 0) {
    return { 
      type: 'normal', 
      color: 'green', 
      icon: '✅',
      issues: [],
      message: 'ข้อมูลครบถ้วน'
    }
  }
  
  return { 
    type: 'warning', 
    color: 'gray', 
    icon: '⚠️',
    issues: issues,
    message: issues.join(", ")
  }
}

function mapAPIDataToTask(apiData: WorkPlanResponse, index: number): ProductionTask {
  const assignees = apiData.assignees.map(a => ({
    name: a.name,
    avatar: getAvatar(a.id_code),
  }))

  // เช็คสถานะงาน
  const taskStatus = getTaskStatus(apiData)
  
  // Handle null start_time and end_time
  const startTime = apiData.start_time || "08:00"
  const endTime = apiData.end_time || "17:00"

  return {
    id: apiData.id,
    job_code: apiData.job_code,
    job_name: apiData.job_name,
    name: apiData.job_name, // Alias
    startTime: startTime,
    endTime: endTime,
    start_time: startTime,
    end_time: endTime,
    color: taskStatus.type === 'warning' ? '#6B7280' : COLOR_PALETTE[index % COLOR_PALETTE.length],
    location: apiData.location,
    image: getProductImage(apiData.job_name),
    status: apiData.status,
    notes: apiData.notes,
    assignees,
    hasSteps: apiData.hasSteps || false,  // Phase 2
    steps: apiData.steps || [],            // Phase 2
    // เพิ่มข้อมูลสถานะสำหรับ Demo
    taskStatus: taskStatus,
    hasIssues: taskStatus.type === 'warning'
  }
}

// Use helpers from constants (with fallback to local)
const timeToMinutes = timeToMinutesHelper || ((time: string): number => {
  if (!time) return 480 // Default to 8:00 AM if no time
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
})

const timeToGridColumn = timeToGridColumnHelper || ((time: string): number => {
  const [hours, minutes] = time.split(":").map(Number)
  const totalMinutes = hours * 60 + minutes
  const minutesFromStart = totalMinutes - 480 // 8:00 AM
  return Math.floor(minutesFromStart / 30) + 1
})

const getGridColumnSpan = getGridColumnSpanHelper || ((startTime: string, endTime: string): { start: number; end: number } => {
  // Handle null times
  const safeStartTime = startTime || "08:00"
  const safeEndTime = endTime || "17:00"
  
  const startColumn = timeToGridColumn(safeStartTime)
  const endMinutes = timeToMinutes(safeEndTime)
  const endMinutesFromStart = endMinutes - 480
  const endColumn = Math.ceil(endMinutesFromStart / 30) + 1
  return { start: startColumn, end: endColumn }
})

const formatDuration = formatDurationHelper || ((minutes: number): string => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours} ชั่วโมง`
    }
    return `${hours} ชั่วโมง ${remainingMinutes} นาที`
  }
  return `${minutes} นาที`
})

export default function ProductionScheduleDemo() {
  // API State
  const [productionTasks, setProductionTasks] = useState<ProductionTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Load tasks from API
  const loadTasksFromAPI = async (date: Date) => {
    setLoading(true)
    setError(null)
    
    try {
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
      const response = await fetchWorkPlans(dateStr)
      
      if (response.success && response.data) {
        const mappedTasks = response.data.map((workPlan, index) => 
          mapAPIDataToTask(workPlan, index)
        )
        setProductionTasks(mappedTasks)
      } else {
        setError(response.message || 'ไม่สามารถโหลดข้อมูลได้')
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ API')
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load tasks when date changes
  useEffect(() => {
    loadTasksFromAPI(selectedDate)
  }, [selectedDate])

  // Separate tasks
  const normalTasks = productionTasks.filter(task => !task.hasIssues)
  const problemTasks = productionTasks.filter(task => task.hasIssues)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">ตารางการผลิต (Demo Version)</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              >
                วันก่อน
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
              >
                วันนี้
              </button>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              >
                วันถัดไป
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <SimpleDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {selectedDate.toLocaleDateString('th-TH', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
                <p className="text-sm text-gray-600">
                  จำนวนงานทั้งหมด: {productionTasks.length} งาน
                  {problemTasks.length > 0 && (
                    <span className="ml-2 text-orange-600">
                      (มีปัญหา: {problemTasks.length} งาน)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center text-red-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-4" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Tasks with Issues */}
        {!loading && !error && problemTasks.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-orange-600 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  งานที่ต้องจัดการ ({problemTasks.length} งาน)
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {problemTasks.map((task) => (
                    <div key={task.id} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center cursor-help" title={task.taskStatus?.message}>
                            <span className="text-lg mr-2">⚠️</span>
                            <h4 className="font-medium text-gray-700">{task.name}</h4>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <p><strong>รหัสงาน:</strong> {task.job_code}</p>
                            <p><strong>สถานะ:</strong> {task.status}</p>
                            {task.location && <p><strong>สถานที่:</strong> {task.location}</p>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {task.assignees?.map((assignee, index) => (
                            <div key={index} className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                              {assignee.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Normal Tasks - Gantt Chart View */}
        {!loading && !error && normalTasks.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold">งานปกติ ({normalTasks.length} งาน)</h3>
            </div>
            <div className="p-4">
              {/* Time Header */}
              <div className="grid grid-cols-19 gap-0 mb-4">
                <div className="col-span-2 font-medium text-gray-700 border-r pr-2">งาน</div>
                {timeSlots.map((slot, index) => (
                  <div key={index} className={`text-xs text-center border-r ${slot.period === 'lunch' ? 'bg-yellow-100' : 'bg-gray-50'}`}>
                    {slot.time.split('-')[0]}
                  </div>
                ))}
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {normalTasks.map((task) => {
                  const { start, end } = getGridColumnSpan(task.startTime, task.endTime)
                  const duration = end - start
                  
                  return (
                    <div key={task.id} className="grid grid-cols-19 gap-0 items-center">
                      <div className="col-span-2 border-r pr-2">
                        <div className="font-medium text-sm">{task.name}</div>
                        <div className="text-xs text-gray-500">{task.job_code}</div>
                      </div>
                      
                      {/* Task Bar */}
                      <div 
                        className="col-span-17 relative h-8 flex items-center"
                        style={{ gridColumn: `${start + 2} / span ${duration}` }}
                      >
                        <div 
                          className="h-6 rounded text-white text-xs px-2 flex items-center justify-between w-full"
                          style={{ backgroundColor: task.color }}
                        >
                          <span className="truncate">{task.name}</span>
                          <span className="text-xs opacity-75">
                            {task.startTime}-{task.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* No Tasks */}
        {!loading && !error && productionTasks.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center text-gray-600">
              <p>ไม่มีงานในวันนี้</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
