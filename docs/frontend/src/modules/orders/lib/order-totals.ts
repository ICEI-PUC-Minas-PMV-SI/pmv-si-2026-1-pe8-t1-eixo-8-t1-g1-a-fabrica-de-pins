import type { Cupom } from '@/types'

/**
 * Estima o desconto aplicando cupons em sequência sobre o saldo remanescente
 * (percentual incide sobre o valor atual; fixo limita ao que resta).
 */
export function estimateDescontoCupons(
  subtotalItens: number,
  codigosSelecionados: string[],
  cuponsPorCodigo: Map<string, Cupom>,
): number {
  const base = Math.max(0, subtotalItens)
  if (!base || !codigosSelecionados.length) return 0

  let remaining = base
  let totalDiscount = 0

  for (const raw of codigosSelecionados) {
    const key = raw.trim().toUpperCase()
    const c =
      cuponsPorCodigo.get(key) ??
      cuponsPorCodigo.get(raw.trim()) ??
      cuponsPorCodigo.get(raw)
    if (!c || !c.ativo) continue

    if (c.tipoDesconto === 'PERCENTUAL') {
      const d = (remaining * c.valorDesconto) / 100
      totalDiscount += d
      remaining -= d
    } else {
      const d = Math.min(c.valorDesconto, remaining)
      totalDiscount += d
      remaining -= d
    }
    if (remaining <= 0) break
  }

  return Math.min(totalDiscount, base)
}

export function totalPedidoPreview(
  subtotalItens: number,
  valorFrete: number,
  desconto: number,
): number {
  return Math.max(0, subtotalItens - desconto + Math.max(0, valorFrete))
}
