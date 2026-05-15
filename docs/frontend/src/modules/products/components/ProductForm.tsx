import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
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
import {
  useCreateProductMutation,
  useProductDetailQuery,
  useUpdateProductMutation,
} from '@/modules/products/hooks/useProducts'
import {
  productSchema,
  tipoEstoqueLabel,
  type ProductFormValues,
} from '@/schemas/product.schema'
import { listCategoriesPage } from '@/services/categories.api'
import type { Product } from '@/types'
import { toDateInputValue } from '@/utils/format'

function collectErrorMessages(
  errors: FieldErrors<ProductFormValues>,
): string[] {
  const out: string[] = []
  function walk(e: unknown): void {
    if (!e || typeof e !== 'object') return
    const o = e as Record<string, unknown>
    if (typeof o.message === 'string' && o.message) {
      out.push(o.message)
      return
    }
    for (const v of Object.values(o)) {
      walk(v)
    }
  }
  walk(errors)
  return [...new Set(out)]
}

const TIPOS_ESTOQUE: ProductFormValues['tipoEstoque'][] = [
  'ESTOQUE',
  'SOB_DEMANDA',
  'PRE_VENDA',
]

function normalizeTipoEstoque(raw: string): ProductFormValues['tipoEstoque'] {
  const cleaned = raw.trim()
  const t = TIPOS_ESTOQUE.find((x) => x === cleaned)
  if (t) return t
  const token = cleaned
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-/g, '_')
    .toUpperCase()
  if (token === 'SOB_DEMANDA' || token === 'SOBDEMANDA') return 'SOB_DEMANDA'
  if (token === 'PRE_VENDA' || token === 'PREVENDA') return 'PRE_VENDA'
  if (token === 'ESTOQUE') return 'ESTOQUE'
  return 'ESTOQUE'
}

function emptyProductValues(): ProductFormValues {
  return {
    nome: '',
    descricao: '',
    tipoEstoque: 'ESTOQUE',
    quantidadeEstoque: 0,
    estoqueMinimo: 0,
    precoVarejo: 0,
    precoRevenda: 0,
    custoProducao: 0,
    dataPrevistaLancamento: '',
    sku: '',
    imgUrl: '',
    peso: 0,
    altura: 0,
    largura: 0,
    comprimento: 0,
    ativo: true,
    categoriaId: 0,
  }
}

function productToFormValues(p: Product): ProductFormValues {
  return {
    nome: p.nome,
    descricao: p.descricao,
    tipoEstoque: normalizeTipoEstoque(p.tipoEstoque),
    quantidadeEstoque: p.quantidadeEstoque,
    estoqueMinimo: p.estoqueMinimo,
    precoVarejo: p.precoVarejo,
    precoRevenda: p.precoRevenda,
    custoProducao: p.custoProducao,
    dataPrevistaLancamento: toDateInputValue(p.dataPrevistaLancamento),
    sku: p.sku,
    imgUrl: p.imgUrl,
    peso: p.peso,
    altura: p.altura,
    largura: p.largura,
    comprimento: p.comprimento,
    ativo: p.ativo,
    categoriaId: p.categoriaId > 0 ? p.categoriaId : 0,
  }
}

type ProductFormProps = {
  editingProductId?: string | null
  onSuccessfulSubmit?: () => void
}

