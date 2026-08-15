import { Bug, UserPlus, Bell as BellIcon, Mail, GitCommit, CheckCircle2 } from 'lucide-react'
import { notifications, activities, contacts } from '../../lib/mockDashboardData'

const notifIcons = [Bug, UserPlus, BellIcon, Mail]
const activityIcons = [Bug, GitCommit, CheckCircle2, GitCommit, Bug]

const statusColor: Record<string, string> = {
  online: 'bg-success',
  busy: 'bg-danger',
  offline: 'bg-text-muted',
}

interface RightPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function RightPanel({ isOpen, onClose }: RightPanelProps) {
  return (
    <>
      {/* Fondo oscuro solo en móvil/tablet, cuando el panel está abierto como overlay */}
      {isOpen && (
        <div
          className="absolute inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`absolute inset-y-0 right-0 z-40 w-72 overflow-hidden bg-panel transition-transform duration-300 ease-in-out md:static md:z-auto md:transition-all ${
          isOpen ? 'translate-x-0 px-5 py-5' : 'translate-x-full'
        } ${isOpen ? 'md:w-72 md:translate-x-0 md:px-5 md:py-5 md:opacity-100' : 'md:w-0 md:px-0 md:py-0 md:opacity-0'}`}
      >
        <div className="h-full w-64 space-y-6 overflow-y-auto sm:w-64 md:w-64">
          <section>
            <h3 className="mb-3 text-sm font-medium text-text">Notificaciones</h3>
            <ul className="space-y-3">
              {notifications.map((n, i) => {
                const Icon = notifIcons[i % notifIcons.length]
                return (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-text-muted">
                      <Icon size={12} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs text-text-soft">{n.text}</p>
                      <p className="text-[11px] text-text-muted">{n.time}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-medium text-text">Actividad</h3>
            <ul className="space-y-3">
              {activities.map((a, i) => {
                const Icon = activityIcons[i % activityIcons.length]
                return (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-text-muted">
                      <Icon size={12} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs text-text-soft">{a.text}</p>
                      <p className="text-[11px] text-text-muted">{a.time}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-medium text-text">Contactos</h3>
            <ul className="space-y-3">
              {contacts.map((c) => (
                <li key={c.name} className="flex items-center gap-2.5">
                  <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] text-text">
                    {c.name.split(' ').map((n) => n[0]).join('')}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-1 ring-panel ${statusColor[c.status]}`}
                    />
                  </div>
                  <span className="text-xs text-text-soft">{c.name}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </>
  )
}
