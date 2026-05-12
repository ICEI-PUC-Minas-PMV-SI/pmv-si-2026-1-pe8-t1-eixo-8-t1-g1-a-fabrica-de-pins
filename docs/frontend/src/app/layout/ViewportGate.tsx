import type { ReactNode } from 'react'

import { DesktopOnlyNotice } from '@/components/layout/DesktopOnlyNotice'
import { useViewport } from '@/hooks/useViewport'

type ViewportGateProps = {
  children: ReactNode
}

export function ViewportGate({ children }: ViewportGateProps) {
  const { width, height, isDesktopOrTablet } = useViewport()

  if (!isDesktopOrTablet) {
    return <DesktopOnlyNotice width={width} height={height} />
  }

  return children
}
