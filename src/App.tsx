import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { RightPanel } from './components/layout/RightPanel'
import { LoginScreen } from './components/auth/LoginScreen'
import { Dashboard } from './pages/Dashboard'
import { Agenda } from './pages/Agenda'
import { NotasDePago } from './pages/NotasDePago'
import { Proyectos } from './pages/Proyectos'
import { Configuracion } from './pages/Configuracion'
import { CrmProvider } from './store/crmStore'
import { AuthProvider, useAuth } from './store/authStore'
import { isSupabaseConfigured } from './lib/supabaseClient'
import type { PageKey } from './types/navigation'

const pages: Record<PageKey, React.ComponentType> = {
  inicio: Dashboard,
  agenda: Agenda,
  pagos: NotasDePago,
  proyectos: Proyectos,
  configuracion: Configuracion,
}

function AppShell() {
  const [activePage, setActivePage] = useState<PageKey>('inicio')
  // En escritorio el panel de notificaciones inicia abierto (empuja el layout);
  // en móvil/tablet inicia cerrado para no tapar el contenido al cargar.
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768,
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const ActivePageComponent = pages[activePage]

  const handleNavigate = (page: PageKey) => {
    setActivePage(page)
    setIsSidebarOpen(false)
  }

  return (
    <CrmProvider>
      <div className="flex min-h-svh items-center justify-center bg-[#1f1f23] p-0 sm:p-4 lg:p-6">
        <div className="relative flex h-svh w-full max-w-[1400px] overflow-hidden rounded-none border-0 sm:h-[calc(100svh-2rem)] sm:rounded-2xl sm:border-2 sm:border-accent-glow sm:shadow-[0_0_40px_rgba(153,51,255,0.25)] lg:h-[calc(100svh-3rem)]">
          <Sidebar
            activePage={activePage}
            onNavigate={handleNavigate}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden md:border-l md:border-border">
            <Topbar
              activePage={activePage}
              onNavigate={setActivePage}
              isRightPanelOpen={isRightPanelOpen}
              onToggleRightPanel={() => setIsRightPanelOpen((v) => !v)}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
            <div className="relative flex flex-1 overflow-hidden">
              <ActivePageComponent />
              <RightPanel isOpen={isRightPanelOpen} onClose={() => setIsRightPanelOpen(false)} />
            </div>
          </div>
        </div>
      </div>
    </CrmProvider>
  )
}

function Gate() {
  const { session, loading } = useAuth()

  // Sin Supabase configurado -> modo 100% local, sin exigir login.
  if (!isSupabaseConfigured) return <AppShell />

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#1f1f23] text-sm text-text-muted">
        Cargando...
      </div>
    )
  }

  if (!session) return <LoginScreen />

  return <AppShell />
}

function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}

export default App
