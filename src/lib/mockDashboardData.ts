// Datos de ejemplo solo para maquetar el estilo visual del Dashboard.
// Se reemplazarán por datos reales (Supabase/Dexie) en la fase de lógica de negocio.

export const kpis = [
  { label: 'Ingreso del mes', value: '$3,650', delta: '+11.01%', positive: true, variant: 'blue' as const },
  { label: 'Pendiente por recibir', value: '$2,550', delta: '-0.03%', positive: false, variant: 'dark' as const },
  { label: 'Proyectos activos', value: '5', delta: '+15.03%', positive: true, variant: 'dark' as const },
  { label: 'Clientes este mes', value: '10', delta: '+6.08%', positive: true, variant: 'light' as const },
]

export const monthlyRevenue = [
  { month: 'Ene', recibido: 18, pendiente: 6 },
  { month: 'Feb', recibido: 14, pendiente: 4 },
  { month: 'Mar', recibido: 16, pendiente: 5 },
  { month: 'Abr', recibido: 22, pendiente: 7 },
  { month: 'May', recibido: 12, pendiente: 3 },
  { month: 'Jun', recibido: 19, pendiente: 8 },
]

export const salesFlow = [
  { month: 'Ene', web: 8, invitaciones: 22 },
  { month: 'Feb', web: 14, invitaciones: 16 },
  { month: 'Mar', web: 20, invitaciones: 10 },
  { month: 'Abr', web: 16, invitaciones: 18 },
  { month: 'May', web: 22, invitaciones: 24 },
  { month: 'Jun', web: 28, invitaciones: 26 },
]

export const urgentProjects = [
  { client: 'María López', project: 'Invitación XV', delivery: '15 Sep', status: 'Revisión' },
  { client: 'Carlos Nuñez', project: 'Página web', delivery: '18 Sep', status: 'Desarrollo' },
  { client: 'Ana Torres', project: 'Invitación boda', delivery: '20 Sep', status: 'Pendiente' },
  { client: 'Luis Reyes', project: 'Diseño de logo', delivery: '22 Sep', status: 'Cambios' },
  { client: 'Sofía Díaz', project: 'Landing page', delivery: '25 Sep', status: 'Listo' },
]

export const services = [
  { name: 'Páginas web', value: 300.56, color: 'var(--color-accent-glow)' },
  { name: 'Diseño web', value: 135.18, color: 'var(--color-chart-blue)' },
  { name: 'Invitaciones', value: 154.02, color: '#86efac' },
]

export const notifications = [
  { text: 'Tienes un pago pendiente por confirmar', time: 'Justo ahora' },
  { text: 'Nuevo cliente registrado', time: 'Hace 59 minutos' },
  { text: 'Tienes una entrega por revisar', time: 'Hace 12 horas' },
  { text: 'Andrea se suscribió a tu boletín', time: 'Hoy, 11:59 AM' },
]

export const activities = [
  { text: 'Reportaste un error en Proyectos', time: 'Justo ahora' },
  { text: 'Publicaste una nueva versión', time: 'Hace 59 minutos' },
  { text: 'Registraste un pago', time: 'Hace 12 horas' },
  { text: 'Modificaste datos en un proyecto', time: 'Hoy, 11:59 AM' },
  { text: 'Eliminaste una página del sitio', time: '2 Feb, 2025' },
]

export const contacts = [
  { name: 'Natalí Cruz', status: 'online' as const },
  { name: 'Andrea Cano', status: 'busy' as const },
  { name: 'Orlando Díaz', status: 'online' as const },
  { name: 'Andy Lane', status: 'offline' as const },
  { name: 'Kate Morrison', status: 'online' as const },
  { name: 'Koray Okumus', status: 'offline' as const },
]
