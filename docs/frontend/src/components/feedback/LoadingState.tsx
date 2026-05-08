import { Skeleton } from '@/components/ui/skeleton'

type LoadingStateProps = {
  rows?: number
  className?: string
}

export function LoadingState({ rows = 5 }: LoadingStateProps) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}
