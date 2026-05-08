import { useEffect, useMemo, useState } from 'react'

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
import { canalAquisicaoLabel, modalidadeLabel } from '@/modules/orders/lib/order-labels'
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
    custoOperacionalPeriodo: undefined,
    canalAquisicao: undefined,
    modalidade: undefined,
    categoriaProduto: undefined,
  }
}

export function ReportFilters({
  value,
  onChange,
  className,
  embedded,
}: ReportFiltersProps) {
  const { data: products } = useProductsQuery()
  const [custoText, setCustoText] = useState(
    value.custoOperacionalPeriodo != null
      ? String(value.custoOperacionalPeriodo)
      : '',
  )

  useEffect(() => {
    setCustoText(
      value.custoOperacionalPeriodo != null
        ? String(value.custoOperacionalPeriodo)
        : '',
    )
  }, [value.custoOperacionalPeriodo])

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
          ? 'rounded-xl bg-muted/20 p-4 ring-1 ring-border/60'
          : 'rounded-lg border border-border bg-card p-4 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4 mb-4">
        <span className="text-sm font-medium text-muted-foreground">
          Presets:
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => setRangeDays(7)}>
          7 dias
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setRangeDays(30)}>
          30 dias
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setRangeDays(90)}>
          90 dias
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <div className="grid gap-2">
          <Label htmlFor="rep-ini">Data inicial</Label>
          <Input
            id="rep-ini"
            type="date"
            value={value.dataInicio}
            onChange={(e) =>
              onChange({ ...value, dataInicio: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rep-fim">Data final</Label>
          <Input
            id="rep-fim"
            type="date"
            value={value.dataFim}
            onChange={(e) =>
              onChange({ ...value, dataFim: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Canal</Label>
          <Select
            value={value.canalAquisicao ?? '__all'}
            onValueChange={(v) =>
              onChange({
                ...value,
                canalAquisicao: v === '__all' ? undefined : (v as ReportFiltersInput['canalAquisicao']),
              })
            }
          >
            <SelectTrigger>
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
        <div className="grid gap-2">
          <Label>Modalidade</Label>
          <Select
            value={value.modalidade ?? '__all'}
            onValueChange={(v) =>
              onChange({
                ...value,
                modalidade: v === '__all' ? undefined : (v as ReportFiltersInput['modalidade']),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todas</SelectItem>
              <SelectItem value="pronta_entrega">
                {modalidadeLabel.pronta_entrega}
              </SelectItem>
              <SelectItem value="pre_venda">{modalidadeLabel.pre_venda}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Categoria (produto)</Label>
          <Select
            value={value.categoriaProduto ?? '__all'}
            onValueChange={(v) =>
              onChange({
                ...value,
                categoriaProduto: v === '__all' ? undefined : v,
              })
            }
          >
            <SelectTrigger>
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
        <div className="grid gap-2">
          <Label htmlFor="rep-custo">Custo operacional no período (R$)</Label>
          <Input
            id="rep-custo"
            type="number"
            min={0}
            step="0.01"
            placeholder="Opcional"
            value={custoText}
            onChange={(e) => {
              const t = e.target.value
              setCustoText(t)
              const n = parseFloat(t.replace(',', '.'))
              onChange({
                ...value,
                custoOperacionalPeriodo:
                  t.trim() === '' || Number.isNaN(n) ? undefined : n,
              })
            }}
          />
        </div>
      </div>
    </div>
  )
}
