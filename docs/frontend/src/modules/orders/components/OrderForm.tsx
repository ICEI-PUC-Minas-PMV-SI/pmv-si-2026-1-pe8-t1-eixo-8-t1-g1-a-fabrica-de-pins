import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

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
import { useCustomersQuery } from '@/modules/customers/hooks/useCustomers'
import { useCuponsQuery } from '@/modules/orders/hooks/useCupons'
import {
  useCreateOrderMutation,
  useOrderQuery,
  useUpdatePedidoCompletoMutation,
} from '@/modules/orders/hooks/useOrders'
import {
  canalAquisicaoLabel,
  KANBAN_COLUMN_ORDER,
  modalidadeLabel,
  orderStatusLabel,
} from '@/modules/orders/lib/order-labels'
import {
  estimateDescontoCupons,
  totalPedidoPreview,
} from '@/modules/orders/lib/order-totals'
import { useProductsQuery } from '@/modules/products/hooks/useProducts'
import {
  orderCreateSchema,
  type OrderCreateInput,
  type OrderCreateValues,
} from '@/schemas/order.schema'
import type { Cupom, Order } from '@/types'
import { cn } from '@/utils/cn'
import { formatCurrencyBRL } from '@/utils/format'

function emptyItem() {
  return {
    produtoId: '',
    quantidade: 1,
    precoUnitario: 1,
  }
}

function orderToFormValues(o: Order): OrderCreateValues {
  const itens =
    o.itens.length > 0
      ? o.itens.map((i) => ({
          produtoId: i.produtoId,
          quantidade: i.quantidade,
          precoUnitario: i.precoUnitario,
        }))
      : [emptyItem()]
  return {
    clienteId: o.clienteId,
    status: o.status,
    modalidade: o.modalidade,
    canalAquisicao: o.canalAquisicao,
    observacao: o.observacao ?? '',
    valorFrete: o.valorFrete ?? 0,
    cupons: o.cupomCodigos ?? [],
    itens,
  }
}

type OrderFormProps = {
  mode?: 'create' | 'edit'
  /** ID do pedido — obrigatório em modo edição (carrega `GET /admin/pedido/{id}`). */
  orderId?: string | null
  onSuccess?: () => void
}

