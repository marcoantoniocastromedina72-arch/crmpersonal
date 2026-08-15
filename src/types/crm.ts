export type ProyectoTipo = 'Página web' | 'Invitación digital' | 'Diseño gráfico' | 'Otro'
export type ProyectoEstado =
  | 'Pendiente'
  | 'En proceso'
  | 'En revisión'
  | 'Cambios solicitados'
  | 'Listo'
  | 'Entregado'

// Campos de sincronización presentes en todos los registros sincronizables.
// - updatedAt: usado para resolver conflictos (gana el más reciente)
// - dirty: true si hay cambios locales que aún no se subieron a Supabase
// - deleted: borrado "suave" -> permite propagar la eliminación entre dispositivos
export interface Syncable {
  updatedAt: string // ISO datetime
  dirty: boolean
  deleted: boolean
}

export interface Proyecto extends Syncable {
  id: string
  nombre: string
  cliente: string
  tipo: ProyectoTipo
  estado: ProyectoEstado
  precio: number
  progreso: number // 0-100
  fechaEntrega: string // ISO yyyy-mm-dd
}

export type NotaPagoEstado = 'Pendiente' | 'Pagada' | 'Parcial' | 'Cancelada'

export interface NotaPago extends Syncable {
  id: string
  cliente: string
  proyectoId?: string
  concepto: string
  monto: number
  montoRecibido: number
  fecha: string // ISO yyyy-mm-dd
  estado: NotaPagoEstado
  metodo: string
}
