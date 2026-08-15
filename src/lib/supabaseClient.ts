import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Si todavía no configuraste .env, el CRM sigue funcionando 100% local
// (Dexie), solo sin sincronización ni login. isSupabaseConfigured te deja
// mostrar avisos claros en vez de que la app truene en silencio.
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true, // guarda la sesión en localStorage -> funciona offline tras el primer login
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Invitadigital CRM] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY no configuradas. ' +
      'La app corre en modo local-only (sin login ni sincronización). Ver README.',
  )
}
