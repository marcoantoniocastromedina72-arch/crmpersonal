interface BadgeProps {
  label: string
  tone: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray'
}

const toneClasses: Record<BadgeProps['tone'], string> = {
  green: 'bg-success/10 text-success',
  yellow: 'bg-[#eab308]/10 text-[#eab308]',
  red: 'bg-danger/10 text-danger',
  blue: 'bg-[#60a5fa]/10 text-[#60a5fa]',
  purple: 'bg-accent-glow/10 text-[#c084fc]',
  gray: 'bg-white/5 text-text-muted',
}

export function Badge({ label, tone }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>
      {label}
    </span>
  )
}
