import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { salesFlow } from '../../lib/mockDashboardData'

export function SalesFlowChart() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-5">
        <h3 className="text-sm font-medium text-text">Flujo de Ventas</h3>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <span className="h-2 w-2 rounded-full bg-[#a9c9f5]" /> Páginas Web
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <span className="h-2 w-2 rounded-full bg-[#a9c9f5]" /> Invitaciones
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={salesFlow}>
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
          <Line type="monotone" dataKey="web" stroke="#a9c9f5" strokeWidth={2} dot={false} />
          <Line
            type="monotone"
            dataKey="invitaciones"
            stroke="#e4e4e6"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
