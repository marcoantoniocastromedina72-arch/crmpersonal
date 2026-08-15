import { useState } from 'react'
import { Plus, Eye, Download, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Field } from '../components/ui/Field'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useCrm } from '../store/crmStore'
import { PERMISOS } from '../types/team'
import type { NotaPago, NotaPagoEstado } from '../types/crm'

const estadoTone: Record<NotaPagoEstado, 'green' | 'yellow' | 'purple' | 'gray'> = {
  Pagada: 'green',
  Pendiente: 'yellow',
  Parcial: 'purple',
  Cancelada: 'gray',
}

const estados: NotaPagoEstado[] = ['Pendiente', 'Pagada', 'Parcial', 'Cancelada']
const metodos = ['Transferencia', 'Efectivo', 'Tarjeta', 'Otro']

const emptyForm = {
  cliente: '',
  proyectoId: '',
  concepto: '',
  monto: '',
  montoRecibido: '',
  fecha: '',
  estado: estados[0] as NotaPagoEstado,
  metodo: metodos[0],
}

type FormErrors = Partial<Record<keyof typeof emptyForm, string>>

export function NotasDePago() {
  const { notasPago, proyectos, addNotaPago, updateNotaPago, deleteNotaPago, currentRol } = useCrm()
  const permisos = PERMISOS[currentRol]

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const totalFacturado = notasPago.reduce((s, n) => s + n.monto, 0)
  const totalCobrado = notasPago.reduce((s, n) => s + n.montoRecibido, 0)
  const totalPendiente = totalFacturado - totalCobrado

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setOpen(true)
  }

  const openEdit = (n: NotaPago) => {
    setEditingId(n.id)
    setForm({
      cliente: n.cliente,
      proyectoId: n.proyectoId ?? '',
      concepto: n.concepto,
      monto: String(n.monto),
      montoRecibido: String(n.montoRecibido),
      fecha: n.fecha,
      estado: n.estado,
      metodo: n.metodo,
    })
    setErrors({})
    setOpen(true)
  }

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    if (!form.cliente.trim()) next.cliente = 'El cliente es obligatorio.'
    if (!form.concepto.trim()) next.concepto = 'El concepto es obligatorio.'
    if (!form.fecha) next.fecha = 'La fecha es obligatoria.'
    if (!form.monto || isNaN(Number(form.monto)) || Number(form.monto) <= 0) {
      next.monto = 'El monto debe ser un número mayor a 0.'
    }
    if (form.montoRecibido !== '' && (isNaN(Number(form.montoRecibido)) || Number(form.montoRecibido) < 0)) {
      next.montoRecibido = 'El monto recibido debe ser un número mayor o igual a 0.'
    }
    if (
      form.monto &&
      form.montoRecibido &&
      !isNaN(Number(form.monto)) &&
      !isNaN(Number(form.montoRecibido)) &&
      Number(form.montoRecibido) > Number(form.monto)
    ) {
      next.montoRecibido = 'El monto recibido no puede ser mayor al monto total.'
    }
    return next
  }

  const handleSubmit = async () => {
    const validation = validate()
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    const payload = {
      cliente: form.cliente.trim(),
      proyectoId: form.proyectoId || undefined,
      concepto: form.concepto.trim(),
      monto: Number(form.monto),
      montoRecibido: Number(form.montoRecibido) || 0,
      fecha: form.fecha,
      estado: form.estado,
      metodo: form.metodo,
    }

    if (editingId) await updateNotaPago(editingId, payload)
    else await addNotaPago(payload)

    setForm(emptyForm)
    setErrors({})
    setEditingId(null)
    setOpen(false)
  }

  const confirmDelete = async () => {
    if (pendingDeleteId) await deleteNotaPago(pendingDeleteId)
    setPendingDeleteId(null)
  }

  return (
    <div className="min-w-0 flex-1 space-y-5 overflow-y-auto bg-bg p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-medium text-text">Notas de pago</h1>
        {permisos.crear && (
          <Button onClick={openCreate}>
            <Plus size={15} /> Nueva Nota de Pago
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total facturado" value={totalFacturado} />
        <SummaryCard label="Cobrado" value={totalCobrado} tone="text-success" />
        <SummaryCard label="Pendiente por cobrar" value={totalPendiente} tone="text-[#eab308]" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-text-muted">
                <th className="pb-3 font-normal">Cliente</th>
                <th className="pb-3 font-normal">Concepto</th>
                <th className="pb-3 font-normal">Monto</th>
                <th className="pb-3 font-normal">Fecha</th>
                <th className="pb-3 font-normal">Estado</th>
                <th className="pb-3 font-normal">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {notasPago.map((n) => (
                <tr key={n.id} className="border-t border-border/60">
                  <td className="py-3 text-sm text-text">{n.cliente}</td>
                  <td className="py-3 text-sm text-text-soft">{n.concepto}</td>
                  <td className="py-3 text-sm text-text-soft">${n.monto.toLocaleString('es-MX')}</td>
                  <td className="py-3 text-sm text-text-soft">{formatDate(n.fecha)}</td>
                  <td className="py-3">
                    <Badge label={n.estado} tone={estadoTone[n.estado]} />
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2 text-text-muted">
                      <button className="hover:text-text" title="Ver">
                        <Eye size={15} />
                      </button>
                      <button className="hover:text-text" title="Descargar">
                        <Download size={15} />
                      </button>
                      {permisos.editar && (
                        <button className="hover:text-text" title="Editar" onClick={() => openEdit(n)}>
                          <Pencil size={15} />
                        </button>
                      )}
                      {permisos.eliminar && (
                        <button
                          className="hover:text-danger"
                          title="Eliminar"
                          onClick={() => setPendingDeleteId(n.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title={editingId ? 'Editar Nota de Pago' : 'Nueva Nota de Pago'} open={open} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Field label="Cliente" error={errors.cliente}>
            <input
              className={`input ${errors.cliente ? 'input-error' : ''}`}
              value={form.cliente}
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
              placeholder="Nombre del cliente"
            />
          </Field>
          <Field label="Proyecto relacionado (opcional)">
            <select className="input" value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
              <option value="">— Sin proyecto —</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </Field>
          <Field label="Concepto" error={errors.concepto}>
            <input
              className={`input ${errors.concepto ? 'input-error' : ''}`}
              value={form.concepto}
              onChange={(e) => setForm({ ...form, concepto: e.target.value })}
              placeholder="Ej. Anticipo, liquidación..."
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Monto total" error={errors.monto}>
              <input
                className={`input ${errors.monto ? 'input-error' : ''}`}
                type="number"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                placeholder="0"
              />
            </Field>
            <Field label="Monto recibido" error={errors.montoRecibido}>
              <input
                className={`input ${errors.montoRecibido ? 'input-error' : ''}`}
                type="number"
                value={form.montoRecibido}
                onChange={(e) => setForm({ ...form, montoRecibido: e.target.value })}
                placeholder="0"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Fecha" error={errors.fecha}>
              <input
                className={`input ${errors.fecha ? 'input-error' : ''}`}
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </Field>
            <Field label="Estado">
              <select className="input" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as NotaPagoEstado })}>
                {estados.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Método de pago">
            <select className="input" value={form.metodo} onChange={(e) => setForm({ ...form, metodo: e.target.value })}>
              {metodos.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Button className="w-full justify-center" onClick={handleSubmit}>
            {editingId ? 'Guardar cambios' : 'Guardar nota de pago'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="¿Eliminar esta nota de pago?"
        description="Esta acción no se puede deshacer. Se eliminará también de tus demás dispositivos al sincronizar."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}

function SummaryCard({ label, value, tone = 'text-text' }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${tone}`}>${value.toLocaleString('es-MX')}</p>
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}
