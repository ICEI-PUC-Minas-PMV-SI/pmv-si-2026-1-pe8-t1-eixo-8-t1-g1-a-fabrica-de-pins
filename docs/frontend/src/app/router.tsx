import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { AppShell } from '@/app/layout/AppShell'
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { CustomersPage } from '@/modules/customers/pages/CustomersPage'
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage'
import { OrdersPage } from '@/modules/orders/pages/OrdersPage'
import { ProductsPage } from '@/modules/products/pages/ProductsPage'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'customers', element: <CustomersPage /> },
          { path: 'orders', element: <OrdersPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
