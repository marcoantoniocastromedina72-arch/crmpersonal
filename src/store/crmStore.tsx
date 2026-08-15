import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, seedIfEmpty } from '../lib/db'
import { syncNow } from '../lib/sync'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { useAuth } from './authStore'
import type { Proyecto, NotaPago } from '../types/crm'
import type { Miembro, Rol } from '../types/team'

interface CrmContextValue {
  ready: boolean
  proyectos: Proyecto[]
  notasPago: NotaPago[]
  miembros: Miembro[]
  currentRol: Rol
  isOnline: boolean
  isSyncing: boolean
  lastSyncedAt: Date | null
  addProyecto: (p: Omit<Proyecto, 'id' | 'updatedAt' | 'dirty' | 'deleted'>) => Promise<void>
  updateProyecto: (id: string, p: Omit<Proyecto, 'id' | 'updatedAt' | 'dirty' | 'deleted'>) => Promise<void>
  deleteProyecto: (id: string) => Promise<void>
  addNotaPago: (n: Omit<NotaPago, 'id' | 'updatedAt' | 'dirty' | 'deleted'>) => Promise<void>
  updateNotaPago: (id: string, n: Omit<NotaPago, 'id' | 'updatedAt' | 'dirty' | 'deleted'>) => Promise<void>
  deleteNotaPago: (id: string) => Promise<void>
  addMiembro: (m: Omit<Miembro, 'id' | 'updatedAt' | 'dirty' | 'deleted'>) => Promise<void>
  updateMiembro: (id: string, m: Omit<Miembro, 'id' | 'updatedAt' | 'dirty' | 'deleted'>) => Promise<void>
  deleteMiembro: (id: string) => Promise<void>
  syncManual: () => Promise<void>
}

const CrmContext = createContext<CrmContextValue | null>(null)

function newId() {
  return crypto.randomUUID()
}

const nowIso = () => new Date().toISOString()

export function CrmProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const ownerId = session?.user.id ?? null

  const [ready, setReady] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  useEffect(() => {
    seedIfEmpty().then(() => setReady(true))
  }, [])

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const runSync = async () => {
    if (!isSupabaseConfigured || !ownerId || !navigator.onLine) return
    setIsSyncing(true)
    try {
      await syncNow(ownerId)
      setLastSyncedAt(new Date())
    } finally {
      setIsSyncing(false)
    }
  }

  // Sincroniza al iniciar sesión, al reconectar, y cada 2 minutos mientras
  // haya conexión (suficiente para un CRM solopreneur, sin saturar Supabase).
  useEffect(() => {
    if (!ready || !ownerId) return
    runSync()
    const onReconnect = () => runSync()
    window.addEventListener('online', onReconnect)
    const interval = setInterval(runSync, 2 * 60 * 1000)
    return () => {
      window.removeEventListener('online', onReconnect)
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, ownerId])

  const proyectosRaw = useLiveQuery(() => db.proyectos.filter((p) => !p.deleted).toArray(), [], [])
  const notasPagoRaw = useLiveQuery(() => db.notasPago.filter((n) => !n.deleted).toArray(), [], [])
  const miembrosRaw = useLiveQuery(() => db.miembros.filter((m) => !m.deleted).toArray(), [], [])

  const proyectos = useMemo(
    () => [...(proyectosRaw ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [proyectosRaw],
  )
  const notasPago = useMemo(
    () => [...(notasPagoRaw ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [notasPagoRaw],
  )
  const miembros = useMemo(() => miembrosRaw ?? [], [miembrosRaw])

  // Mientras solo tú uses la app, tu rol siempre es "owner". Cuando agregues
  // más miembros/agentes reales con su propio login, esto se resuelve
  // buscando al miembro cuyo email coincide con session.user.email.
  const currentRol: Rol = useMemo(() => {
    const me = miembros.find((m) => m.email && m.email === session?.user.email)
    return me?.rol ?? 'owner'
  }, [miembros, session])

  const addProyecto: CrmContextValue['addProyecto'] = async (p) => {
    await db.proyectos.add({ ...p, id: newId(), updatedAt: nowIso(), dirty: true, deleted: false })
    runSync()
  }

  const updateProyecto: CrmContextValue['updateProyecto'] = async (id, p) => {
    await db.proyectos.update(id, { ...p, updatedAt: nowIso(), dirty: true })
    runSync()
  }

  const deleteProyecto: CrmContextValue['deleteProyecto'] = async (id) => {
    await db.proyectos.update(id, { deleted: true, dirty: true, updatedAt: nowIso() })
    runSync()
  }

  const addNotaPago: CrmContextValue['addNotaPago'] = async (n) => {
    await db.notasPago.add({ ...n, id: newId(), updatedAt: nowIso(), dirty: true, deleted: false })
    runSync()
  }

  const updateNotaPago: CrmContextValue['updateNotaPago'] = async (id, n) => {
    await db.notasPago.update(id, { ...n, updatedAt: nowIso(), dirty: true })
    runSync()
  }

  const deleteNotaPago: CrmContextValue['deleteNotaPago'] = async (id) => {
    await db.notasPago.update(id, { deleted: true, dirty: true, updatedAt: nowIso() })
    runSync()
  }

  const addMiembro: CrmContextValue['addMiembro'] = async (m) => {
    await db.miembros.add({ ...m, id: newId(), updatedAt: nowIso(), dirty: true, deleted: false })
    runSync()
  }

  const updateMiembro: CrmContextValue['updateMiembro'] = async (id, m) => {
    await db.miembros.update(id, { ...m, updatedAt: nowIso(), dirty: true })
    runSync()
  }

  const deleteMiembro: CrmContextValue['deleteMiembro'] = async (id) => {
    await db.miembros.update(id, { deleted: true, dirty: true, updatedAt: nowIso() })
    runSync()
  }

  const value: CrmContextValue = {
    ready,
    proyectos,
    notasPago,
    miembros,
    currentRol,
    isOnline,
    isSyncing,
    lastSyncedAt,
    addProyecto,
    updateProyecto,
    deleteProyecto,
    addNotaPago,
    updateNotaPago,
    deleteNotaPago,
    addMiembro,
    updateMiembro,
    deleteMiembro,
    syncManual: runSync,
  }

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>
}

export function useCrm() {
  const ctx = useContext(CrmContext)
  if (!ctx) throw new Error('useCrm debe usarse dentro de <CrmProvider>')
  return ctx
}
