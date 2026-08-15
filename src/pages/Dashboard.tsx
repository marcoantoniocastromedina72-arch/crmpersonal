import { KpiCard } from '../components/ui/KpiCard'
import { RevenueBarChart } from '../components/dashboard/RevenueBarChart'
import { SalesFlowChart } from '../components/dashboard/SalesFlowChart'
import { ProjectsTable } from '../components/dashboard/ProjectsTable'
import { ServicesDonut } from '../components/dashboard/ServicesDonut'
import { kpis } from '../lib/mockDashboardData'

export function Dashboard() {
  return (
    <div className="min-w-0 flex-1 space-y-5 overflow-y-auto bg-bg p-4 sm:p-5">
      <h1 className="text-lg font-medium text-text">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="grid grid-cols-2 gap-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>
        <RevenueBarChart />
      </div>

      <SalesFlowChart />

      <div className="flex flex-col gap-4 lg:flex-row">
        <ProjectsTable />
        <ServicesDonut />
      </div>
    </div>
  )
}
