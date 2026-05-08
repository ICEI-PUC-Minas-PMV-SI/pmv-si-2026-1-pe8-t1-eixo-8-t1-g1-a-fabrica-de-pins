export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDateBR(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d)
}

/** Normaliza data da API para valor de `<input type="date">`. */
export function toDateInputValue(isoOrYmd: string): string {
  if (!isoOrYmd?.trim()) return ''
  const s = isoOrYmd.trim()
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(s)
  if (m) return m[1]
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return ''
  return formatYmd(d)
}

/** `YYYY-MM-DD` em fuso local. */
export function formatYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
