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
  const [hours, minutes] = startTime.split(":").map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const endHours = Math.floor(totalMinutes / 60)
  const endMinutes = totalMinutes % 60
  return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours} ชั่วโมง`
    }
    return `${hours} ชั่วโมง ${remainingMinutes} นาที`
  }
  return `${minutes} นาที`
}

// Helper function to map API data to ProductionTask
function mapAPIDataToTask(apiData: WorkPlanResponse, index: number): ProductionTask {
  // Map assignees with avatars
  const assignees = apiData.assignees.map(a => ({
    name: a.name,
    avatar: getAvatar(a.id_code),
  }))

  return {
    id: apiData.id,
    job_code: apiData.job_code,
    job_name: apiData.job_name,
    name: apiData.job_name, // Alias
    startTime: apiData.start_time,
    endTime: apiData.end_time,
    start_time: apiData.start_time,
    end_time: apiData.end_time,
    color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    location: apiData.location,
    image: getProductImage(apiData.job_name),
    status: apiData.status,
    notes: apiData.notes,
    assignees,
    hasSteps: apiData.hasSteps || false,  // Phase 2
    steps: apiData.steps || [],            // Phase 2
  }
}

// Hardcoded data removed - all data now comes from API
// If API fails, will show empty state
const productionTasksHardcoded: ProductionTask[] = []

// Use helper functions from constants
const START_TIME = 8 * 60 // 8:00 in minutes
const END_TIME = 17 * 60 // 17:00 in minutes
const TOTAL_SLOT_UNITS = timeSlots.length
const MINUTES_PER_GRID_UNIT = 5 // ใช้ค่าจาก constants
const TOTAL_MINUTES = END_TIME - START_TIME // 540 minutes (9 hours)
const TOTAL_GRID_COLUMNS = TOTAL_MINUTES / MINUTES_PER_GRID_UNIT // 108 columns
// Responsive: dynamic pixel width per 5-minute unit; fallback default
const DEFAULT_GRID_UNIT_PX = 14
// Feature flags
const SHOW_START_LABEL = false
const SHOW_PRINT_BUTTON = false
const SHOW_TASK_DETAIL_BUTTON = false

// Use helpers from constants (with fallback to local)
const timeToMinutes = timeToMinutesHelper || ((time: string): number => {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
})

const timeToGridColumn = timeToGridColumnHelper || ((time: string): number => {
  const minutes = timeToMinutes(time)
  const minutesFromStart = minutes - START_TIME
  return Math.floor(minutesFromStart / MINUTES_PER_GRID_UNIT) + 1
})

const getGridColumnSpan = getGridColumnSpanHelper || ((startTime: string, endTime: string): { start: number; end: number } => {
  const startColumn = timeToGridColumn(startTime)
  const endMinutes = timeToMinutes(endTime)
  const endMinutesFromStart = endMinutes - START_TIME
  const endColumn = Math.ceil(endMinutesFromStart / MINUTES_PER_GRID_UNIT) + 1
  return { start: startColumn, end: endColumn }
})

// Phase 2.5: Keyword-based category classification and styling
type ProcessCategory = 'prep' | 'produce' | 'pack' | 'clean'

function classifyStepCategory(description: string): ProcessCategory {
  const d = (description || '').toLowerCase()

  // Pack keywords (extended): แพค, แพ็ค, แวค, ใส่ถุง, บรรจุ, ซีล, ติดสติ๊กเกอร์
  if (
    d.includes('แพค') ||
    d.includes('แพ็ค') ||
    d.includes('แวค') ||
    d.includes('ใส่ถุง') ||
    d.includes('บรรจุ') ||
    d.includes('ซีล') ||
    d.includes('ติดสติ๊กเกอร์')
  ) {
    return 'pack'
  }

  // Clean keywords: ล้าง, ทำความสะอาด, sanitize, เก็บล้าง
  if (
    d.includes('ล้าง') ||
    d.includes('ทำความสะอาด') ||
    d.includes('sanitize') ||
    d.includes('เก็บล้าง')
  ) {
    return 'clean'
  }

  // Produce keywords
  if (
    d.includes('หั่น') ||
    d.includes('ปรุง') ||
    d.includes('ผัด') ||
    d.includes('ทอด') ||
    d.includes('ต้ม') ||
    d.includes('อบ') ||
    d.includes('บด') ||
    d.includes('คั่ว')
  ) {
    return 'produce'
  }

  // Prep keywords
  if (
    d.includes('รับวัตถุดิบ') ||
    d.includes('เตรียม') ||
    d.includes('คัด') ||
    d.includes('หมัก') ||
    d.includes('ชั่ง') ||
    d.includes('ตวง') ||
    d.includes('ละลาย')
  ) {
    return 'prep'
  }

  // Fallback
  return 'produce'
}

function getStepBackgroundClass(description: string, baseColor: string): string {
  const category = classifyStepCategory(description)
  if (category === 'pack') return 'bg-gray-400'
  if (category === 'clean') return 'bg-gray-200'
  return baseColor
}

export default function ProductionSchedule() {
  // API State
  const [productionTasks, setProductionTasks] = useState<ProductionTask[]>(productionTasksHardcoded)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate())

  // UI State
  const [hoveredStep, setHoveredStep] = useState<{ taskIndex: number; stepIndex: number } | null>(null)
  const [hoveredTask, setHoveredTask] = useState<number | null>(null)
  const [hoveredAssignee, setHoveredAssignee] = useState<{ taskIndex: number; assigneeIndex: number } | null>(null)
  const [hoveredRemainingWorkers, setHoveredRemainingWorkers] = useState<number | null>(null)
  const [selectedTask, setSelectedTask] = useState<number | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  // Responsive width based on container
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [unitPx, setUnitPx] = useState<number>(DEFAULT_GRID_UNIT_PX)

  useEffect(() => {
    function compute() {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      // Use exact per-column width so the last column ends exactly at the right edge
      // Clamp for readability but avoid flooring to keep total width exact
      const raw = width / TOTAL_GRID_COLUMNS
      const computed = Math.max(8, Math.min(28, raw))
      setUnitPx(computed)
    }
    compute()

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => compute())
      if (containerRef.current) ro.observe(containerRef.current)
    } else {
      window.addEventListener('resize', compute)
    }
    return () => {
      if (ro && containerRef.current) ro.unobserve(containerRef.current)
      window.removeEventListener('resize', compute)
    }
  }, [])

  // Use fractional tracks so the last column always flushes right edge
  const gridTemplateColumns = `repeat(${TOTAL_GRID_COLUMNS}, minmax(0, 1fr))`

  const currentDate = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Load work plans from API
  useEffect(() => {
    async function loadWorkPlans() {
      try {
        setLoading(true)
        setError(null)

        console.log(`🔄 Loading work plans for date: ${selectedDate}`)

        const response = await fetchWorkPlans(selectedDate)

        if (!response.success || !response.data) {
          throw new Error(response.message || 'ไม่สามารถดึงข้อมูลได้')
        }

        // Map API data to ProductionTask format
        const mappedTasks = response.data.map((workPlan, index) => 
          mapAPIDataToTask(workPlan, index)
        )

        console.log(`✅ Loaded ${mappedTasks.length} tasks`)
        
        // Debug: Verify start times
        mappedTasks.forEach((task, index) => {
          const { start } = getGridColumnSpan(task.start_time, task.end_time)
          const calculatedMinutes = START_TIME + ((start - 1) * MINUTES_PER_GRID_UNIT)
          const actualMinutes = timeToMinutes(task.start_time)
          const isCorrect = Math.abs(calculatedMinutes - actualMinutes) < MINUTES_PER_GRID_UNIT
          
          // Debug เฉพาะ "กุ้งทอดมัน"
          if (task.job_name.includes('กุ้งทอดมัน')) {
            console.log(`🔍 DEBUG กุ้งทอดมัน:`, {
              'job_name': task.job_name,
              'start_time': task.start_time,
              'end_time': task.end_time,
              'Grid Column Start': start,
              'Grid Column End': getGridColumnSpan(task.start_time, task.end_time).end,
              'คำนวณได้ (นาที)': calculatedMinutes,
              'จริง (นาที)': actualMinutes,
              'ส่วนต่าง': Math.abs(calculatedMinutes - actualMinutes),
              'สถานะ': isCorrect ? 'ถูกต้อง' : 'ไม่ตรง',
              'hasSteps': task.hasSteps,
              'steps_count': task.steps?.length || 0
            })
          }
          
          console.log(`${isCorrect ? '✅' : '❌'} Task ${index + 1} (${task.job_name}):`, {
            'เวลาตามแผน': task.start_time,
            'Grid Column': start,
            'คำนวณได้ (นาที)': calculatedMinutes,
            'จริง (นาที)': actualMinutes,
            'ส่วนต่าง': Math.abs(calculatedMinutes - actualMinutes),
            'สถานะ': isCorrect ? 'ถูกต้อง' : 'ไม่ตรง'
          })
        })
        
        setProductionTasks(mappedTasks)
      } catch (err: any) {
        console.error('❌ Error loading work plans:', err)
        setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล')
        // Use hardcoded data as fallback
        setProductionTasks(productionTasksHardcoded)
      } finally {
        setLoading(false)
      }
    }

    loadWorkPlans()
  }, [selectedDate])

  // Loading State
  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">กำลังโหลดข้อมูล...</p>
          <p className="text-sm text-muted-foreground mt-2">วันที่: {currentDate}</p>
        </div>
      </div>
    )
  }

  // Error State (but still show fallback data)
  const showErrorBanner = error !== null

  const exportAllToExcel = () => {
    const workbook = XLSX.utils.book_new()

    const summaryData = [["ตารางงานผลิต"], [currentDate], [], ["ชื่องาน", "เวลาเริ่ม", "เวลาสิ้นสุด", "ระยะเวลารวม", "สถานที่"]]

    productionTasks.forEach((task) => {
      // Phase 2: Calculate total from steps or task duration
      const totalDuration = task.hasSteps && task.steps.length > 0
        ? task.steps.reduce((total, step) => total + step.estimated_duration_minutes, 0)
        : timeToMinutes(task.end_time) - timeToMinutes(task.start_time)

      summaryData.push([task.job_name, task.start_time, task.end_time, formatDuration(totalDuration), task.location])
    })

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "สรุป")

    // Phase 2: Export steps if available
    productionTasks.forEach((task, index) => {
      if (task.hasSteps && task.steps.length > 0) {
        const taskData = [
          [task.name],
          [`เวลาทำงาน: ${task.startTime} - ${task.endTime}`],
          [`สถานที่: ${task.location}`],
          [],
          ["ลำดับ", "ชื่อกระบวนการ", "เวลามาตรฐาน (นาที)", "สัดส่วน (%)", "จำนวนคนมาตรฐาน"],
        ]

        task.steps.forEach((step) => {
          taskData.push([
            String(step.process_number),
            step.process_description,
            String(step.estimated_duration_minutes),
            String(step.percentage.toFixed(1)),
            String(step.standard_worker_count),
          ])
        })

        const totalDuration = task.steps.reduce((total, step) => total + step.estimated_duration_minutes, 0)
        taskData.push([])
        taskData.push(["รวมเวลาทั้งหมด:", "", formatDuration(totalDuration), "100.0%", ""])

        const taskSheet = XLSX.utils.aoa_to_sheet(taskData)
        const sheetName = index <= 3 ? task.name.substring(0, 20) : `${index - 3}. ${task.name.substring(0, 20)}`
        XLSX.utils.book_append_sheet(workbook, taskSheet, sheetName)
      }
    })

    XLSX.writeFile(workbook, `ตารางงานผลิต_${new Date().toLocaleDateString("th-TH")}.xlsx`)
  }

  const exportTaskToExcel = (taskIndex: number) => {
    const task = productionTasks[taskIndex]
    const workbook = XLSX.utils.book_new()

    const taskData = [
      ["รายละเอียดงานผลิต"],
      [],
      ["ชื่องาน:", task.job_name],
      ["เวลาทำงาน:", `${task.start_time} - ${task.end_time}`],
      ["สถานที่:", task.location],
      ["สถานะ:", task.status || '-'],
      [],
      ["ผู้ปฏิบัติงาน:"],
    ]

    // Add assignees
    task.assignees?.forEach((assignee, idx) => {
      taskData.push([`${idx + 1}.`, assignee.name])
    })

    taskData.push([])
    taskData.push([])

    // Phase 2: Export steps if available
    if (task.hasSteps && task.steps.length > 0) {
      taskData.push(["กระบวนการผลิต (เวลามาตรฐาน)"])
      taskData.push(["ลำดับ", "ชื่อกระบวนการ", "เวลามาตรฐาน", "สัดส่วน", "จำนวนคนมาตรฐาน"])

      task.steps.forEach((step) => {
        taskData.push([
          String(step.process_number),
          step.process_description,
          `${step.estimated_duration_minutes} นาที`,
          `${step.percentage.toFixed(1)}%`,
          `${step.standard_worker_count} คน`,
        ])
      })

      const totalDuration = task.steps.reduce((total, step) => total + step.estimated_duration_minutes, 0)
      taskData.push([])
      taskData.push(["รวมเวลาทั้งหมด:", "", formatDuration(totalDuration), "100.0%", ""])
    }

    const taskSheet = XLSX.utils.aoa_to_sheet(taskData)
    XLSX.utils.book_append_sheet(workbook, taskSheet, task.name)

    XLSX.writeFile(workbook, `${task.name}_${new Date().toLocaleDateString("th-TH")}.xlsx`)
  }

  const handleCloseModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setSelectedTask(null)
      setIsClosing(false)
    }, 300) // Match animation duration
  }

  return (
    <>
      {/* Error Banner */}
      {showErrorBanner && (
        <div className="mb-3 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">ไม่สามารถเชื่อมต่อ API ได้</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <p className="text-xs text-red-500 mt-2">แสดงข้อมูลตัวอย่างแทน (Hardcoded)</p>
          </div>
          <button
            onClick={() => { setSelectedDate(getTodayDate()) }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            ลองอีกครั้ง
          </button>
        </div>
      )}

      <div className="mb-2 lg:mb-3 flex items-center justify-between gap-3 lg:gap-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <img src="/images/design-mode/JDN-Logo-PNG.png" alt="JDN Logo" className="h-12 lg:h-16 w-auto" />
          <h1 className="font-bold text-black text-xl lg:text-2xl">ตารางงานและกระบวนการผลิตสินค้าครัวกลาง</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-48">
            <SimpleDatePicker
              value={new Date(selectedDate)}
              onChange={(date) => {
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                setSelectedDate(`${year}-${month}-${day}`)
              }}
              placeholder="เลือกวันที่"
            />
          </div>
          {SHOW_PRINT_BUTTON && (
            <button
              onClick={() => window.print()}
              className="px-3 lg:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs lg:text-sm transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              พิมพ์
            </button>
          )}
        </div>
      </div>

      <div className="w-full overflow-hidden border border-gray-600 rounded-lg bg-white shadow-sm">
        <div className="overflow-hidden">
          <div className="w-full" ref={containerRef}>
            {/* Header */}
            <div className="flex border-b border-gray-600 bg-gray-50">
              <div className="w-[300px] flex-shrink-0 border-r border-gray-600 p-2 lg:p-3 flex items-center justify-center bg-white">
                <div className="flex-1 text-center">
                  <div className="font-bold text-black text-sm lg:text-base">ชื่องาน</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="grid border-b border-gray-600 w-full" style={{ gridTemplateColumns }}>
                  <div
                    className="p-2 text-center font-medium text-sm lg:text-base bg-white text-black border-r border-gray-600 flex items-center justify-center gap-2"
                    style={{
                      gridColumnStart: 1,
                      gridColumnEnd: 55,
                    }}
                  >
                    <span>ช่วงเช้า</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div
                    className="p-2 text-center font-medium text-sm lg:text-base bg-gray-100 text-black border-r border-gray-600"
                    style={{
                      gridColumnStart: 55,
                      gridColumnEnd: 67,
                    }}
                  >
                    พักเที่ยง
                  </div>
                  <div
                    className="p-2 text-center font-medium text-sm lg:text-base bg-white text-black flex items-center justify-center gap-2"
                    style={{
                      gridColumnStart: 67,
                      gridColumnEnd: 109,
                    }}
                  >
                    <span>ช่วงบ่าย</span>
                    <Clock className="w-4 h-4" />
                  </div>
                </div>

                <div className="grid" style={{ gridTemplateColumns }}>
                      {timeSlots.map((slot, index) => {
                    const [startTime] = slot.time.split("-")
                    const startColumn = timeToGridColumn(startTime)
                    const endColumn = startColumn + 6

                    const bgColor = slot.period === "lunch" ? "bg-gray-50" : "bg-white"

                    return (
                      <div
                        key={index}
                            className={`p-2 text-[10px] sm:text-xs md:text-sm font-mono text-center border-r border-gray-600 ${bgColor} text-black flex items-center justify-center gap-2`}
                        style={{
                          gridColumnStart: startColumn,
                          gridColumnEnd: endColumn,
                        }}
                      >
                        <div className="font-semibold whitespace-nowrap text-center text-xs">{slot.time}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {productionTasks.map((task, taskIndex) => {
              const allAssignees = task.assignees || (task.assignee ? [task.assignee] : [])
              const displayedAssignees = allAssignees.slice(0, 3)
              const remainingCount = allAssignees.length - 3
              const remainingWorkers = allAssignees.slice(3)

              return (
                <div key={taskIndex} className="flex border-b border-gray-600 hover:bg-gray-50 transition-colors">
                  <div className="w-[300px] flex-shrink-0 border-r border-gray-600 p-1.5 lg:p-2 flex items-center">
                    <div className="flex-1">
                      <div className="font-bold text-black text-xs lg:text-sm rounded flex items-center gap-2 group">
                        <span>{taskIndex + 1}. {task.job_name}</span>
                        {SHOW_TASK_DETAIL_BUTTON && (
                          <ChevronRight
                            className="w-4 h-4 text-gray-400 hover:text-black hover:translate-x-0.5 transition-all cursor-pointer hover:scale-110"
                            onClick={() => setSelectedTask(taskIndex)}
                          />
                        )}
                      </div>
                      <div className="text-xs lg:text-sm text-black font-mono mt-1 flex items-center gap-1.5 flex-wrap">
                        <span>สถานที่: {task.location}</span>
                        {displayedAssignees.length > 0 && (
                          <>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center gap-1.5">
                              {displayedAssignees.map((assignee, assigneeIndex) => (
                                <div
                                  key={assigneeIndex}
                                  className="relative"
                                  onMouseEnter={() => setHoveredAssignee({ taskIndex, assigneeIndex })}
                                  onMouseLeave={() => setHoveredAssignee(null)}
                                >
                                  <img
                                    src={assignee.avatar || "/placeholder.svg"}
                                    alt={assignee.name}
                                    className="w-8 h-8 rounded-full object-cover border border-gray-300 cursor-pointer hover:border-gray-400 transition-all duration-300 hover:scale-150 hover:z-10 relative"
                                  />
                                  {hoveredAssignee?.taskIndex === taskIndex &&
                                    hoveredAssignee?.assigneeIndex === assigneeIndex && (
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-black text-sm rounded shadow-lg border border-gray-200 whitespace-nowrap z-50 pointer-events-none">
                                        <div className="font-semibold">ผู้ปฏิบัติงาน: {assignee.name}</div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                          <div className="border-4 border-transparent border-t-gray-200" />
                                          <div className="border-4 border-transparent border-t-white -mt-[9px]" />
                                        </div>
                                      </div>
                                    )}
                                </div>
                              ))}
                              {remainingCount > 0 && (
                                <div
                                  className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                  onMouseEnter={() => setHoveredRemainingWorkers(taskIndex)}
                                  onMouseLeave={() => setHoveredRemainingWorkers(null)}
                                >
                                  +{remainingCount}
                                  {hoveredRemainingWorkers === taskIndex && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-black text-sm rounded shadow-lg border border-gray-200 whitespace-nowrap z-50 pointer-events-none">
                                      <div className="font-semibold mb-1">ผู้ปฏิบัติงาน:</div>
                                      {remainingWorkers.map((worker, idx) => (
                                        <div key={idx} className="text-black">
                                          • {worker.name}
                                        </div>
                                      ))}
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                        <div className="border-4 border-transparent border-t-gray-200" />
                                        <div className="border-4 border-transparent border-t-white -mt-[9px]" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 relative h-20 lg:h-24 overflow-visible pt-2">
                    <div className="absolute inset-0 grid w-full" style={{ gridTemplateColumns }}>
                      {timeSlots.map((slot, slotIndex) => {
                        const [startTime] = slot.time.split("-")
                        const startColumn = timeToGridColumn(startTime)
                        const endColumn = startColumn + 6

                        const bgColor = slot.period === "lunch" ? "bg-gray-50" : "bg-white"

                        return (
                          <div
                            key={slotIndex}
                            className={`h-full border-r border-gray-600 ${bgColor}`}
                            style={{
                              gridColumnStart: startColumn,
                              gridColumnEnd: endColumn,
                            }}
                          />
                        )
                      })}
                    </div>

                    <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns }}>
                      {/* Phase 2: Smart Display - แสดงตาม hasSteps */}
                      {task.hasSteps && task.steps.length > 0
                        ? (() => {
                            // มี steps: แสดงแท่งแบ่งเป็นส่วนๆ ตาม percentage
                            const { start: taskStart, end: taskEnd } = getGridColumnSpan(task.start_time, task.end_time)
                            const taskDurationMinutes = timeToMinutes(task.end_time) - timeToMinutes(task.start_time)
                            // ใช้สีตาม category ของแต่ละขั้นตอน
                            const stepColors = task.steps.map(step => getStepBackgroundClass(step.process_description, task.color))
                            
                            // Debug: เช็คว่าเวลาเริ่มตรงกัน
                            const calculatedStartMinutes = START_TIME + ((taskStart - 1) * MINUTES_PER_GRID_UNIT)
                            const actualStartMinutes = timeToMinutes(task.start_time)
                            const isStartTimeCorrect = Math.abs(calculatedStartMinutes - actualStartMinutes) < MINUTES_PER_GRID_UNIT
                            
                            // Debug เฉพาะ "กุ้งทอดมัน"
                            if (task.job_name.includes('กุ้งทอดมัน')) {
                              console.log(`🔍 DEBUG กุ้งทอดมัน (Steps):`, {
                                'taskStart': taskStart,
                                'taskEnd': taskEnd,
                                'calculatedStartMinutes': calculatedStartMinutes,
                                'actualStartMinutes': actualStartMinutes,
                                'difference': Math.abs(calculatedStartMinutes - actualStartMinutes),
                                'isStartTimeCorrect': isStartTimeCorrect,
                                'MINUTES_PER_GRID_UNIT': MINUTES_PER_GRID_UNIT
                              })
                            }
                            
                            return (
                              <>
                                
                                {SHOW_START_LABEL && (
                                  <div
                                    className={`absolute top-0 text-[9px] lg:text-[10px] font-mono font-semibold px-1 pointer-events-auto ${
                                      isStartTimeCorrect ? 'text-green-600' : 'text-red-600'
                                    }`}
                                    style={{
                                      gridColumnStart: taskStart,
                                      gridColumnEnd: taskStart + 8,
                                    }}
                                    title={`เวลาตามแผน: ${task.start_time}\nGrid Column: ${taskStart}\nคำนวณได้: ${Math.floor(calculatedStartMinutes / 60)}:${(calculatedStartMinutes % 60).toString().padStart(2, '0')}\nส่วนต่าง: ${Math.abs(calculatedStartMinutes - actualStartMinutes)} นาที\nสถานะ: ${isStartTimeCorrect ? 'ถูกต้อง ✓' : 'ไม่ตรง ✗'}`}
                                  >
                                    {isStartTimeCorrect ? '✓' : '✗'} {task.start_time}
                                  </div>
                                )}
                                
                                {/* Steps: ใช้เวลาเริ่ม + สะสมเวลามาตรฐานของแต่ละขั้นตอน */}
                                {task.steps.map((step, stepIndex) => {
                                  // จำนวนคอลัมน์ของ step (อย่างน้อย 1)
                                  const stepColumns = Math.max(1, Math.ceil(step.estimated_duration_minutes / MINUTES_PER_GRID_UNIT))

                                  // ตำแหน่งเริ่ม/สิ้นสุดของ step ตามคอลัมน์ และ clip ที่ 17:00
                                  const stepStartColumn = taskStart + task.steps.slice(0, stepIndex).reduce((sum, s) => {
                                    return sum + Math.max(1, Math.ceil(s.estimated_duration_minutes / MINUTES_PER_GRID_UNIT))
                                  }, 0)
                                  const unclippedEndColumn = stepStartColumn + stepColumns
                                  const stepEndColumn = Math.min(TOTAL_GRID_COLUMNS + 1, unclippedEndColumn)
                                  
                                  const isLastStep = stepIndex === task.steps.length - 1

                                  return (
                                    <div
                                      key={stepIndex}
                                      className={`my-2 ${stepColors[stepIndex]} rounded flex items-center justify-center px-2 cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:brightness-95 relative pointer-events-auto ${
                                        !isLastStep ? "border-r-2 border-white/50" : ""
                                      }`}
                                      style={{
                                        gridColumnStart: stepStartColumn,
                                        gridColumnEnd: stepEndColumn,
                                      }}
                                      onMouseEnter={() => setHoveredStep({ taskIndex, stepIndex })}
                                      onMouseLeave={() => setHoveredStep(null)}
                                    >
                                      <div className="flex flex-col items-center justify-center text-center w-full min-w-0 overflow-hidden px-0.5">
                                        <span className="text-xs font-semibold text-black leading-tight">
                                          {step.process_number}
                                        </span>
                                        <span className="text-[10px] lg:text-xs text-black leading-tight block overflow-hidden text-ellipsis whitespace-nowrap w-full max-w-full">
                                          {step.process_description.length > 12 ? step.process_description.substring(0, 12) + '...' : step.process_description}
                                        </span>
                                        <span className="text-[10px] text-black/70 leading-tight mt-0.5 whitespace-nowrap">
                                          {formatDuration(step.estimated_duration_minutes)}
                                        </span>
                                      </div>

                                      {hoveredStep?.taskIndex === taskIndex && hoveredStep?.stepIndex === stepIndex && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-black text-sm rounded shadow-lg border border-gray-200 whitespace-nowrap z-50 max-w-xs pointer-events-none">
                                          <div className="font-semibold mb-1">ขั้นตอนที่ {step.process_number}: {step.process_description}</div>
                                          <div className="text-xs text-gray-600">
                                            <div>เวลามาตรฐาน: {formatDuration(step.estimated_duration_minutes)}</div>
                                          </div>
                                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                            <div className="border-4 border-transparent border-t-gray-200" />
                                            <div className="border-4 border-transparent border-t-white -mt-[9px]" />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </>
                            )
                          })()
                        : (() => {
                            // ไม่มี steps: แสดงแท่งปกติ (Phase 1)
                            const { start, end } = getGridColumnSpan(task.start_time, task.end_time)
                            const durationMinutes = timeToMinutes(task.end_time) - timeToMinutes(task.start_time)
                            
                            // เช็คว่างานลงท้ายด้วย (Repack) ให้ใช้สี Pack
                            const isRepackJob = task.job_name.toLowerCase().includes('(repack)')
                            const taskColor = isRepackJob ? 'bg-gray-400' : task.color
                            
                            // Debug: เช็คว่าเวลาเริ่มตรงกัน
                            const calculatedStartMinutes = START_TIME + ((start - 1) * MINUTES_PER_GRID_UNIT)
                            const actualStartMinutes = timeToMinutes(task.start_time)
                            const isStartTimeCorrect = Math.abs(calculatedStartMinutes - actualStartMinutes) < MINUTES_PER_GRID_UNIT
                            
                            // Debug เฉพาะ "กุ้งทอดมัน"
                            if (task.job_name.includes('กุ้งทอดมัน')) {
                              console.log(`🔍 DEBUG กุ้งทอดมัน (No Steps):`, {
                                'start': start,
                                'end': end,
                                'calculatedStartMinutes': calculatedStartMinutes,
                                'actualStartMinutes': actualStartMinutes,
                                'difference': Math.abs(calculatedStartMinutes - actualStartMinutes),
                                'isStartTimeCorrect': isStartTimeCorrect,
                                'MINUTES_PER_GRID_UNIT': MINUTES_PER_GRID_UNIT
                              })
                            }

                            return (
                              <>
                                
                                {SHOW_START_LABEL && (
                                  <div
                                    className={`absolute top-0 text-[9px] lg:text-[10px] font-mono font-semibold px-1 pointer-events-auto ${
                                      isStartTimeCorrect ? 'text-green-600' : 'text-red-600'
                                    }`}
                                    style={{
                                      gridColumnStart: start,
                                      gridColumnEnd: start + 8,
                                    }}
                                    title={`เวลาตามแผน: ${task.start_time}\nGrid Column: ${start}\nคำนวณได้: ${Math.floor(calculatedStartMinutes / 60)}:${(calculatedStartMinutes % 60).toString().padStart(2, '0')}\nส่วนต่าง: ${Math.abs(calculatedStartMinutes - actualStartMinutes)} นาที\nสถานะ: ${isStartTimeCorrect ? 'ถูกต้อง ✓' : 'ไม่ตรง ✗'}`}
                                  >
                                    {isStartTimeCorrect ? '✓' : '✗'} {task.start_time}
                                  </div>
                                )}
                                
                                <div
                                className={`my-2 ${taskColor} rounded flex items-center justify-center px-2 transition-all duration-300 ease-out hover:shadow-lg hover:brightness-95 pointer-events-auto cursor-pointer relative`}
                                  style={{
                                    gridColumnStart: start,
                                    gridColumnEnd: end,
                                  }}
                                  onMouseEnter={() => setHoveredTask(taskIndex)}
                                  onMouseLeave={() => setHoveredTask(null)}
                                >
                                <span className="text-sm lg:text-base font-medium text-black leading-tight">
                                  {(() => {
                                    // คำนวณความกว้างของแท่ง (คอลัมน์)
                                    const barWidth = end - start
                                    const maxChars = Math.floor(barWidth * 2.5) // ประมาณ 2.5 ตัวอักษรต่อคอลัมน์
                                    
                                    if (task.job_name.length > maxChars) {
                                      return `${task.job_name.substring(0, maxChars - 3)}...`
                                    }
                                    return task.job_name
                                  })()}
                                </span>

                                {hoveredTask === taskIndex && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-black text-sm rounded shadow-lg border border-gray-200 whitespace-nowrap z-50 max-w-xs pointer-events-none text-center">
                                    <div className="font-semibold mb-1 text-center">{task.job_name}</div>
                                    <div className="text-black text-center">
                                      ระยะเวลา: {formatDuration(durationMinutes)}
                                    </div>
                                    <div className="text-black text-center">
                                      เวลา: {task.start_time} - {task.end_time}
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                      <div className="border-4 border-transparent border-t-gray-200" />
                                      <div className="border-4 border-transparent border-t-white -mt-[9px]" />
                                    </div>
                                  </div>
                                )}
                                </div>
                              </>
                            )
                          })()}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="border-t border-gray-600 bg-gray-50 p-3 lg:p-4">
          <div className="flex flex-wrap gap-3 lg:gap-4 items-center text-xs lg:text-sm text-black">
            <div className="font-semibold">ชื่องาน :</div>
            {productionTasks.map((task, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-5 lg:w-6 h-3 lg:h-4 rounded ${task.color} border border-gray-600`} />
                <span>{task.job_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTask !== null && productionTasks[selectedTask] && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300 ease-out ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleCloseModal}
        >
          <div
            className={`bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ease-out ${
              isClosing ? "scale-98 opacity-0" : "scale-100 opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-400 p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black">รายละเอียดงานผลิต</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => exportTaskToExcel(selectedTask)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export to Excel
                </button>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Task Name */}
              <div className="flex gap-4">
                {/* Product Image - Left Side */}
                {productionTasks[selectedTask].image && (
                  <div className="flex-shrink-0">
                    <img
                      src={productionTasks[selectedTask].image || "/placeholder.svg"}
                      alt={`ตัวอย่าง ${productionTasks[selectedTask].name}`}
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
                    />
                  </div>
                )}

                {/* Task Info - Right Side */}
                <div className="flex-1">
                  <div className="text-sm font-medium text-black mb-2">ชื่องาน</div>
                  <div className="text-2xl font-bold text-black">{productionTasks[selectedTask].job_name}</div>
                  <div className="text-sm text-black mt-2 font-mono">
                    เวลาทำงาน: {productionTasks[selectedTask].start_time} - {productionTasks[selectedTask].end_time}
                  </div>
                  <div className="text-sm text-black mt-1 font-mono">
                    สถานที่: {productionTasks[selectedTask].location}
                  </div>
                  {productionTasks[selectedTask].status && (
                    <div className="text-sm text-black mt-1 font-mono">
                      สถานะ: <span className={productionTasks[selectedTask].status === 'เสร็จสิ้น' ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>{productionTasks[selectedTask].status}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignees Section */}
              {(() => {
                const allAssignees =
                  productionTasks[selectedTask].assignees ||
                  (productionTasks[selectedTask].assignee ? [productionTasks[selectedTask].assignee!] : [])

                if (allAssignees.length > 0) {
                  return (
                    <div>
                      <div className="text-sm font-medium text-black mb-3">ผู้ปฏิบัติงาน</div>
                      <div className="flex flex-wrap gap-4">
                        {allAssignees.map((assignee, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <img
                              src={assignee.avatar || "/placeholder.svg"}
                              alt={assignee.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-300"
                            />
                            <span className="text-sm text-black font-medium">{assignee.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              })()}

              {/* Process Steps Table - Phase 2 */}
              {productionTasks[selectedTask].hasSteps && productionTasks[selectedTask].steps.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-black mb-3">กระบวนการผลิต (เวลามาตรฐาน)</div>
                  <div className="border border-gray-500 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border-b border-r border-gray-500 px-4 py-3 text-center text-sm font-semibold text-black w-16">
                            ลำดับ
                          </th>
                          <th className="border-b border-r border-gray-500 px-4 py-3 text-center text-sm font-semibold text-black">
                            ชื่อกระบวนการ
                          </th>
                          <th className="border-b border-r border-gray-500 px-4 py-3 text-center text-sm font-semibold text-black w-32">
                            เวลามาตรฐาน
                          </th>
                          <th className="border-b border-r border-gray-500 px-4 py-3 text-center text-sm font-semibold text-black w-32">
                            สัดส่วน
                          </th>
                          <th className="border-b border-gray-500 px-4 py-3 text-center text-sm font-semibold text-black w-32">
                            จำนวนคน
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {productionTasks[selectedTask].steps.map((step) => (
                          <tr key={step.process_number} className="hover:bg-gray-50 transition-colors">
                            <td className="border-b border-r border-gray-500 px-4 py-3 text-center text-sm text-black">
                              {step.process_number}
                            </td>
                            <td className="border-b border-r border-gray-500 px-4 py-3 text-sm text-black">
                              {step.process_description}
                            </td>
                            <td className="border-b border-r border-gray-500 px-4 py-3 text-sm text-black font-mono text-center">
                              {step.estimated_duration_minutes} นาที
                            </td>
                            <td className="border-b border-r border-gray-500 px-4 py-3 text-sm text-black font-mono text-center">
                              {step.percentage.toFixed(1)}%
                            </td>
                            <td className="border-b border-gray-500 px-4 py-3 text-sm text-black font-mono text-center">
                              {step.standard_worker_count} คน
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td
                            colSpan={2}
                            className="border-r border-gray-500 px-4 py-3 text-right text-sm font-semibold text-black"
                          >
                            รวมเวลาทั้งหมด:
                          </td>
                          <td className="border-r border-gray-500 px-4 py-3 text-sm font-semibold text-black font-mono text-center">
                            {formatDuration(
                              productionTasks[selectedTask].steps.reduce((total, step) => total + step.estimated_duration_minutes, 0),
                            )}
                          </td>
                          <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-black font-mono text-center">
                            100.0%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* No steps message */}
              {(!productionTasks[selectedTask].hasSteps || productionTasks[selectedTask].steps.length === 0) && (
                <div className="text-sm text-black italic text-center py-8">ไม่มีรายละเอียดกระบวนการผลิต (เวลามาตรฐาน)</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
