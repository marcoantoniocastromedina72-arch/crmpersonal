import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Modal } from '../components/ui/Modal'
import { Field } from '../components/ui/Field'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useCrm } from '../store/crmStore'
import { PERMISOS } from '../types/team'
import type { Proyecto, ProyectoEstado, ProyectoTipo } from '../types/crm'

const estadoTone: Record<ProyectoEstado, 'gray' | 'blue' | 'purple' | 'red' | 'green'> = {
  Pendiente: 'gray',
  'En proceso': 'blue',
  'En revisión': 'purple',
  'Cambios solicitados': 'red',
  Listo: 'green',
  Entregado: 'green',
}

const tipos: ProyectoTipo[] = ['Página web', 'Invitación digital', 'Diseño gráfico', 'Otro']
const estados: ProyectoEstado[] = ['Pendiente', 'En proceso', 'En revisión', 'Cambios solicitados', 'Listo', 'Entregado']

const emptyForm = {
  nombre: '',
  cliente: '',
  tipo: tipos[0],
  estado: estados[0] as ProyectoEstado,
  precio: '',
  progreso: '0',
  fechaEntrega: '',
}

type FormErrors = Partial<Record<keyof typeof emptyForm, string>>

export function Proyectos() {
  const { proyectos, addProyecto, updateProyecto, deleteProyecto, currentRol } = useCrm()
  const permisos = PERMISOS[currentRol]

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setOpen(true)
  }

  const openEdit = (p: Proyecto) => {
    setEditingId(p.id)
    setForm({
      nombre: p.nombre,
      cliente: p.cliente,
      tipo: p.tipo,
      estado: p.estado,
      precio: String(p.precio),
      progreso: String(p.progreso),
      fechaEntrega: p.fechaEntrega,
    })
    setErrors({})
    setOpen(true)
  }

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    if (!form.nombre.trim()) next.nombre = 'El nombre del proyecto es obligatorio.'
    if (!form.cliente.trim()) next.cliente = 'El cliente es obligatorio.'
    if (!form.fechaEntrega) next.fechaEntrega = 'La fecha de entrega es obligatoria.'
    if (form.precio !== '' && (isNaN(Number(form.precio)) || Number(form.precio) < 0)) {
      next.precio = 'El precio debe ser un número mayor o igual a 0.'
    }
    const progreso = Number(form.progreso)
    if (form.progreso !== '' && (isNaN(progreso) || progreso < 0 || progreso > 100)) {
      next.progreso = 'El progreso debe estar entre 0 y 100.'
    }
    return next
  }

  const handleSubmit = async () => {
    const validation = validate()
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    const payload = {
      nombre: form.nombre.trim(),
      cliente: form.cliente.trim(),
      tipo: form.tipo,
      estado: form.estado,
      precio: Number(form.precio) || 0,
      progreso: editingId ? Number(form.progreso) || 0 : form.estado === 'Entregado' ? 100 : 0,
      fechaEntrega: form.fechaEntrega,
    }

    if (editingId) await updateProyecto(editingId, payload)
    else await addProyecto(payload)

    setForm(emptyForm)
    setErrors({})
    setEditingId(null)
    setOpen(false)
  }

  const confirmDelete = async () => {
    if (pendingDeleteId) await deleteProyecto(pendingDeleteId)
    setPendingDeleteId(null)
  }

  return (
    <div className="min-w-0 flex-1 space-y-5 overflow-y-auto bg-bg p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-medium text-text">Mis Proyectos</h1>
        {permisos.crear && (
          <Button onClick={openCreate}>
            <Plus size={15} /> Crear Proyecto
          </Button>
        )}
      </div>

      {proyectos.length === 0 ? (
        <EmptyState onCreate={openCreate} canCreate={permisos.crear} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {proyectos.map((p) => (
            <ProyectoCard
              key={p.id}
              proyecto={p}
              canEdit={permisos.editar}
              canDelete={permisos.eliminar}
              onEdit={() => openEdit(p)}
              onDelete={() => setPendingDeleteId(p.id)}
            />
          ))}
        </div>
      )}

      <Modal title={editingId ? 'Editar Proyecto' : 'Crear Proyecto'} open={open} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Field label="Nombre del proyecto" error={errors.nombre}>
            <input
              className={`input ${errors.nombre ? 'input-error' : ''}`}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Invitación XV Camila"
            />
          </Field>
          <Field label="Cliente" error={errors.cliente}>
            <input
              className={`input ${errors.cliente ? 'input-error' : ''}`}
              value={form.cliente}
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
              placeholder="Nombre del cliente"
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Tipo">
              <select
                className="input"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as ProyectoTipo })}
              >
                {tipos.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Estado">
              <select
                className="input"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value as ProyectoEstado })}
              >
                {estados.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Precio (MXN)" error={errors.precio}>
              <input
                className={`input ${errors.precio ? 'input-error' : ''}`}
                type="number"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                placeholder="0"
              />
            </Field>
            <Field label="Fecha de entrega" error={errors.fechaEntrega}>
              <input
                className={`input ${errors.fechaEntrega ? 'input-error' : ''}`}
                type="date"
                value={form.fechaEntrega}
                onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
              />
            </Field>
          </div>
          {editingId && (
            <Field label="Progreso (%)" error={errors.progreso}>
              <input
                className={`input ${errors.progreso ? 'input-error' : ''}`}
                type="number"
                min={0}
                max={100}
                value={form.progreso}
                onChange={(e) => setForm({ ...form, progreso: e.target.value })}
              />
            </Field>
          )}
          <Button className="w-full justify-center" onClick={handleSubmit}>
            {editingId ? 'Guardar cambios' : 'Guardar proyecto'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="¿Eliminar este proyecto?"
        description="Esta acción no se puede deshacer. El proyecto se eliminará también de tus demás dispositivos al sincronizar."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}

function ProyectoCard({
  proyecto,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  proyecto: Proyecto
  canEdit: boolean
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text">{proyecto.nombre}</p>
          <p className="truncate text-xs text-text-muted">{proyecto.cliente}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge label={proyecto.estado} tone={estadoTone[proyecto.estado]} />
          {(canEdit || canDelete) && (
            <div className="flex items-center gap-1 text-text-muted">
              {canEdit && (
                <button onClick={onEdit} title="Editar" className="hover:text-text">
                  <Pencil size={14} />
                </button>
              )}
              {canDelete && (
                <button onClick={onDelete} title="Eliminar" className="hover:text-danger">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-xs text-text-muted">
          <span>Progreso</span>
          <span>{proyecto.progreso}%</span>
        </div>
        <ProgressBar value={proyecto.progreso} />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
        <span>{proyecto.tipo}</span>
        <span>Entrega: {formatDate(proyecto.fechaEntrega)}</span>
      </div>
    </div>
  )
}

function EmptyState({ onCreate, canCreate }: { onCreate: () => void; canCreate: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
      <p className="text-sm text-text">No tienes proyectos todavía.</p>
      <p className="mt-1 text-xs text-text-muted">
        {canCreate ? 'Crea tu primer proyecto para comenzar.' : 'Tu rol no tiene permiso para crear proyectos.'}
      </p>
      {canCreate && (
        <Button className="mt-4" onClick={onCreate}>
          <Plus size={15} /> Nuevo proyecto
        </Button>
      )}
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}
