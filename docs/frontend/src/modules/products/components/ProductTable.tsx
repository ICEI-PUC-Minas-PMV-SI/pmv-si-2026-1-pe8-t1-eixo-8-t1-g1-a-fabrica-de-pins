import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Product } from '@/types'
import { formatCurrencyBRL } from '@/utils/format'

const baseColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
  },
  {
    accessorKey: 'precoVarejo',
    header: 'Preço varejo',
    cell: ({ getValue }) => formatCurrencyBRL(getValue() as number),
  },
  {
    accessorKey: 'categoria',
    header: 'Categoria',
  },
  {
    accessorKey: 'estoque',
    header: 'Estoque',
  },
  {
    accessorKey: 'estoqueMinimo',
    header: 'Mínimo',
  },
  {
    id: 'alerta',
    header: 'Situação',
    cell: ({ row }) =>
      row.original.estoque < row.original.estoqueMinimo ? (
        <span className="font-medium text-destructive">Abaixo do mínimo</span>
      ) : (
        <span className="text-muted-foreground">OK</span>
      ),
  },
]

type ProductTableProps = {
  data: Product[]
  onEdit?: (p: Product) => void
}

export function ProductTable({ data, onEdit }: ProductTableProps) {
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      ...baseColumns,
      {
        id: 'acoes',
        header: () => <span className="sr-only">Ações</span>,
        cell: ({ row }) =>
          onEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(row.original)}
            >
              Editar produto
            </Button>
          ) : null,
      },
    ],
    [onEdit],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Nenhum produto cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
