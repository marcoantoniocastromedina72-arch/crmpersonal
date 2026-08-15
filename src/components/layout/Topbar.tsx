import { useEffect, useMemo, useRef, useState } from 'react'
import {
  PanelLeft,
  Menu,
  Star,
  Search,
  Sun,
  Moon,
  History,
  Bell,
  PanelRightOpen,
  PanelRightClose,
  FolderKanban,
  Receipt,
} from 'lucide-react'
import { NAV_ITEMS, NAV_ITEM_CONFIG, type PageKey } from '../../types/navigation'
import { useCrm } from '../../store/crmStore'

interface TopbarProps {
  activePage: PageKey
  onNavigate: (page: PageKey) => void
  isRightPanelOpen: boolean
  onToggleRightPanel: () => void
  onOpenSidebar: () => void
}

const ALL_ITEMS = [...NAV_ITEMS, NAV_ITEM_CONFIG]

// Quita acentos/diacríticos para que "maria" encuentre "María".
function normalize(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function Topbar({ activePage, onNavigate, isRightPanelOpen, onToggleRightPanel, onOpenSidebar }: TopbarProps) {
  const current = ALL_ITEMS.find((i) => i.key === activePage)?.label ?? 'Inicio'
  const { proyectos, notasPago } = useCrm()

  const [isDark, setIsDark] = useState(true)
  const [query, setQuery] = useState('')
  const [isResultsOpen, setIsResultsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // Cierra el dropdown de resultados al hacer clic fuera o al presionar Escape.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsResultsOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsResultsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const q = normalize(query.trim())

  const results = useMemo(() => {
    if (!q) return { matchedProyectos: [], matchedNotas: [] }
    return {
      matchedProyectos: proyectos
        .filter((p) => normalize(p.nombre).includes(q) || normalize(p.cliente).includes(q))
        .slice(0, 4),
      matchedNotas: notasPago
        .filter((n) => normalize(n.cliente).includes(q) || normalize(n.concepto).includes(q))
        .slice(0, 4),
    }
  }, [q, proyectos, notasPago])

  const hasResults = results.matchedProyectos.length > 0 || results.matchedNotas.length > 0

  const goToProyecto = () => {
    onNavigate('proyectos')
    setQuery('')
    setIsResultsOpen(false)
  }

  const goToNota = () => {
    onNavigate('pagos')
    setQuery('')
    setIsResultsOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!q) return
    if (results.matchedProyectos.length > 0) goToProyecto()
    else if (results.matchedNotas.length > 0) goToNota()
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-y-2 bg-panel px-3 py-2.5 sm:px-5 sm:py-3">
      <div className="flex min-w-0 items-center gap-2 text-sm text-text-muted sm:gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          title="Abrir menú"
          className="text-text-muted hover:text-text md:hidden"
        >
          <Menu size={18} />
        </button>
        <PanelLeft size={16} className="hidden md:block" />
        <Star size={16} className="hidden sm:block" />
        <span className="hidden sm:inline">Dashboards</span>
        <span className="hidden text-text-muted/50 sm:inline">/</span>
        <span className="truncate text-text">{current}</span>
      </div>

      <div className="flex w-full items-center gap-3 sm:w-auto">
        <div ref={containerRef} className="relative min-w-0 flex-1 sm:flex-none">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-text-muted"
          >
            <Search size={14} className="shrink-0" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsResultsOpen(true)
              }}
              onFocus={() => query && setIsResultsOpen(true)}
              placeholder="Buscar cliente o proyecto..."
              className="w-full min-w-0 bg-transparent text-text placeholder:text-text-muted focus:outline-none sm:w-40 md:w-56"
            />
            <kbd className="hidden shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] sm:inline">⌘/</kbd>
          </form>

          {isResultsOpen && q && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-xl sm:left-auto sm:w-72">
              {!hasResults && (
                <p className="px-2 py-3 text-center text-xs text-text-muted">
                  Sin resultados para "{query}"
                </p>
              )}

              {results.matchedProyectos.length > 0 && (
                <div className="mb-1">
                  <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                    Proyectos
                  </p>
                  {results.matchedProyectos.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={goToProyecto}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-text-soft hover:bg-white/5"
                    >
                      <FolderKanban size={13} className="shrink-0 text-text-muted" />
                      <span className="min-w-0 flex-1 truncate">{p.nombre}</span>
                      <span className="shrink-0 text-[11px] text-text-muted">{p.cliente}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.matchedNotas.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                    Notas de pago
                  </p>
                  {results.matchedNotas.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={goToNota}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-text-soft hover:bg-white/5"
                    >
                      <Receipt size={13} className="shrink-0 text-text-muted" />
                      <span className="min-w-0 flex-1 truncate">{n.concepto}</span>
                      <span className="shrink-0 text-[11px] text-text-muted">{n.cliente}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3 text-text-muted">
          <button
            type="button"
            onClick={() => setIsDark((v) => !v)}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="hover:text-text"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            title="Recargar"
            className="hidden hover:text-text sm:block"
          >
            <History size={16} />
          </button>

          <button
            type="button"
            onClick={onToggleRightPanel}
            title={isRightPanelOpen ? 'Ocultar notificaciones' : 'Mostrar notificaciones'}
            className="hover:text-text"
          >
            <Bell size={16} />
          </button>

          <button
            type="button"
            onClick={onToggleRightPanel}
            title={isRightPanelOpen ? 'Ocultar panel lateral' : 'Mostrar panel lateral'}
            className="hidden hover:text-text sm:block"
          >
            {isRightPanelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </button>
        </div>
      </div>
    </header>
  )
}
