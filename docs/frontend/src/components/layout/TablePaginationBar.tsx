import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export type TablePaginationBarProps = {
  /** Índice 0-based da página atual */
  pageIndex: number
  pageSize: number
  totalPages: number
  totalElements: number
  /** Quantidade de linhas na página atual (`content.length`) */
  rowCount: number
  isFirst: boolean
  isLast: boolean
  isPending?: boolean
  onPrev: () => void
  onNext: () => void
  emptyMessage?: string
}

export function TablePaginationBar({
  pageIndex,
  pageSize,
  totalPages,
  totalElements,
  rowCount,
  isFirst,
  isLast,
  isPending,
  onPrev,
  onNext,
  emptyMessage = 'Nenhum registro.',
}: TablePaginationBarProps) {
  const summary =
    totalElements === 0
      ? emptyMessage
      : `Mostrando ${pageIndex * pageSize + 1}–${Math.min(
          pageIndex * pageSize + rowCount,
          totalElements,
        )} de ${totalElements}`

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-muted-foreground">
      <p>{summary}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={isFirst || isPending}
          onClick={onPrev}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <span className="tabular-nums">
          Página {totalPages === 0 ? 0 : pageIndex + 1} de {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={isLast || isPending}
          onClick={onNext}
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
