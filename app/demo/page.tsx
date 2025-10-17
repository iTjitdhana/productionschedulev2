import { ProductionScheduleDemo } from "../../components/production-schedule-demo"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Demo - Production Schedule (New Version)</h1>
          <p className="text-gray-600">
            หน้านี้เป็นการทดสอบระบบใหม่ที่แสดงงานที่มีปัญหาเป็นสีเทาพร้อมไอคอน ⚠️
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>หมายเหตุ:</strong> งานที่ไม่มีเวลาเริ่มต้น/สิ้นสุด จะแสดงเป็นสีเทาแทนการแสดงแท่งยาวเต็มวัน
            </p>
          </div>
        </div>
        <ProductionScheduleDemo />
      </div>
    </div>
  )
}
