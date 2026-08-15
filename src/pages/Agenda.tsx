import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { useCrm } from '../store/crmStore'
import type { Proyecto, ProyectoEstado } from '../types/crm'

const estadoTone: Record<ProyectoEstado, 'gray' | 'blue' | 'purple' | 'red' | 'green'> = {
  Pendiente: 'gray',
  'En proceso': 'blue',
  'En revisión': 'purple',
  'Cambios solicitados': 'red',
  Listo: 'green',
  Entregado: 'green',
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function Agenda() {
  const { proyectos } = useCrm()
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  // Cada entrega de proyecto se muestra automáticamente aquí: no hay datos
  // duplicados, la Agenda simplemente "lee" el mismo array de proyectos.
  const eventosPorDia = useMemo(() => {
    const map = new Map<number, Proyecto[]>()
    for (const p of proyectos) {
      const d = new Date(p.fechaEntrega + 'T00:00:00')
      if (d.getFullYear() === cursor.year && d.getMonth() === cursor.month) {
        const day = d.getDate()
        map.set(day, [...(map.get(day) ?? []), p])
      }
    }
    return map
  }, [proyectos, cursor])

  const proximosEventos = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return [...proyectos]
      .filter((p) => new Date(p.fechaEntrega + 'T00:00:00') >= hoy)
      .sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega))
      .slice(0, 6)
  }, [proyectos])

  const { firstWeekday, daysInMonth } = getMonthInfo(cursor.year, cursor.month)

  const goPrev = () =>
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))
  const goNext = () =>
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))

  return (
    <div className="min-w-0 flex-1 space-y-5 overflow-y-auto bg-bg p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-medium text-text">Agenda</h1>
        <div className="flex items-center gap-3 rounded-lg border border-border px-2 py-1">
          <button onClick={goPrev} className="text-text-muted hover:text-text">
            <ChevronLeft size={16} />
          </button>
          <span className="w-28 text-center text-sm text-text sm:w-32">
            {MESES[cursor.month]} {cursor.year}
          </span>
          <button onClick={goNext} className="text-text-muted hover:text-text">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 sm:p-5">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-text-muted sm:text-[11px]">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
            <div key={d} className="pb-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const eventos = eventosPorDia.get(day) ?? []
            return (
              <div
                key={day}
                className="flex min-h-[48px] flex-col gap-1 rounded-lg border border-border/60 p-1 sm:min-h-[64px] sm:p-1.5"
              >
                <span className="text-[10px] text-text-muted sm:text-[11px]">{day}</span>
                {eventos.slice(0, 2).map((p) => (
                  <span
                    key={p.id}
                    className="hidden truncate rounded bg-accent-glow/15 px-1 py-0.5 text-[10px] text-[#c084fc] sm:block"
                    title={p.nombre}
                  >
                    {p.nombre}
                  </span>
                ))}
                {eventos.length > 0 && (
                  <span
                    className="block h-1.5 w-1.5 rounded-full bg-accent-glow sm:hidden"
                    title={`${eventos.length} entrega(s)`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h3 className="mb-4 text-sm font-medium text-text">Próximas entregas</h3>
        {proximosEventos.length === 0 ? (
          <p className="text-sm text-text-muted">No tienes entregas próximas.</p>
        ) : (
          <ul className="space-y-3">
            {proximosEventos.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-2 rounded-lg border border-border/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-text">{p.nombre}</p>
                  <p className="text-xs text-text-muted">{p.cliente} · {formatDate(p.fechaEntrega)}</p>
                </div>
                <Badge label={p.estado} tone={estadoTone[p.estado]} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function getMonthInfo(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { firstWeekday, daysInMonth }
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}
