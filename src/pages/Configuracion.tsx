import { useState } from 'react'
import { Plus, Trash2, RefreshCw, LogOut, Bot, User } from 'lucide-react'
import { Toggle } from '../components/ui/Toggle'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useCrm } from '../store/crmStore'
import { useAuth } from '../store/authStore'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { PERMISOS, type Rol, type TipoMiembro } from '../types/team'

type Tab = 'perfil' | 'equipo' | 'seguridad' | 'preferencias'

const tabs: { key: Tab; label: string }[] = [
  { key: 'perfil', label: 'Perfil' },
  { key: 'equipo', label: 'Equipo y roles' },
  { key: 'seguridad', label: 'Seguridad' },
  { key: 'preferencias', label: 'Preferencias del CRM' },
]

export function Configuracion() {
  const [tab, setTab] = useState<Tab>('perfil')

  return (
    <div className="min-w-0 flex-1 space-y-5 overflow-y-auto bg-bg p-4 sm:p-5">
      <h1 className="text-lg font-medium text-text">Configuración</h1>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors sm:flex-1 ${
              tab === t.key ? 'bg-white/10 text-text' : 'text-text-muted hover:text-text-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        {tab === 'perfil' && <PerfilTab />}
        {tab === 'equipo' && <EquipoTab />}
        {tab === 'seguridad' && <SeguridadTab />}
        {tab === 'preferencias' && <PreferenciasTab />}
      </div>
    </div>
  )
}

function PerfilTab() {
  const { session } = useAuth()
  return (
    <div className="max-w-md space-y-3">
      <Field label="Nombre">
        <input className="input" defaultValue="Marco" />
      </Field>
      <Field label="Correo">
        <input className="input" type="email" value={session?.user.email ?? 'Modo local (sin login)'} readOnly />
      </Field>
      <Field label="Negocio">
        <input className="input" defaultValue="Invitadigital" />
      </Field>
      <Button>Guardar cambios</Button>
    </div>
  )
}

const rolLabel: Record<Rol, string> = {
  owner: 'Owner',
  colaborador: 'Colaborador',
  agente_ia: 'Agente IA',
}

const emptyForm = {
  nombre: '',
  email: '',
  tipo: 'agente_ia' as TipoMiembro,
  rol: 'agente_ia' as Rol,
  descripcion: '',
}

function EquipoTab() {
  const { miembros, addMiembro, deleteMiembro, currentRol } = useCrm()
  const permisos = PERMISOS[currentRol]

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    await addMiembro({
      nombre: form.nombre.trim(),
      email: form.email.trim() || undefined,
      tipo: form.tipo,
      rol: form.rol,
      activo: true,
      descripcion: form.descripcion.trim() || undefined,
    })
    setForm(emptyForm)
    setError(null)
    setOpen(false)
  }

  const confirmDelete = async () => {
    if (pendingDeleteId) await deleteMiembro(pendingDeleteId)
    setPendingDeleteId(null)
  }

  return (
    <div className="space-y-4">
      <p className="max-w-lg text-xs text-text-muted">
        Hoy solo tú (owner) usas el CRM. Aquí puedes registrar colaboradores o
        "superagentes" (automatizaciones) para cuando los conectes — por
        ejemplo, un agente de prospección que agregue clientes nuevos
        directo a Proyectos. Su rol define qué pueden crear, editar o eliminar.
      </p>

      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus size={15} /> Agregar miembro
        </Button>
      </div>

      <ul className="space-y-2">
        {miembros.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-text-muted">
                {m.tipo === 'agente_ia' ? <Bot size={15} /> : <User size={15} />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-text">{m.nombre}</p>
                <p className="truncate text-xs text-text-muted">{m.email ?? m.descripcion ?? '—'}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-text-soft">
                {rolLabel[m.rol]}
              </span>
              {permisos.eliminar && m.rol !== 'owner' && (
                <button onClick={() => setPendingDeleteId(m.id)} className="text-text-muted hover:text-danger">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Modal title="Agregar miembro" open={open} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Field label="Nombre" error={error ?? undefined}>
            <input className={`input ${error ? 'input-error' : ''}`} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Agente de prospección" />
          </Field>
          <Field label="Correo (opcional)">
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="agente@invitadigital.mx" />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Tipo">
              <select className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoMiembro })}>
                <option value="humano">Humano</option>
                <option value="agente_ia">Agente IA</option>
              </select>
            </Field>
            <Field label="Rol">
              <select className="input" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}>
                <option value="colaborador">Colaborador (crea y edita)</option>
                <option value="agente_ia">Agente IA (solo crea)</option>
              </select>
            </Field>
          </div>
          <Field label="Descripción (opcional)">
            <input className="input" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Qué hace este miembro dentro del CRM" />
          </Field>
          <Button className="w-full justify-center" onClick={handleSubmit}>
            Guardar
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="¿Eliminar este miembro?"
        description="Perderá acceso al CRM. Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}

function SeguridadTab() {
  const { signOut, isOnline } = useAuth()
  return (
    <div className="max-w-md space-y-3">
      <Field label="Contraseña actual">
        <input className="input" type="password" placeholder="••••••••" />
      </Field>
      <Field label="Nueva contraseña">
        <input className="input" type="password" placeholder="••••••••" />
      </Field>
      <Button>Actualizar contraseña</Button>

      {isSupabaseConfigured && (
        <div className="border-t border-border pt-4">
          <p className="mb-2 text-xs text-text-muted">
            {isOnline ? 'Conectado.' : 'Sin conexión: puedes seguir usando el CRM en modo local.'}
          </p>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm text-text-soft hover:bg-white/5"
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

function PreferenciasTab() {
  const [autoSync, setAutoSync] = useState(true)
  const { isOnline, isSyncing, lastSyncedAt, syncManual } = useCrm()

  return (
    <div className="max-w-md space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
        <div>
          <p className="text-sm text-text-soft">Estado de sincronización</p>
          <p className="text-xs text-text-muted">
            {!isSupabaseConfigured
              ? 'Modo local (Supabase no configurado)'
              : !isOnline
                ? 'Sin conexión — tus cambios se guardan localmente'
                : isSyncing
                  ? 'Sincronizando...'
                  : lastSyncedAt
                    ? `Última sincronización: ${lastSyncedAt.toLocaleTimeString('es-MX')}`
                    : 'Aún no se ha sincronizado'}
          </p>
        </div>
        {isSupabaseConfigured && (
          <button onClick={() => syncManual()} className="text-text-muted hover:text-text" title="Sincronizar ahora">
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>
      <ToggleRow label="Sincronización automática" checked={autoSync} onChange={setAutoSync} />
      <Field label="Moneda">
        <select className="input" defaultValue="MXN">
          <option value="MXN">MXN — Peso mexicano</option>
          <option value="USD">USD — Dólar</option>
        </select>
      </Field>
      <Button>Guardar cambios</Button>
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-soft">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}