export function ProductForm({
  editingProductId = null,
  onSuccessfulSubmit,
}: ProductFormProps) {
  /** Evita mismatch string/number no GET e no PUT. */
  const editingKey =
    editingProductId != null && String(editingProductId).trim() !== ''
      ? String(editingProductId)
      : null

  const createProduct = useCreateProductMutation()
  const updateProduct = useUpdateProductMutation()
  const detailQuery = useProductDetailQuery(editingKey)

  const detail = detailQuery.data
  const detailMatches = Boolean(
    editingKey && detail && String(detail.id) === editingKey,
  )

  /**
   * Carrega a lista ao montar (novo produto) ou após o GET do produto (edição), para o Radix Select
   * exibir o valor — exige um SelectItem com o mesmo `value` que o formulário.
   */
  const categoriesQuery = useQuery({
    queryKey: ['categories', 'select-list'],
    queryFn: async () => {
      const meta = await listCategoriesPage(0, 500)
      return meta.content
    },
    enabled: !editingKey || detailMatches,
    staleTime: 60_000,
  })

  const [submitErrorMessages, setSubmitErrorMessages] = useState<string[]>([])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyProductValues(),
    mode: 'onSubmit',
    shouldFocusError: true,
  })

  useLayoutEffect(() => {
    setSubmitErrorMessages([])
    if (!editingKey) {
      form.reset(emptyProductValues())
      return
    }
    if (!detail || String(detail.id) !== editingKey) return
    form.reset(productToFormValues(detail))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset quando troca edição ou carrega GET
  }, [editingKey, detail])

  useEffect(() => {
    if (!editingKey || !detail || !categoriesQuery.data?.length) return
    const currentCategoriaId = form.getValues('categoriaId')
    if (currentCategoriaId > 0) return

    const categoriaNome = detail.categoria?.trim().toLowerCase()
    if (!categoriaNome) return

    const match = categoriesQuery.data.find(
      (c) => c.nome.trim().toLowerCase() === categoriaNome,
    )
    if (!match) return

    form.setValue('categoriaId', Number(match.id), {
      shouldValidate: true,
      shouldDirty: false,
    })
  }, [editingKey, detail, categoriesQuery.data, form])

  async function submitProduct(values: ProductFormValues) {
    setSubmitErrorMessages([])
    try {
      if (editingKey) {
        await updateProduct.mutateAsync({ id: editingKey, values })
      } else {
        await createProduct.mutateAsync(values)
        form.reset(emptyProductValues())
      }
      onSuccessfulSubmit?.()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível salvar o produto.'
      setSubmitErrorMessages([msg])
    }
  }

  const submit = form.handleSubmit(
    submitProduct,
    (errors) => {
      setSubmitErrorMessages(collectErrorMessages(errors))
    },
  )

  const pending = createProduct.isPending || updateProduct.isPending

  if (editingKey) {
    if (detailQuery.isError) {
      return (
        <ErrorState
          message={
            detailQuery.error instanceof Error
              ? detailQuery.error.message
              : 'Erro ao carregar produto'
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
          message="Não foi possível carregar o produto."
          onRetry={() => void detailQuery.refetch()}
        />
      )
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void submit(e)
        }}
        className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
      >
        {submitErrorMessages.length > 0 ? (
          <Alert variant="destructive" className="sm:col-span-2">
            <AlertTitle>Corrija os campos</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc text-sm">
                {submitErrorMessages.map((msg, i) => (
                  <li key={`${i}-${msg}`}>{msg}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoriaId"
          render={({ field }) => {
            const idStr = field.value > 0 ? String(field.value) : ''
            const selectedFromList = categoriesQuery.data?.find(
              (c) => String(c.id) === idStr,
            )?.nome
            const selectedFromDetail =
              editingKey && detail && String(detail.categoriaId) === idStr
                ? detail.categoria
                : ''
            const selectedCategoryLabel =
              selectedFromList || selectedFromDetail || `Categoria #${idStr}`
            const selectedMissing =
              Boolean(idStr) &&
              !categoriesQuery.data?.some((c) => String(c.id) === idStr)

            return (
              <FormItem className="sm:col-span-2">
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={idStr}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={categoriesQuery.isFetching && !categoriesQuery.data}
                  >
                    <option value="" disabled>
                      {categoriesQuery.isFetching && !categoriesQuery.data
                        ? 'Carregando categorias...'
                        : 'Selecione a categoria'}
                    </option>

                    {selectedMissing ? (
                      <option value={idStr}>{selectedCategoryLabel}</option>
                    ) : null}

                    {categoriesQuery.data?.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.nome}
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
          name="tipoEstoque"
          render={({ field }) => {
            const stockValue = normalizeTipoEstoque(String(field.value ?? ''))
            return (
              <FormItem>
                <FormLabel>Tipo de estoque</FormLabel>
                <FormControl>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={stockValue}
                    onChange={(e) => {
                      const next = normalizeTipoEstoque(e.target.value)
                      field.onChange(next)
                    }}
                  >
                    {TIPOS_ESTOQUE.map((k) => (
                      <option key={k} value={k}>
                        {tipoEstoqueLabel[k]}
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
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input placeholder="Código SKU" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantidadeEstoque"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade em estoque</FormLabel>
              <FormControl>
                <Input type="number" min={0} step={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estoqueMinimo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estoque mínimo</FormLabel>
              <FormControl>
                <Input type="number" min={0} step={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="precoVarejo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço varejo (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="precoRevenda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço revenda (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="custoProducao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custo de produção (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.0001" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dataPrevistaLancamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data prevista de lançamento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imgUrl"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>URL / caminho da imagem (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Opcional — ex.: images/produto-123.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="peso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peso (g)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="altura"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Altura (mm)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="largura"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Largura (mm)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comprimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comprimento (mm)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ativo</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(v === 'sim')}
                value={field.value ? 'sim' : 'nao'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-end sm:col-span-2">
          <Button
            type="button"
            disabled={pending}
            onClick={(e) => {
              e.preventDefault()
              void submit(e)
            }}
          >
            {pending
              ? 'Salvando…'
              : editingKey
                ? 'Salvar alterações'
                : 'Cadastrar produto'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
