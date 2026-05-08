import { useEffect, useState } from 'react'
import { useForm, type FieldPath, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { cn } from '@/utils/cn'
import {
  maskCpfCnpj,
  maskTelefoneBr,
  normalizeEmail,
} from '@/utils/inputMasks'
import {
  useCreateCustomerMutation,
  useCustomerDetailQuery,
  useUpdateCustomerMutation,
} from '@/modules/customers/hooks/useCustomers'
import {
  customerPersonalStepSchema,
  customerSchema,
  type CustomerFormValues,
} from '@/schemas/customer.schema'

const TIPO_CLIENTE_OPTS = ['VAREJO', 'REVENDA'] as const
const TIPO_PESSOA_OPTS = ['FISICA', 'JURIDICA'] as const
const TIPO_CLIENTE_LABEL: Record<(typeof TIPO_CLIENTE_OPTS)[number], string> = {
  VAREJO: 'VAREJO',
  REVENDA: 'REVENDA',
}
const TIPO_PESSOA_LABEL: Record<(typeof TIPO_PESSOA_OPTS)[number], string> = {
  FISICA: 'FISICA',
  JURIDICA: 'JURIDICA',
}

function enumInput(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>
    const preferredKeys = [
      'value',
      'codigo',
      'code',
      'tipo',
      'nome',
      'descricao',
      'label',
    ] as const
    for (const k of preferredKeys) {
      const v = o[k]
      if (typeof v === 'string') return v
    }
    for (const v of Object.values(o)) {
      if (typeof v === 'string') return v
    }
  }
  return ''
}

