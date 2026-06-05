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
import { useAllCategoriesQuery } from '@/modules/products/hooks/useCategories'
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
    categoriaId: undefined,
    tipoCliente: undefined,
    periodoPlanejamento: 'MES',
  }
}

export function ReportFilters({
  value,
  onChange,
  className,
  embedded,
}: ReportFiltersProps) {
  const { data: categoriasData, isPending: categoriasPending } =
    useAllCategoriesQuery()

  const categorias = useMemo(() => {
    if (!categoriasData) return []
    const ordered = [...categoriasData].sort((a, b) =>
      a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }),
    )
    const seen = new Set<string>()
    const out: typeof ordered = []
    for (const c of ordered) {
      const key = c.nome.trim().toLowerCase()
      if (!key || seen.has(key)) continue
      seen.add(key)
      out.push(c)
    }
    return out
  }, [categoriasData])

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
            max={value.dataFim || undefined}
            onChange={(e) => {
              const dataInicio = e.target.value
              if (value.dataFim && dataInicio > value.dataFim) return
              onChange({ ...value, dataInicio })
            }}
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
            min={value.dataInicio || undefined}
            onChange={(e) => {
              const dataFim = e.target.value
              if (value.dataInicio && dataFim < value.dataInicio) return
              onChange({ ...value, dataFim })
            }}
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
            value={value.categoriaId != null ? String(value.categoriaId) : '__all'}
            onValueChange={(v) => {
              const next = v === '__all' ? undefined : Number(v)
              onChange({
                ...value,
                categoriaId: Number.isFinite(next) ? next : undefined,
              })
            }}
            disabled={categoriasPending && categorias.length === 0}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue
                placeholder={
                  categoriasPending && categorias.length === 0
                    ? 'Carregando…'
                    : 'Todas'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todas</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
