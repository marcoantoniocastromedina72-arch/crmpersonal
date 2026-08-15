import { LayoutDashboard, CalendarDays, Receipt, FolderKanban, Settings, Wifi, WifiOff, X } from 'lucide-react'
import { NAV_ITEMS, NAV_ITEM_CONFIG, type PageKey } from '../../types/navigation'
import { useCrm } from '../../store/crmStore'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

const icons: Record<PageKey, typeof LayoutDashboard> = {
  inicio: LayoutDashboard,
  agenda: CalendarDays,
  pagos: Receipt,
  proyectos: FolderKanban,
  configuracion: Settings,
}

interface SidebarProps {
  activePage: PageKey
  onNavigate: (page: PageKey) => void
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ activePage, onNavigate, isOpen, onClose }: SidebarProps) {
  const { isOnline } = useCrm()
  const label = !isSupabaseConfigured ? 'Modo local' : isOnline ? 'Conectado' : 'Sin conexión'
  return (
    <>
      {/* Fondo oscuro solo en móvil, cuando el drawer está abierto */}
      {isOpen && (
        <div
          className="absolute inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`absolute inset-y-0 left-0 z-50 flex h-full w-64 flex-col justify-between bg-panel px-4 py-5 transition-transform duration-300 ease-in-out md:static md:z-auto md:w-56 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                IN
              </div>
              <div>
                <p className="text-sm font-medium leading-none text-text">Invitadigital</p>
                <p className="text-[11px] leading-none text-text-muted">CRM Solopreneur</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              title="Cerrar menú"
              className="text-text-muted hover:text-text md:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="mt-8 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <NavButton
                key={item.key}
                label={item.label}
                Icon={icons[item.key]}
                active={activePage === item.key}
                onClick={() => onNavigate(item.key)}
              />
            ))}
          </nav>
        </div>

        <div className="space-y-3">
          <NavButton
            label={NAV_ITEM_CONFIG.label}
            Icon={icons.configuracion}
            active={activePage === 'configuracion'}
            onClick={() => onNavigate('configuracion')}
          />
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-text-muted">
            {isOnline || !isSupabaseConfigured ? (
              <Wifi size={13} className="text-success" />
            ) : (
              <WifiOff size={13} className="text-danger" />
            )}
            {label}
          </div>
        </div>
      </aside>
    </>
  )
}

function NavButton({
  label,
  Icon,
  active,
  onClick,
}: {
  label: string
  Icon: typeof LayoutDashboard
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
        active ? 'bg-white/5 text-white' : 'text-text-muted hover:bg-white/5 hover:text-text-soft'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent-glow" />
      )}
      <Icon size={16} />
      {label}
    </button>
  )
}
