import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { monthlyRevenue } from '../../lib/mockDashboardData'

export function RevenueBarChart() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-text">Ingresos por Mes</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={monthlyRevenue} barGap={4}>
          <CartesianGrid vertical={false} stroke="#22222c" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#8b8b96', fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}M`}
            tick={{ fill: '#8b8b96', fontSize: 11 }}
            width={32}
          />
          <Bar dataKey="recibido" fill="#a9c9f5" radius={[4, 4, 0, 0]} maxBarSize={14} />
          <Bar dataKey="pendiente" fill="#5b6478" radius={[4, 4, 0, 0]} maxBarSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
