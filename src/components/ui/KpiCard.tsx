import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

type Variant = 'blue' | 'dark' | 'light'

interface KpiCardProps {
  label: string
  value: string
  delta: string
  positive: boolean
  variant: Variant
}

const variantClasses: Record<Variant, string> = {
  blue: 'bg-card-blue text-[#0a0a0a]',
  dark: 'bg-card text-text border border-border',
  light: 'bg-card-light text-[#0a0a0a]',
}

export function KpiCard({ label, value, delta, positive, variant }: KpiCardProps) {
  const isDark = variant === 'dark'
  return (
    <div className={`rounded-2xl p-5 ${variantClasses[variant]}`}>
      <p className={`text-sm ${isDark ? 'text-text-muted' : 'text-black/60'}`}>{label}</p>
      <div className="mt-3 flex items-end justify-between">
        <span className="text-2xl font-semibold">{value}</span>
        <span
          className={`flex items-center gap-0.5 text-xs font-medium ${
            positive ? 'text-success' : 'text-danger'
          }`}
        >
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {delta}
        </span>
      </div>
    </div>
  )
}
