"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, startOfDay, addDays } from "date-fns"
import { th } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Clock, MapPin, Users, AlertTriangle } from "lucide-react"
import { getWorkPlans } from "@/lib/api"
import { WorkPlanResponse } from "@/types"

// Types
interface Assignee {
  id_code: string
  name: string
  avatar?: string
}

interface ProductionTask {
  id: number
  job_code: string
  job_name: string
  name: string
  startTime: string
  endTime: string
  start_time: string
  end_time: string
  color: string
  location: string
  image: string
  status: string
  notes: string
  assignees: Assignee[]
  hasSteps: boolean
  steps: any[]
  taskStatus?: {
    type: 'normal' | 'warning' | 'error'
    color: string
    icon: string
    issues: string[]
    message: string
  }
  hasIssues?: boolean
}

// Constants
const COLOR_PALETTE = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
]

const START_TIME = 480 // 8:00 AM in minutes
const END_TIME = 1020 // 5:00 PM in minutes
const MINUTES_PER_GRID_UNIT = 30 // 30 minutes per grid unit

// Helper functions
function getAvatar(idCode: string): string {
  const avatars = [
    "/images/a.jpg", "/images/arm.jpg", "/images/jack.jpg", "/images/jaran.jpeg",
    "/images/man.jpg", "/images/ole.jpg", "/images/pa.jpg", "/images/sam.jpg",
    "/images/tun.jpg", "/images/ya-noi.jpg"
  ]
  const index = idCode.charCodeAt(0) % avatars.length
  return avatars[index]
}

function getProductImage(jobName: string): string {
  const images = [
    "/crispy-pork-belly-golden-brown.jpg",
    "/dry-goods-and-packaged-ingredients.jpg",
    "/fresh-ingredients-and-meat.jpg",
    "/fresh-lime-juice-in-bottles.jpg",
    "/fresh-vegetables-in-kitchen.jpg",
    "/fried-catfish-crispy-golden.jpg",
    "/fried-rice-sauce-in-bottles.jpg",
    "/measuring-and-mixing-ingredients.jpg",
    "/orange-curry-sauce-in-pot.jpg",
    "/peanut-satay-sauce-in-bowl.jpg",
    "/prepared-vegetables-ready-to-cook.jpg"
  ]
  const index = jobName.charCodeAt(0) % images.length
  return images[index]
}

function timeToGridColumn(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  const totalMinutes = hours * 60 + minutes
  const minutesFromStart = totalMinutes - START_TIME
  return Math.floor(minutesFromStart / MINUTES_PER_GRID_UNIT) + 1
}

function timeToMinutes(time: string): number {
  if (!time) return 480 // Default to 8:00 AM if no time
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function getGridColumnSpan(startTime: string, endTime: string): { start: number; end: number } {
  // Handle null times
  const safeStartTime = startTime || "08:00"
  const safeEndTime = endTime || "17:00"
  
  const startColumn = timeToGridColumn(safeStartTime)
  const endMinutes = timeToMinutes(safeEndTime)
  const endMinutesFromStart = endMinutes - START_TIME
  const endColumn = Math.ceil(endMinutesFromStart / MINUTES_PER_GRID_UNIT) + 1
  return { start: startColumn, end: endColumn }
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

function getTaskStatus(task: any) {
  const issues = getTaskIssues(task)
  
  if (issues.length === 0) {
    return { type: 'normal', color: 'green', icon: '✅' }
  }
  
  return { 
    type: 'warning', 
    color: 'gray', 
    icon: '⚠️',
    issues: issues,
    message: issues.join(", ")
  }
}

// API mapping function
function mapAPIDataToTask(apiData: WorkPlanResponse, index: number): ProductionTask {
  const assignees = apiData.assignees.map(a => ({
    name: a.name,
    avatar: getAvatar(a.id_code),
  }))

  // เช็คสถานะงาน
  const taskStatus = getTaskStatus(apiData)
  
  // ถ้ามีปัญหา ใช้ค่าเริ่มต้น
  const startTime = apiData.start_time || "08:00"
  const endTime = apiData.end_time || "17:00"

  return {
    id: apiData.id,
    job_code: apiData.job_code,
    job_name: apiData.job_name,
    name: apiData.job_name,
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
    hasSteps: apiData.hasSteps || false,
    steps: apiData.steps || [],
    // เพิ่มข้อมูลสถานะ
    taskStatus: taskStatus,
    hasIssues: taskStatus.type === 'warning'
  }
}

// Main component
export function ProductionScheduleDemo() {
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<ProductionTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch tasks
  const fetchTasks = async (date: Date) => {
    setLoading(true)
    setError(null)
    
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const response = await getWorkPlans(dateStr)
      
      if (response.success) {
        const mappedTasks = response.data.map((workPlan, index) => 
          mapAPIDataToTask(workPlan, index)
        )
        setTasks(mappedTasks)
      } else {
        setError(response.message || 'ไม่สามารถโหลดข้อมูลได้')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ API')
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load tasks when date changes
  useEffect(() => {
    fetchTasks(selectedDate)
  }, [selectedDate])

  // Generate time slots
  const timeSlots = []
  for (let hour = 8; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(timeStr)
    }
  }

  // Separate tasks
  const normalTasks = tasks.filter(task => !task.hasIssues)
  const problemTasks = tasks.filter(task => task.hasIssues)

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">ตารางการผลิต</CardTitle>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  วันก่อน
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  วันนี้
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                >
                  วันถัดไป
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={th}
                className="rounded-md border"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: th })}
                </h2>
                <p className="text-sm text-gray-600">
                  จำนวนงานทั้งหมด: {tasks.length} งาน
                  {problemTasks.length > 0 && (
                    <span className="ml-2 text-orange-600">
                      (มีปัญหา: {problemTasks.length} งาน)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading/Error States */}
        {loading && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-red-600">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks with Issues */}
        {problemTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-orange-600 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                งานที่ต้องจัดการ ({problemTasks.length} งาน)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {problemTasks.map((task) => (
                  <div key={task.id} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center cursor-help">
                              <span className="text-lg mr-2">⚠️</span>
                              <h3 className="font-medium text-gray-700">{task.name}</h3>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{task.taskStatus?.message}</p>
                          </TooltipContent>
                        </Tooltip>
                        <div className="mt-2 text-sm text-gray-600">
                          <p><strong>รหัสงาน:</strong> {task.job_code}</p>
                          <p><strong>สถานะ:</strong> {task.status}</p>
                          {task.location && <p><strong>สถานที่:</strong> {task.location}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.assignees.map((assignee, index) => (
                          <Avatar key={index} className="h-8 w-8">
                            <AvatarImage src={assignee.avatar} />
                            <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Normal Tasks */}
        {normalTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">งานปกติ ({normalTasks.length} งาน)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {normalTasks.map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{task.name}</h3>
                        <div className="mt-2 text-sm text-gray-600">
                          <p><strong>รหัสงาน:</strong> {task.job_code}</p>
                          <p><strong>เวลา:</strong> {task.startTime} - {task.endTime}</p>
                          <p><strong>สถานะ:</strong> {task.status}</p>
                          {task.location && <p><strong>สถานที่:</strong> {task.location}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.assignees.map((assignee, index) => (
                          <Avatar key={index} className="h-8 w-8">
                            <AvatarImage src={assignee.avatar} />
                            <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Tasks */}
        {!loading && !error && tasks.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-600">
                <p>ไม่มีงานในวันนี้</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