export function OrderForm({
  mode = 'create',
  orderId = null,
  onSuccess,
}: OrderFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEdit = mode === 'edit'
  const { data: customers } = useCustomersQuery()
  const { data: products } = useProductsQuery()
  const { data: cuponsDisponiveis } = useCuponsQuery()
  const createOrder = useCreateOrderMutation()
  const updatePedido = useUpdatePedidoCompletoMutation()
  const {
    data: orderDetail,
    isPending: detailPending,
    isError: detailError,
    error: detailErr,
    refetch: refetchDetail,
  } = useOrderQuery(isEdit ? orderId : null)

  const form = useForm<OrderCreateInput, unknown, OrderCreateValues>({
    resolver: zodResolver(orderCreateSchema),
    defaultValues: {
      clienteId: '',
      status: 'rascunho',
      modalidade: 'pronta_entrega',
      canalAquisicao: 'site',
      observacao: '',
      valorFrete: 0,
      cupons: [],
      itens: [emptyItem()],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'itens',
  })

  const control = form.control
  const itensW = useWatch({ control, name: 'itens' }) ?? []
  const valorFreteW = useWatch({ control, name: 'valorFrete' }) ?? 0
  const cuponsW = useWatch({ control, name: 'cupons' }) ?? []

  const produtoIdsKey = itensW.map((i) => i.produtoId).join('|')

  const cuponsAtivos = useMemo(
    () => cuponsDisponiveis?.filter((c) => c.ativo) ?? [],
    [cuponsDisponiveis],
  )

  const cuponsMap = useMemo(() => {
    const m = new Map<string, Cupom>()
    cuponsDisponiveis?.forEach((c) => {
      m.set(c.codigo.trim().toUpperCase(), c)
      m.set(c.codigo.trim(), c)
    })
    return m
  }, [cuponsDisponiveis])

  useLayoutEffect(() => {
    if (!isEdit || !orderDetail) return
    form.reset(orderToFormValues(orderDetail))
  }, [isEdit, orderDetail, form])

  function toggleCupomCodigo(codigo: string, checked: boolean) {
    const cur = form.getValues('cupons') ?? []
    if (checked) {
      if (!cur.includes(codigo)) {
        form.setValue('cupons', [...cur, codigo], { shouldValidate: true })
      }
    } else {
      form.setValue(
        'cupons',
        cur.filter((x) => x !== codigo),
        { shouldValidate: true },
      )
    }
  }

  useEffect(() => {
    if (!products?.length) return
    const rows = form.getValues('itens')
    rows.forEach((item, index) => {
      if (!item.produtoId) return
      const p = products.find((x) => x.id === item.produtoId)
      if (!p) return
      const cur = form.getValues(`itens.${index}.precoUnitario`)
      if (cur !== p.preco) {
        form.setValue(`itens.${index}.precoUnitario`, p.preco, {
          shouldValidate: false,
        })
      }
    })
  }, [produtoIdsKey, fields.length, products, form])

  const subtotalItens = useMemo(() => {
    if (!itensW?.length) return 0
    return itensW.reduce((acc, row) => {
      const q = Number(row?.quantidade) || 0
      const pu = Number(row?.precoUnitario) || 0
      const pid = row?.produtoId
      if (!pid || q <= 0 || pu <= 0) return acc
      return acc + q * pu
    }, 0)
  }, [itensW])

  const freteNum = Math.max(0, Number(valorFreteW) || 0)

  const descontoEstimado = useMemo(
    () =>
      estimateDescontoCupons(subtotalItens, cuponsW ?? [], cuponsMap),
    [subtotalItens, cuponsW, cuponsMap],
  )

  const totalPreview = totalPedidoPreview(
    subtotalItens,
    freteNum,
    descontoEstimado,
  )

  async function onSubmit(values: OrderCreateValues) {
    setSubmitError(null)
    if (!products?.length) return

    const itensResolved: OrderCreateValues['itens'] = []
    for (const row of values.itens) {
      const p = products.find((x) => x.id === row.produtoId)
      if (!p) {
        setSubmitError('Selecione um produto válido em todas as linhas.')
        return
      }
      itensResolved.push({
        produtoId: p.id,
        quantidade: row.quantidade,
        precoUnitario: p.preco,
      })
    }

    const payload: OrderCreateValues = {
      ...values,
      itens: itensResolved,
    }

    try {
      if (isEdit && orderId) {
        await updatePedido.mutateAsync({ id: orderId, input: payload })
      } else {
        await createOrder.mutateAsync(payload)
        form.reset({
          clienteId: '',
          status: 'rascunho',
          modalidade: 'pronta_entrega',
          canalAquisicao: 'site',
          observacao: '',
          valorFrete: 0,
          cupons: [],
          itens: [emptyItem()],
        })
      }
      onSuccess?.()
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : 'Erro ao salvar o pedido.',
      )
    }
  }

  const pending =
    createOrder.isPending ||
    updatePedido.isPending ||
    (isEdit && detailPending)

  if (isEdit && detailError) {
    return (
      <ErrorState
        message={
          detailErr instanceof Error ? detailErr.message : 'Erro ao carregar'
        }
        onRetry={() => void refetchDetail()}
      />
    )
  }

  if (isEdit && detailPending && !orderDetail) {
    return <LoadingState rows={8} />
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-5 md:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="clienteId"
          render={({ field }) => {
            const selected = customers?.find((c) => c.id === field.value)
            const selectedLabel =
              selected?.nome || orderDetail?.clienteNome || undefined
            const selectedMissing =
              Boolean(field.value) && !selected && Boolean(selectedLabel)

            return (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isEdit}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione">
                        {selectedLabel}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedMissing ? (
                      <SelectItem value={field.value}>{selectedLabel}</SelectItem>
                    ) : null}
                    {customers?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name="valorFrete"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do frete (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? 0 : e.target.value)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacao"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Observação</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={3}
                  placeholder="Opcional"
                  className={cn(
                    'flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2 rounded-xl border border-border bg-muted/20 p-4 ring-1 ring-border/50">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Itens do pedido
              </h3>
              <p className="text-xs text-muted-foreground">
                Adicione uma ou mais linhas — cada linha é um produto diferente ou
                outra quantidade.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => append(emptyItem())}
            >
              <Plus className="h-4 w-4" />
              Adicionar produto
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {fields.map((field, index) => {
              const pid = form.watch(`itens.${index}.produtoId`)
              const qtd = Number(form.watch(`itens.${index}.quantidade`)) || 0
              const pu = Number(form.watch(`itens.${index}.precoUnitario`)) || 0
              const produto = products?.find((p) => p.id === pid)
              const subtotal =
                pid && qtd > 0 && pu > 0 ? qtd * pu : 0

              return (
                <div
                  key={field.id}
                  className="rounded-lg border border-border/80 bg-card p-4 shadow-sm"
                >
                  <div className="grid gap-4 sm:grid-cols-[1fr_minmax(0,100px)_auto] sm:items-end">
                    <FormField
                      control={form.control}
                      name={`itens.${index}.produtoId`}
                      render={({ field: f }) => {
                        const selectedProduct = products?.find(
                          (p) => p.id === f.value,
                        )
                        const selectedProductLabel = selectedProduct
                          ? `${selectedProduct.nome} — ${selectedProduct.preco.toFixed(2)}`
                          : f.value
                            ? `Produto #${f.value}`
                            : undefined
                        const selectedMissing =
                          Boolean(f.value) && !selectedProduct

                        return (
                          <FormItem>
                            <FormLabel>Produto</FormLabel>
                            <Select
                              onValueChange={f.onChange}
                              value={f.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione">
                                    {selectedProductLabel}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectedMissing ? (
                                  <SelectItem value={f.value}>
                                    {selectedProductLabel}
                                  </SelectItem>
                                ) : null}
                                {products?.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.nome} — {p.preco.toFixed(2)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                    <FormField
                      control={form.control}
                      name={`itens.${index}.quantidade`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Qtd.</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              step={1}
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 sm:flex-col sm:justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        disabled={fields.length <= 1}
                        onClick={() => remove(index)}
                        aria-label="Remover linha"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-sm">
                    <span className="text-muted-foreground">
                      {produto ? (
                        <>
                          Unit.{' '}
                          <strong className="text-foreground tabular-nums">
                            {produto.preco.toFixed(2)}
                          </strong>
                        </>
                      ) : (
                        'Selecione um produto.'
                      )}
                    </span>
                    <span className="tabular-nums">
                      Subtotal:{' '}
                      <strong className="text-foreground">
                        {formatCurrencyBRL(subtotal)}
                      </strong>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between gap-4 tabular-nums">
              <span className="text-muted-foreground">Subtotal dos itens</span>
              <span>{formatCurrencyBRL(subtotalItens)}</span>
            </div>
            <div className="flex justify-between gap-4 tabular-nums">
              <span className="text-muted-foreground">Frete</span>
              <span>{formatCurrencyBRL(freteNum)}</span>
            </div>
            <div className="flex justify-between gap-4 tabular-nums">
              <span className="text-muted-foreground">
                Desconto (estimado)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                − {formatCurrencyBRL(descontoEstimado)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              O valor final pode ser recalculado no servidor conforme regras dos
              cupons e do pedido.
            </p>
            <div className="flex justify-end border-t border-border pt-3">
              <p className="text-base font-semibold tabular-nums">
                Total do pedido:{' '}
                <span className="text-primary">
                  {formatCurrencyBRL(totalPreview)}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 rounded-xl border border-border bg-muted/20 p-4 ring-1 ring-border/50">
          <h3 className="text-sm font-semibold text-foreground">Cupons</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Marque os cupons ativos a aplicar neste pedido (códigos enviados à API).
          </p>
          {cuponsAtivos.length ? (
            <ul className="mt-3 flex flex-col gap-2">
              {cuponsAtivos.map((c) => (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 shrink-0 rounded border-input"
                      checked={cuponsW.includes(c.codigo)}
                      onChange={(e) =>
                        toggleCupomCodigo(c.codigo, e.target.checked)
                      }
                    />
                    <span>
                      <span className="font-medium">{c.codigo}</span>
                      <span className="text-muted-foreground">
                        {' '}
                        —{' '}
                        {c.tipoDesconto === 'PERCENTUAL'
                          ? `${c.valorDesconto}%`
                          : formatCurrencyBRL(c.valorDesconto)}
                        {c.dataValidade ? ` · válido até ${c.dataValidade}` : ''}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhum cupom ativo. Use &quot;Criar cupom&quot; na página de pedidos.
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="modalidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modalidade</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pronta_entrega">
                    {modalidadeLabel.pronta_entrega}
                  </SelectItem>
                  <SelectItem value="pre_venda">
                    {modalidadeLabel.pre_venda}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="canalAquisicao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Canal de aquisição</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(
                    Object.entries(canalAquisicaoLabel) as [
                      keyof typeof canalAquisicaoLabel,
                      string,
                    ][]
                  ).map(([k, label]) => (
                    <SelectItem key={k} value={k}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Pré-preenchido pelo canal preferido do cliente quando possível.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {KANBAN_COLUMN_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {orderStatusLabel[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Após o{' '}
                <strong className="font-medium text-foreground">
                  pagamento confirmado
                </strong>
                , o fluxo segue produção e envio. Rascunho e cancelado não
                abatem estoque da mesma forma que pedidos já pagos ou expedidos
                (conforme regras do sistema).
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        {submitError ? (
          <p className="md:col-span-2 text-sm text-destructive" role="alert">
            {submitError}
          </p>
        ) : null}
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending
              ? 'Salvando…'
              : isEdit
                ? 'Salvar alterações'
                : 'Criar pedido'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
