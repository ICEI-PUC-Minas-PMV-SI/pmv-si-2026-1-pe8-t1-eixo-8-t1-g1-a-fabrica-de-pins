export function digitsOnly(s: string): string {
  return s.replace(/\D/g, '')
}

/** CPF: 000.000.000-00 — CNPJ: 00.000.000/0000-00 */
export function maskCpfCnpj(
  value: string,
  tipoPessoa: 'FISICA' | 'JURIDICA',
): string {
  const max = tipoPessoa === 'JURIDICA' ? 14 : 11
  const d = digitsOnly(value).slice(0, max)

  if (tipoPessoa === 'JURIDICA') {
    if (d.length <= 2) return d
    if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
    if (d.length <= 8)
      return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
    if (d.length <= 12)
      return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
  }

  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

/** Celular (11) ou fixo (10): (00) 00000-0000 / (00) 0000-0000 */
export function maskTelefoneBr(value: string): string {
  const d = digitsOnly(value).slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const EMAIL_ALLOWED = /[^a-zA-Z0-9@._+\-]/g

/** Remove espaços e caracteres inválidos; não força @ (evita “máscara” quebrada ao digitar). */
export function sanitizeEmailInput(raw: string): string {
  return raw.replace(/\s/g, '').replace(EMAIL_ALLOWED, '')
}

export function normalizeEmail(value: string): string {
  return sanitizeEmailInput(value).toLowerCase()
}
