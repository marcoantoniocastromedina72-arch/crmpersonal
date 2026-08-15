export type PageKey = 'inicio' | 'agenda' | 'pagos' | 'proyectos' | 'configuracion'

export interface NavItem {
  key: PageKey
  label: string
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'inicio', label: 'Inicio' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'pagos', label: 'Notas de pago' },
  { key: 'proyectos', label: 'Mis Proyectos' },
]

export const NAV_ITEM_CONFIG: NavItem = { key: 'configuracion', label: 'Configuración' }
