import { supabase, isSupabaseConfigured } from './supabaseClient'
import { db } from './db'
import type { Proyecto, NotaPago } from '../types/crm'
import type { Miembro } from '../types/team'

// Sincronización deliberadamente simple para un CRM solopreneur: cada fila
// tiene owner_id (tú) y updated_at; al pull, gana el registro con updated_at
// más reciente entre lo local y lo remoto. No es un CRDT ni resuelve
// conflictos finos, pero para un solo usuario editando desde 1-2 dispositivos
// es más que suficiente y evita perder datos.

function toRow<T extends { id: string }>(item: T, ownerId: string) {
  return { ...snakeCase(item), owner_id: ownerId }
}

function snakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    const snake = k.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
    out[snake] = v
  }
  return out
}

function camelCase(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    out[camel] = v
  }
  return out
}

async function pushTable<T extends { id: string; dirty: boolean }>(
  table: 'proyectos' | 'notas_pago' | 'miembros',
  dexieTable: typeof db.proyectos | typeof db.notasPago | typeof db.miembros,
  ownerId: string,
) {
  if (!supabase) return
  const pending = (await dexieTable.filter((r) => r.dirty).toArray()) as unknown as T[]
  if (pending.length === 0) return

  const rows = pending.map((item) => toRow(item, ownerId))
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' })
  if (error) {
    console.error(`[sync] error al subir ${table}:`, error.message)
    return
  }
  // Marca como sincronizado localmente
  await Promise.all(
    pending.map((item) => (dexieTable as any).update(item.id, { dirty: false })),
  )
}

async function pullTable(
  table: 'proyectos' | 'notas_pago' | 'miembros',
  dexieTable: typeof db.proyectos | typeof db.notasPago | typeof db.miembros,
  ownerId: string,
) {
  if (!supabase) return
  const { data, error } = await supabase.from(table).select('*').eq('owner_id', ownerId)
  if (error) {
    console.error(`[sync] error al bajar ${table}:`, error.message)
    return
  }
  if (!data) return

  for (const remoteRow of data) {
    const { owner_id: _owner, ...rest } = remoteRow as Record<string, unknown>
    const remote = camelCase(rest) as { id: string; updatedAt: string; deleted: boolean }
    const local = await (dexieTable as any).get(remote.id)

    // Si hay una edición local aún no subida, no la pises: se subirá en el próximo push.
    if (local?.dirty) continue

    // Gana el más reciente.
    if (!local || new Date(remote.updatedAt) >= new Date(local.updatedAt)) {
      if (remote.deleted) {
        await (dexieTable as any).delete(remote.id)
      } else {
        await (dexieTable as any).put({ ...remote, dirty: false })
      }
    }
  }
}

let syncing = false

export async function syncNow(ownerId: string | null) {
  if (!isSupabaseConfigured || !supabase || !ownerId) return
  if (!navigator.onLine) return
  if (syncing) return
  syncing = true
  try {
    await pushTable<Proyecto>('proyectos', db.proyectos, ownerId)
    await pushTable<NotaPago>('notas_pago', db.notasPago, ownerId)
    await pushTable<Miembro>('miembros', db.miembros, ownerId)

    await pullTable('proyectos', db.proyectos, ownerId)
    await pullTable('notas_pago', db.notasPago, ownerId)
    await pullTable('miembros', db.miembros, ownerId)
  } finally {
    syncing = false
  }
}
