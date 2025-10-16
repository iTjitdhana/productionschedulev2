'use client'

import * as React from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface SimpleDatePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

// Thai month names
const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

// Thai day names
const THAI_DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

// Convert AD year to Buddhist Era (BE)
const toBuddhistEra = (year: number): number => year + 543

// Convert BE year to AD
const toAD = (year: number): number => year - 543

// Format date to Thai format
const formatThaiDate = (date: Date): string => {
  const day = date.getDate()
  const month = THAI_MONTHS[date.getMonth()]
  const year = toBuddhistEra(date.getFullYear())
  return `${day} ${month} ${year}`
}

// Get today's date
const getToday = (): Date => new Date()

// Get yesterday's date
const getYesterday = (): Date => {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date
}

// Get tomorrow's date
const getTomorrow = (): Date => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date
}

// Get first day of month
const getFirstDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

// Get last day of month
const getLastDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

// Get days in month
const getDaysInMonth = (date: Date): number => {
  return getLastDayOfMonth(date).getDate()
}

// Get calendar days (including previous/next month days)
const getCalendarDays = (date: Date): (Date | null)[] => {
  const firstDay = getFirstDayOfMonth(date)
  const lastDay = getLastDayOfMonth(date)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = getDaysInMonth(date)
  
  const days: (Date | null)[] = []
  
  // Add previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(firstDay)
    prevDate.setDate(prevDate.getDate() - (i + 1))
    days.push(prevDate)
  }
  
  // Add current month days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(date.getFullYear(), date.getMonth(), day))
  }
  
  // Add next month days to fill the grid
  const remainingDays = 42 - days.length // 6 weeks * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, day)
    days.push(nextDate)
  }
  
  return days
}

export function SimpleDatePicker({
  value,
  onChange,
  placeholder = "เลือกวันที่",
  className,
  disabled = false
}: SimpleDatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(value || getToday())
  
  const handleDateSelect = (date: Date) => {
    onChange?.(date)
    setOpen(false)
  }
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }
  
  const handleQuickSelect = (date: Date) => {
    handleDateSelect(date)
  }
  
  const calendarDays = getCalendarDays(currentMonth)
  const today = getToday()
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {value ? formatThaiDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              {THAI_MONTHS[currentMonth.getMonth()]} {toBuddhistEra(currentMonth.getFullYear())}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {THAI_DAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) return <div key={index} />
              
              const isToday = day.toDateString() === today.toDateString()
              const isSelected = value && day.toDateString() === value.toDateString()
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
              
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-xs",
                    !isCurrentMonth && "text-muted-foreground",
                    isToday && "bg-accent text-accent-foreground",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                  onClick={() => handleDateSelect(day)}
                >
                  {day.getDate()}
                </Button>
              )
            })}
          </div>
          
          {/* Quick select buttons */}
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleQuickSelect(getYesterday())}
            >
              เมื่อวาน
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleQuickSelect(getToday())}
            >
              วันนี้
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleQuickSelect(getTomorrow())}
            >
              พรุ่งนี้
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
