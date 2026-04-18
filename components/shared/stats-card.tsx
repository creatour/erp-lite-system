import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number | ReactNode
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const iconColorMap = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-2xl hover:border-primary/50">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-sm font-medium mt-2',
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-3xl shadow-sm', iconColorMap[variant])}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}
