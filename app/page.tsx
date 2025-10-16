import ProductionSchedule from "@/components/production-schedule"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="w-full px-2 py-2">
        <div className="mb-2 px-4"></div>
        <ProductionSchedule />
      </div>
    </main>
  )
}
