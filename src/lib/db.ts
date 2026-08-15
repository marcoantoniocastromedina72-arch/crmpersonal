import Dexie, { type EntityTable } from 'dexie'
import type { Proyecto, NotaPago } from '../types/crm'
import type { Miembro } from '../types/team'

class InvitadigitalDB extends Dexie {
  proyectos!: EntityTable<Proyecto, 'id'>
  notasPago!: EntityTable<NotaPago, 'id'>
  miembros!: EntityTable<Miembro, 'id'>

  constructor() {
    super('invitadigital-crm')
    this.version(1).stores({
      // "dirty" indexado para poder preguntar rápido "qué falta sincronizar"
      proyectos: 'id, cliente, estado, dirty, deleted, updatedAt',
      notasPago: 'id, cliente, proyectoId, estado, dirty, deleted, updatedAt',
      miembros: 'id, rol, tipo, dirty, deleted, updatedAt',
    })
  }
}

export const db = new InvitadigitalDB()

const nowIso = () => new Date().toISOString()

const seedProyectos: Proyecto[] = [
  { id: 'p1', nombre: 'Invitación XV María', cliente: 'María López', tipo: 'Invitación digital', estado: 'En revisión', precio: 1200, progreso: 70, fechaEntrega: '2026-08-20', updatedAt: nowIso(), dirty: false, deleted: false },
  { id: 'p2', nombre: 'Página web Carlos', cliente: 'Carlos Nuñez', tipo: 'Página web', estado: 'En proceso', precio: 4500, progreso: 45, fechaEntrega: '2026-08-25', updatedAt: nowIso(), dirty: false, deleted: false },
  { id: 'p3', nombre: 'Invitación boda Ana', cliente: 'Ana Torres', tipo: 'Invitación digital', estado: 'Pendiente', precio: 1500, progreso: 10, fechaEntrega: '2026-09-02', updatedAt: nowIso(), dirty: false, deleted: false },
  { id: 'p4', nombre: 'Logo Luis', cliente: 'Luis Reyes', tipo: 'Diseño gráfico', estado: 'Cambios solicitados', precio: 800, progreso: 60, fechaEntrega: '2026-08-18', updatedAt: nowIso(), dirty: false, deleted: false },
  { id: 'p5', nombre: 'Landing Sofía', cliente: 'Sofía Díaz', tipo: 'Página web', estado: 'Listo', precio: 2200, progreso: 95, fechaEntrega: '2026-08-16', updatedAt: nowIso(), dirty: false, deleted: false },
]

const seedNotasPago: NotaPago[] = [
  { id: 'n1', cliente: 'María López', proyectoId: 'p1', concepto: 'Anticipo invitación XV', monto: 1200, montoRecibido: 600, fecha: '2026-08-05', estado: 'Parcial', metodo: 'Transferencia', updatedAt: nowIso(), dirty: false, deleted: false },
  { id: 'n2', cliente: 'Carlos Nuñez', proyectoId: 'p2', concepto: 'Anticipo página web', monto: 4500, montoRecibido: 4500, fecha: '2026-08-02', estado: 'Pagada', metodo: 'Efectivo', updatedAt: nowIso(), dirty: false, deleted: false },
  { id: 'n3', cliente: 'Luis Reyes', proyectoId: 'p4', concepto: 'Diseño de logo', monto: 800, montoRecibido: 0, fecha: '2026-08-10', estado: 'Pendiente', metodo: 'Transferencia', updatedAt: nowIso(), dirty: false, deleted: false },
  { id: 'n4', cliente: 'Sofía Díaz', proyectoId: 'p5', concepto: 'Landing page', monto: 2200, montoRecibido: 2200, fecha: '2026-08-01', estado: 'Pagada', metodo: 'Tarjeta', updatedAt: nowIso(), dirty: false, deleted: false },
]

const seedMiembros: Miembro[] = [
  {
    id: 'u1',
    nombre: 'Marco',
    email: 'marcoantoniocastromedina72@gmail.com',
    tipo: 'humano',
    rol: 'owner',
    activo: true,
    descripcion: 'Dueño del CRM',
    updatedAt: nowIso(),
    dirty: false,
    deleted: false,
  },
]

// Solo siembra datos de ejemplo la primera vez que se abre la app en ese
// dispositivo (tabla vacía). Si ya hay datos (locales o sincronizados desde
// Supabase), no los toca.
export async function seedIfEmpty() {
  const [proyectosCount, notasCount, miembrosCount] = await Promise.all([
    db.proyectos.count(),
    db.notasPago.count(),
    db.miembros.count(),
  ])
  if (proyectosCount === 0) await db.proyectos.bulkAdd(seedProyectos)
  if (notasCount === 0) await db.notasPago.bulkAdd(seedNotasPago)
  if (miembrosCount === 0) await db.miembros.bulkAdd(seedMiembros)
}
