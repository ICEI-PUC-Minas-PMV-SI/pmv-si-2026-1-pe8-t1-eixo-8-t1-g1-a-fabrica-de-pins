import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { salesSeries } from '@/services/mocks/seed'
import { formatCurrencyBRL } from '@/utils/format'

export function SalesChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={salesSeries} margin={{ left: 8, right: 8 }}>
          <defs>
            <linearGradient id="fillValor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="dia" tickLine={false} axisLine={false} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              new Intl.NumberFormat('pt-BR', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(Number(v))
            }
          />
          <Tooltip
            formatter={(value: number) => [formatCurrencyBRL(value), 'Vendas']}
            labelFormatter={(label) => `Dia: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke="var(--color-primary)"
            fill="url(#fillValor)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
