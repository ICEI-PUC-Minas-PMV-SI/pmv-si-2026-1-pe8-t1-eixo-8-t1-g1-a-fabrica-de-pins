import { Layers, Plus, Tags } from 'lucide-react'
import { useEffect, useState } from 'react'

import { TablePaginationBar } from '@/components/layout/TablePaginationBar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { CategoriesManageDialog } from '@/modules/products/components/CategoriesManageDialog'
import { CategoryCreateDialog } from '@/modules/products/components/CategoryCreateDialog'
import { ProductForm } from '@/modules/products/components/ProductForm'
import { ProductTable } from '@/modules/products/components/ProductTable'
import { useProductsPageQuery } from '@/modules/products/hooks/useProducts'
import { tipoEstoqueLabel, type TipoEstoqueProduto } from '@/schemas/product.schema'
import type { Product } from '@/types'

const TIPOS_ESTOQUE_FILTRO: TipoEstoqueProduto[] = [
  'ESTOQUE',
  'SOB_DEMANDA',
  'PRE_VENDA',
]

export function ProductsPage() {
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [categoryCreateOpen, setCategoryCreateOpen] = useState(false)
  const [categoriesManageOpen, setCategoriesManageOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [tipoEstoqueFiltro, setTipoEstoqueFiltro] = useState<
    'all' | TipoEstoqueProduto
  >('all')
  const { data, isPending, isError, error, refetch } = useProductsPageQuery(
    page,
    tipoEstoqueFiltro === 'all' ? undefined : tipoEstoqueFiltro,
  )

  useEffect(() => {
    setPage(0)
  }, [tipoEstoqueFiltro])

  useEffect(() => {
    if (!data || data.totalPages === 0) return
    if (page > data.totalPages - 1) {
      setPage(Math.max(0, data.totalPages - 1))
    }
  }, [data, page])

  function closeProductDialog() {
    setProductDialogOpen(false)
    setEditingProductId(null)
  }

  function openCreateProduct() {
    setEditingProductId(null)
    setProductDialogOpen(true)
  }

  function openEditProduct(p: Product) {
    setEditingProductId(p.id)
    setProductDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <CardTitle>Produtos</CardTitle>
            <Button
              type="button"
              className="shrink-0 gap-2"
              onClick={openCreateProduct}
            >
              <Plus className="h-4 w-4" />
              Novo produto
            </Button>
          </div>

          <CardDescription className="max-w-[46rem] text-pretty">
            O estoque diminui ao criar pedidos com pagamento confirmado ou em
            etapas posteriores (ex.: enviados); use{' '}
            <span className="font-medium text-foreground">Editar produto</span>{' '}
            para ajustar estoque ou demais dados.
          </CardDescription>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="flex w-full min-w-0 max-w-[11rem] flex-col gap-2 self-start sm:w-auto sm:shrink-0">
              <Label htmlFor="filtro-tipo-estoque">Tipo de estoque</Label>
              <Select
                value={tipoEstoqueFiltro}
                onValueChange={(v) =>
                  setTipoEstoqueFiltro(v as 'all' | TipoEstoqueProduto)
                }
              >
                <SelectTrigger id="filtro-tipo-estoque">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {TIPOS_ESTOQUE_FILTRO.map((k) => (
                    <SelectItem key={k} value={k}>
                      {tipoEstoqueLabel[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap justify-end gap-2 self-end sm:ml-auto sm:shrink-0">
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-2"
                onClick={() => setCategoryCreateOpen(true)}
              >
                <Tags className="h-4 w-4" />
                Criar categoria
              </Button>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-2"
                onClick={() => setCategoriesManageOpen(true)}
              >
                <Layers className="h-4 w-4" />
                Gerenciar categorias
              </Button>
              <CategoryCreateDialog
                open={categoryCreateOpen}
                onOpenChange={setCategoryCreateOpen}
              />
              <CategoriesManageDialog
                open={categoriesManageOpen}
                onOpenChange={setCategoriesManageOpen}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isPending ? <LoadingState rows={6} /> : null}
          {isError ? (
            <ErrorState
              message={
                error instanceof Error ? error.message : 'Erro desconhecido'
              }
              onRetry={() => void refetch()}
            />
          ) : null}
          {!isPending && !isError && data ? (
            <div className="flex flex-col gap-4">
              <ProductTable data={data.content} onEdit={openEditProduct} />
              <TablePaginationBar
                pageIndex={data.page}
                pageSize={data.pageSize}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                rowCount={data.content.length}
                isFirst={data.first}
                isLast={data.last}
                isPending={isPending}
                emptyMessage="Nenhum produto."
                onPrev={() => setPage((p) => Math.max(0, p - 1))}
                onNext={() => setPage((p) => p + 1)}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={productDialogOpen}
        onOpenChange={(open) => {
          setProductDialogOpen(open)
          if (!open) setEditingProductId(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProductId ? 'Editar produto' : 'Novo produto'}
            </DialogTitle>
            <DialogDescription>
              Cadastrar ou editar produto.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            editingProductId={editingProductId}
            onSuccessfulSubmit={() => {
              const wasCreate = editingProductId === null
              closeProductDialog()
              if (wasCreate) setPage(0)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
