import { LogOut, User } from 'lucide-react'
import { useMatches } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/modules/auth/context/AuthContext'

function titleFromPath(pathname: string): string {
  if (pathname.startsWith('/products')) return 'Produtos'
  if (pathname.startsWith('/customers')) return 'Clientes'
  if (pathname.startsWith('/orders')) return 'Pedidos'
  return 'Relatórios'
}

export function AppHeader() {
  const matches = useMatches()
  const pathname =
    matches[matches.length - 1]?.pathname ??
    (typeof window !== 'undefined' ? window.location.pathname : '/')
  const title = titleFromPath(pathname)
  const { logout } = useAuth()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <Separator orientation="vertical" className="hidden h-6 sm:block" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            Conta
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
