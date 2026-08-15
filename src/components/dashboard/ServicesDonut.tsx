import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { services } from '../../lib/mockDashboardData'

const total = services.reduce((sum, s) => sum + s.value, 0)
const topShare = Math.round((services[0].value / total) * 1000) / 10

export function ServicesDonut() {
  return (
    <div className="w-full shrink-0 rounded-2xl border border-border bg-card p-5 lg:w-64">
      <h3 className="mb-4 text-sm font-medium text-text">Mis Servicios</h3>

      <div className="relative mx-auto h-32 w-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={services}
              dataKey="value"
              innerRadius={42}
              outerRadius={58}
              startAngle={90}
              endAngle={-270}
              paddingAngle={3}
              stroke="none"
            >
              {services.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-text">
          {topShare}%
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {services.map((s) => (
          <li key={s.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-text-soft">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.name}
            </span>
            <span className="text-text-muted">${s.value.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
