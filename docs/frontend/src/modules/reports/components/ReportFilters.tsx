import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { canalAquisicaoLabel, tipoClienteLabel } from '@/modules/orders/lib/order-labels'
import { useProductsQuery } from '@/modules/products/hooks/useProducts'
import type { ReportFiltersInput } from '@/schemas/report.filters.schema'
import { formatYmd } from '@/utils/format'
import { cn } from '@/utils/cn'

type ReportFiltersProps = {
  value: ReportFiltersInput
  onChange: (next: ReportFiltersInput) => void
  className?: string
  /** Sem caixa própria — útil dentro de um Card pai. */
  embedded?: boolean
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function buildDefaultReportFilters(): ReportFiltersInput {
  const fim = new Date()
  const inicio = addDays(fim, -30)
  return {
    dataInicio: formatYmd(inicio),
    dataFim: formatYmd(fim),
    canalAquisicao: undefined,
    categoriaProduto: undefined,
    tipoCliente: undefined,
  }
}

export function ReportFilters({
  value,
  onChange,
  className,
  embedded,
}: ReportFiltersProps) {
  const { data: products } = useProductsQuery()

  const categorias = useMemo(() => {
    if (!products) return []
    return [...new Set(products.map((p) => p.categoria))].sort()
  }, [products])

  function setRangeDays(days: number) {
    const fim = new Date()
    const inicio = addDays(fim, -days)
    onChange({
      ...value,
      dataInicio: formatYmd(inicio),
      dataFim: formatYmd(fim),
    })
  }

  return (
    <div
      className={cn(
        embedded
          ? 'rounded-lg bg-muted/20 p-3 ring-1 ring-border/60'
          : 'rounded-lg border border-border bg-card p-4 shadow-sm',
        className,
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5 border-b border-border/80 pb-2">
        <span className="text-xs font-medium text-muted-foreground">Presets:</span>
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setRangeDays(7)}>
          7 dias
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setRangeDays(30)}>
          30 dias
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setRangeDays(90)}>
          90 dias
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <div className="grid gap-1">
          <Label htmlFor="rep-ini" className="text-xs">
            Data inicial
          </Label>
          <Input
            id="rep-ini"
            type="date"
            className="h-9"
            value={value.dataInicio}
            onChange={(e) =>
              onChange({ ...value, dataInicio: e.target.value })
            }
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="rep-fim" className="text-xs">
            Data final
          </Label>
          <Input
            id="rep-fim"
            type="date"
            className="h-9"
            value={value.dataFim}
            onChange={(e) =>
              onChange({ ...value, dataFim: e.target.value })
            }
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Canal</Label>
          <Select
            value={value.canalAquisicao ?? '__all'}
            onValueChange={(v) =>
              onChange({
                ...value,
                canalAquisicao: v === '__all' ? undefined : (v as ReportFiltersInput['canalAquisicao']),
              })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todos os canais</SelectItem>
              {(
                Object.entries(canalAquisicaoLabel) as [
                  keyof typeof canalAquisicaoLabel,
                  string,
                ][]
              ).map(([k, lab]) => (
                <SelectItem key={k} value={k}>
                  {lab}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Tipo de cliente</Label>
          <Select
            value={value.tipoCliente ?? '__all'}
            onValueChange={(v) =>
              onChange({
                ...value,
                tipoCliente:
                  v === '__all'
                    ? undefined
                    : (v as ReportFiltersInput['tipoCliente']),
              })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todos os segmentos</SelectItem>
              <SelectItem value="VAREJO">{tipoClienteLabel.VAREJO}</SelectItem>
              <SelectItem value="REVENDA">{tipoClienteLabel.REVENDA}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Categoria (produto)</Label>
          <Select
            value={value.categoriaProduto ?? '__all'}
            onValueChange={(v) =>
              onChange({
                ...value,
                categoriaProduto: v === '__all' ? undefined : v,
              })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todas</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
