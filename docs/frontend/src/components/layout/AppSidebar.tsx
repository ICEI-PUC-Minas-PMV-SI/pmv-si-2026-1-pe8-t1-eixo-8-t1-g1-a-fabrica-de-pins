import { LayoutDashboard, Package, ShoppingCart, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/utils/cn'

const links = [
  { to: '/', label: 'Relatórios', icon: LayoutDashboard },
  { to: '/orders', label: 'Pedidos', icon: ShoppingCart },
  { to: '/products', label: 'Produtos', icon: Package },
  { to: '/customers', label: 'Clientes', icon: Users },
]

export function AppSidebar() {
  return (
    <aside className="flex w-56 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-3 py-4">
        <NavLink
          to="/"
          end
          className="block outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          <img
            src="/logo-afabricadepins.png"
            alt="@AFABRICADEPINS"
            className="h-auto w-full max-h-20 object-contain object-left"
            width={200}
            height={80}
            loading="eager"
            decoding="async"
          />
        </NavLink>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
