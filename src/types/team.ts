import type { Syncable } from './crm'

// Sistema de roles simple pensado a futuro: hoy solo tú (owner) usas el CRM,
// pero deja la puerta abierta para agregar "superagentes" (bots/automatizaciones)
// como colaboradores con permisos acotados dentro del mismo CRM.
export type Rol = 'owner' | 'colaborador' | 'agente_ia'
export type TipoMiembro = 'humano' | 'agente_ia'

export interface Miembro extends Syncable {
  id: string
  nombre: string
  email?: string
  tipo: TipoMiembro
  rol: Rol
  activo: boolean
  descripcion?: string // ej. "Agente de prospección que agrega leads a Proyectos"
}

// Reglas de permisos por rol. Muy simple a propósito: solo lo que ya se
// necesita hoy (owner puede todo). Cuando agregues agentes reales, aquí
// es donde vas a acotar qué puede tocar cada uno.
export const PERMISOS: Record<Rol, { crear: boolean; editar: boolean; eliminar: boolean }> = {
  owner: { crear: true, editar: true, eliminar: true },
  colaborador: { crear: true, editar: true, eliminar: false },
  agente_ia: { crear: true, editar: false, eliminar: false },
}
