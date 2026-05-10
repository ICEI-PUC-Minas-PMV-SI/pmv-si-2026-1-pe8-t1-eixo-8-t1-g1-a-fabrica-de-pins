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
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { CategoriesManageDialog } from '@/modules/products/components/CategoriesManageDialog'
import { CategoryCreateDialog } from '@/modules/products/components/CategoryCreateDialog'
import { ProductForm } from '@/modules/products/components/ProductForm'
import { ProductTable } from '@/modules/products/components/ProductTable'
import { useProductsPageQuery } from '@/modules/products/hooks/useProducts'
import type { Product } from '@/types'

export function ProductsPage() {
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [categoryCreateOpen, setCategoryCreateOpen] = useState(false)
  const [categoriesManageOpen, setCategoriesManageOpen] = useState(false)
  const [page, setPage] = useState(0)
  const { data, isPending, isError, error, refetch } = useProductsPageQuery(page)

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
          <div className="flex flex-row flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle>Produtos</CardTitle>
              <CardDescription>
                O estoque diminui ao criar pedidos com pagamento confirmado ou em
                etapas posteriores (ex.: enviados); use{' '}
                <span className="font-medium text-foreground">
                  Editar produto
                </span>{' '}
                para ajustar estoque ou demais dados.
              </CardDescription>
            </div>
            <Button
              type="button"
              className="shrink-0 gap-2"
              onClick={openCreateProduct}
            >
              <Plus className="h-4 w-4" />
              Novo produto
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
