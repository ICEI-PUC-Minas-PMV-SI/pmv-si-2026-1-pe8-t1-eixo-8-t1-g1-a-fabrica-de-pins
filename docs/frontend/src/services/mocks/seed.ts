/**
 * Dados demo para dashboard e mocks iniciais. Substituir por API quando existir backend.
 */

export const salesSeries = [
  { dia: 'Seg', valor: 1200 },
  { dia: 'Ter', valor: 1800 },
  { dia: 'Qua', valor: 1400 },
  { dia: 'Qui', valor: 2200 },
  { dia: 'Sex', valor: 2600 },
  { dia: 'Sáb', valor: 1900 },
  { dia: 'Dom', valor: 900 },
]

export const categoryVolume = [
  { categoria: 'Pins', volume: 42 },
  { categoria: 'Chaveiros', volume: 28 },
  { categoria: 'Embalagens', volume: 15 },
  { categoria: 'Brindes', volume: 22 },
]

export function totalSalesDemo(): number {
  return salesSeries.reduce((acc, x) => acc + x.valor, 0)
}

export function ordersThisMonthDemo(): number {
  return 48
}
