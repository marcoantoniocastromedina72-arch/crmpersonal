import { urgentProjects } from '../../lib/mockDashboardData'

const statusStyles: Record<string, string> = {
  Revisión: 'text-[#c084fc]',
  Desarrollo: 'text-[#60a5fa]',
  Pendiente: 'text-[#eab308]',
  Cambios: 'text-[#f87171]',
  Listo: 'text-[#4ade80]',
}

export function ProjectsTable() {
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-text">Proyectos Urgentes</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-text-muted">
              <th className="pb-3 font-normal">Cliente</th>
              <th className="pb-3 font-normal">Proyecto</th>
              <th className="pb-3 font-normal">Entrega</th>
              <th className="pb-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {urgentProjects.map((p) => (
              <tr key={p.client + p.project} className="border-t border-border/60">
                <td className="py-3 text-sm text-text">{p.client}</td>
                <td className="py-3 text-sm text-text-soft">{p.project}</td>
                <td className="py-3 text-sm text-text-soft">{p.delivery}</td>
                <td className={`py-3 text-sm font-medium ${statusStyles[p.status] ?? 'text-text-soft'}`}>
                  {p.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