function enumToken(value: unknown): string {
  return enumInput(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
}

function normalizeTipoCliente(
  value: unknown,
): (typeof TIPO_CLIENTE_OPTS)[number] | undefined {
  const normalized = enumToken(value)
  if (normalized === 'REVENDA') return 'REVENDA'
  if (normalized === 'VAREJO') return 'VAREJO'
  return undefined
}

function normalizeTipoPessoa(
  value: unknown,
): (typeof TIPO_PESSOA_OPTS)[number] | undefined {
  const normalized = enumToken(value)
  if (normalized.startsWith('JURIDIC')) return 'JURIDICA'
  if (normalized.startsWith('FISIC')) return 'FISICA'
  return undefined
}

const emptyEndereco: CustomerFormValues['endereco'] = {
  cep: '',
  estado: '',
  cidade: '',
  bairro: '',
  logradouro: '',
  numero: '',
  complemento: '',
  pontoReferencia: '',
  observacoes: '',
  enderecoPrincipal: true,
  tipoEndereco: 'ENTREGA',
  apelido: '',
}

function setFormErrorsFromZod(
  error: z.ZodError,
  setError: UseFormSetError<CustomerFormValues>,
) {
  for (const issue of error.issues) {
    const key = issue.path.join('.') as FieldPath<CustomerFormValues>
    if (key) {
      setError(key, { message: issue.message })
    }
  }
}

type CustomerFormProps = {
  /** Quando definido, carrega o cliente com GET /clientes/{id}. */
  editingCustomerId?: string | null
  onDoneEdit?: () => void
  onSuccessfulSubmit?: () => void
}

export function CustomerForm({
  editingCustomerId = null,
  onDoneEdit,
  onSuccessfulSubmit,
}: CustomerFormProps) {
  const [step, setStep] = useState(0)
  const createCustomer = useCreateCustomerMutation()
  const updateCustomer = useUpdateCustomerMutation()
  const detailQuery = useCustomerDetailQuery(editingCustomerId)

  const editingId = editingCustomerId ?? null
  const detail = detailQuery.data
  const detailMatches = Boolean(
    editingId && detail && String(detail.id) === String(editingId),
  )

  const form = useForm<CustomerFormValues>({
    shouldUnregister: false,
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      tipoCliente: 'VAREJO',
      tipoPessoa: 'FISICA',
      documento: '',
      ativo: true,
      endereco: { ...emptyEndereco },
    },
  })

  const tipoPessoaWatch = form.watch('tipoPessoa')
  const { clearErrors, getValues, handleSubmit, reset, setError, setValue } =
    form

  useEffect(() => {
    setStep(0)
    if (!editingId) {
      reset({
        nome: '',
        email: '',
        telefone: '',
        tipoCliente: 'VAREJO',
        tipoPessoa: 'FISICA',
        documento: '',
        ativo: true,
        endereco: { ...emptyEndereco },
      })
      return
    }
    if (!detail || String(detail.id) !== String(editingId)) return

    const first = detail.enderecos[0] ?? emptyEndereco
    const tipoPessoa = normalizeTipoPessoa(detail.tipoPessoa) ?? 'FISICA'
    const tipoCliente = normalizeTipoCliente(detail.tipoCliente) ?? 'VAREJO'
    reset({
      nome: detail.nome,
      email: normalizeEmail(detail.email),
      telefone: maskTelefoneBr(detail.telefone),
      tipoCliente,
      tipoPessoa,
      documento: maskCpfCnpj(detail.documento, tipoPessoa),
      ativo: detail.ativo,
      endereco: {
        cep: first.cep,
        estado: first.estado,
        cidade: first.cidade,
        bairro: first.bairro,
        logradouro: first.logradouro,
        numero: first.numero,
        complemento: first.complemento ?? '',
        pontoReferencia: first.pontoReferencia ?? '',
        observacoes: first.observacoes ?? '',
        enderecoPrincipal: first.enderecoPrincipal,
        tipoEndereco: first.tipoEndereco,
        apelido: first.apelido ?? '',
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset quando troca edição ou carrega GET
  }, [editingId, detail])

  useEffect(() => {
    const current = getValues('documento')
    const formatted = maskCpfCnpj(current, tipoPessoaWatch)
    if (formatted !== current) {
      setValue('documento', formatted, { shouldValidate: false })
    }
  }, [tipoPessoaWatch, getValues, setValue])

  function resetToEmpty() {
    reset({
      nome: '',
      email: '',
      telefone: '',
      tipoCliente: 'VAREJO',
      tipoPessoa: 'FISICA',
      documento: '',
      ativo: true,
      endereco: { ...emptyEndereco },
    })
    setStep(0)
  }

  async function goToAddressStep() {
    clearErrors()
    const parsed = customerPersonalStepSchema.safeParse(getValues())
    if (!parsed.success) {
      setFormErrorsFromZod(parsed.error, setError)
      return
    }
    setStep(1)
  }

  function goToPersonalStep() {
    clearErrors()
    setStep(0)
  }

  async function onSubmit(values: CustomerFormValues) {
    const parsed = customerSchema.safeParse(values)
    if (!parsed.success) {
      setFormErrorsFromZod(parsed.error, setError)
      const firstAddrIssue = parsed.error.issues.find((i) =>
        i.path.join('.').startsWith('endereco'),
      )
      if (firstAddrIssue) setStep(1)
      else setStep(0)
      return
    }

    if (editingId) {
      await updateCustomer.mutateAsync({ id: editingId, values: parsed.data })
      onSuccessfulSubmit?.()
    } else {
      await createCustomer.mutateAsync(parsed.data)
      resetToEmpty()
      onSuccessfulSubmit?.()
    }
  }

  const pending = createCustomer.isPending || updateCustomer.isPending

  if (editingId) {
    if (detailQuery.isError) {
      return (
        <ErrorState
          message={
            detailQuery.error instanceof Error
              ? detailQuery.error.message
              : 'Erro ao carregar cliente'
          }
          onRetry={() => void detailQuery.refetch()}
        />
      )
    }
    if (!detailMatches && (detailQuery.isPending || detailQuery.isFetching)) {
      return <LoadingState rows={8} />
    }
    if (!detailMatches) {
      return (
        <ErrorState
          message="Não foi possível carregar o cliente."
          onRetry={() => void detailQuery.refetch()}
        />
      )
    }
  }

  const steps = [
    { id: 0, label: 'Dados pessoais' },
    { id: 1, label: 'Endereço' },
  ] as const

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (step === 0) {
            void goToAddressStep()
            return
          }
          void handleSubmit(onSubmit)(e)
        }}
        className="flex flex-col gap-4"
      >
        <nav aria-label="Etapas do cadastro" className="flex gap-2">
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={cn(
                'flex flex-1 flex-col gap-1 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                step === s.id
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted/50',
              )}
              onClick={() => {
                if (i < step) {
                  clearErrors()
                  setStep(i)
                }
              }}
              disabled={i > step}
            >
              <span className="text-xs font-medium text-muted-foreground">
                Etapa {i + 1}
              </span>
              <span className="font-medium">{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="max-h-[min(65vh,520px)] overflow-y-auto overflow-x-hidden pr-1">
          <div
            className={cn(
              'grid gap-4 md:grid-cols-2',
              step !== 0 && 'hidden',
            )}
            aria-hidden={step !== 0}
          >
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="nome@exemplo.com.br"
                        {...field}
                        onChange={(e) =>
                          field.onChange(normalizeEmail(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (DDD + número)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="(49) 99999-9999"
                        {...field}
                        onChange={(e) =>
                          field.onChange(maskTelefoneBr(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipoCliente"
                render={({ field }) => {
                  const safeValue = normalizeTipoCliente(field.value) ?? ''
                  return (
                    <FormItem>
                      <FormLabel>Tipo de cliente</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={safeValue}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === 'REVENDA' ? 'REVENDA' : 'VAREJO',
                            )
                          }
                        >
                          <option value="" disabled>
                            Selecione
                          </option>
                          {TIPO_CLIENTE_OPTS.map((v) => (
                            <option key={v} value={v}>
                              {TIPO_CLIENTE_LABEL[v]}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name="tipoPessoa"
                render={({ field }) => {
                  const safeValue = normalizeTipoPessoa(field.value) ?? ''
                  return (
                    <FormItem>
                      <FormLabel>Tipo de pessoa</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={safeValue}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === 'JURIDICA' ? 'JURIDICA' : 'FISICA',
                            )
                          }
                        >
                          <option value="" disabled>
                            Selecione
                          </option>
                          {TIPO_PESSOA_OPTS.map((v) => (
                            <option key={v} value={v}>
                              {TIPO_PESSOA_LABEL[v]}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name="documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF ou CNPJ</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder={
                          tipoPessoaWatch === 'JURIDICA'
                            ? '00.000.000/0000-00'
                            : '000.000.000-00'
                        }
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            maskCpfCnpj(e.target.value, tipoPessoaWatch),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Ativo</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(v) => field.onChange(v === 'sim')}
                        value={field.value ? 'sim' : 'nao'}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="nao">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          <div
            className={cn(
              'grid gap-4 md:grid-cols-2',
              step !== 1 && 'hidden',
            )}
            aria-hidden={step !== 1}
          >
              <FormField
                control={form.control}
                name="endereco.cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="00000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco.estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input maxLength={2} placeholder="SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco.cidade"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco.bairro"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco.logradouro"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Logradouro</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco.numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco.complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco.apelido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apelido do endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Minha casa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco.tipoEndereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="ENTREGA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco.pontoReferencia"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Ponto de referência</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco.observacoes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">
            {step === 1 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={goToPersonalStep}
                disabled={pending}
              >
                Voltar
              </Button>
            ) : null}
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onDoneEdit?.()}
                disabled={pending}
              >
                Cancelar
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {step === 0 ? (
              <Button type="submit" disabled={pending}>
                Próximo: endereço
              </Button>
            ) : (
              <Button type="submit" disabled={pending}>
                {editingId ? 'Salvar alterações' : 'Cadastrar cliente'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}
