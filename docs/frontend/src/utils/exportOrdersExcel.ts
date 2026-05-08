import * as XLSX from 'xlsx'

import {
  canalAquisicaoLabel,
  modalidadeLabel,
  orderStatusLabel,
} from '@/modules/orders/lib/order-labels'
import type { Order } from '@/types'

function formatItensResumo(
  order: Order,
  nomePorProdutoId: Map<string, string>,
): string {
  return order.itens
    .map((i) => {
      const nome =
        nomePorProdutoId.get(i.produtoId) ?? `Produto ${i.produtoId.slice(0, 8)}`
      return `${i.quantidade} × ${nome} (@ ${i.precoUnitario.toFixed(2)})`
    })
    .join(' | ')
}

export type OrdersExportProductLookup = Map<string, string>

export function exportOrdersToExcel(
  orders: Order[],
  nomePorProdutoId: OrdersExportProductLookup,
  filenameBase = 'pedidos',
): void {
  const rows = orders.map((o) => ({
    ID: o.id,
    Cliente: o.clienteNome ?? o.clienteId,
    'Total (R$)': o.valorTotal,
    Modalidade: modalidadeLabel[o.modalidade] ?? o.modalidade,
    Status: orderStatusLabel[o.status] ?? o.status,
    Canal: canalAquisicaoLabel[o.canalAquisicao] ?? o.canalAquisicao,
    'Data criação': o.createdAt,
    Itens: formatItensResumo(o, nomePorProdutoId),
    'Produção início': o.producaoIniciadaEm ?? '',
    'Produção fim': o.producaoFinalizadaEm ?? '',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Pedidos')

  const data = new Date()
  const stamp = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
  XLSX.writeFile(wb, `${filenameBase}_${stamp}.xlsx`)
}
