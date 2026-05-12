import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ViewportGate } from '@/app/layout/ViewportGate'
import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'
import '@/app/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <ViewportGate>
        <AppRouter />
      </ViewportGate>
    </AppProviders>
  </StrictMode>,
)
