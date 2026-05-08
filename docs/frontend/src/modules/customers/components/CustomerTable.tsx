import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Customer } from '@/types'

type CustomerTableProps = {
  data: Customer[]
  onEdit?: (c: Customer) => void
}

export function CustomerTable({ data, onEdit }: CustomerTableProps) {
  const columns: ColumnDef<Customer>[] = [
    { accessorKey: 'nome', header: 'Nome' },
    { accessorKey: 'email', header: 'E-mail' },
    {
      accessorKey: 'documento',
      header: 'Documento',
      cell: ({ row }) => {
        const d = row.original.documento
        if (d.length === 11) {
          return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
        }
        if (d.length === 14) {
          return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
        }
        return d
      },
    },
    {
      accessorKey: 'tipoCliente',
      header: 'Tipo',
    },
    {
      id: 'telefone',
      header: 'Telefone',
      cell: ({ row }) => row.original.telefone ?? '—',
    },
    {
      accessorKey: 'ativo',
      header: 'Ativo',
      cell: ({ row }) => (row.original.ativo ? 'Sim' : 'Não'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        onEdit ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            Editar
          </Button>
        ) : null,
    },
  ]

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
                Nenhum cliente.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
