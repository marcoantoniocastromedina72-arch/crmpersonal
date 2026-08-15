import { useState } from 'react'
import { Lock, Mail, WifiOff } from 'lucide-react'
import { useAuth } from '../../store/authStore'

export function LoginScreen() {
  const { signIn, isOnline } = useAuth()
  const [email, setEmail] = useState('marcoantoniocastromedina72@gmail.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) return setError('Ingresa tu correo.')
    if (!password) return setError('Ingresa tu contraseña.')
    if (!isOnline) return setError('Necesitas conexión a internet para iniciar sesión la primera vez.')

    setSubmitting(true)
    const { error: signInError } = await signIn(email.trim(), password)
    setSubmitting(false)
    if (signInError) setError(traducirError(signInError))
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#1f1f23] p-4">
      <div className="w-full max-w-sm rounded-2xl border-2 border-accent-glow bg-panel p-6 shadow-[0_0_40px_rgba(153,51,255,0.25)]">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
            IN
          </div>
          <p className="text-sm font-medium text-text">Invitadigital CRM</p>
          <p className="text-xs text-text-muted">Inicia sesión para continuar</p>
        </div>

        {!isOnline && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-white/5 px-3 py-2 text-xs text-text-muted">
            <WifiOff size={14} className="shrink-0" />
            Sin conexión. Si ya iniciaste sesión antes en este dispositivo, cierra esta pantalla y vuelve a abrir la app.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-xs text-text-muted">
              <Mail size={12} /> Correo
            </span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-xs text-text-muted">
              <Lock size={12} /> Contraseña
            </span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && <p className="text-xs text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-accent-glow px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-glow/90 disabled:opacity-60"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function traducirError(msg: string) {
  if (msg.toLowerCase().includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }
  return msg
}
