import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

interface SpecialtyBadgeProps {
  specialty: string
  className?: string
}

export function SpecialtyBadge({ specialty, className }: SpecialtyBadgeProps) {
  return (
    <Badge variant="primary" className={cn('text-xs', className)}>
      {specialty}
    </Badge>
  )
}
