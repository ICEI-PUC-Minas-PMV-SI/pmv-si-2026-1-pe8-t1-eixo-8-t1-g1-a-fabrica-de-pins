import { useCallback, useEffect, useMemo, useState } from 'react'
/** Alinha ao breakpoint `md` do Tailwind (tablet em pé / desktop). */
export const MIN_DESKTOP_TABLET_WIDTH_PX = 768

function readSize() {
  if (typeof window === 'undefined') {
    return { width: MIN_DESKTOP_TABLET_WIDTH_PX, height: 800 }
  }
  return { width: window.innerWidth, height: window.innerHeight }
}

export function useViewport() {
  const [{ width, height }, setSize] = useState(readSize)

  const sync = useCallback(() => {
    setSize(readSize())
  }, [])

  useEffect(() => {
    sync()
    window.addEventListener('resize', sync)
    window.visualViewport?.addEventListener('resize', sync)
    return () => {
      window.removeEventListener('resize', sync)
      window.visualViewport?.removeEventListener('resize', sync)
    }
  }, [sync])

  const isDesktopOrTablet = width >= MIN_DESKTOP_TABLET_WIDTH_PX

  return useMemo(
    () => ({
      width,
      height,
      isDesktopOrTablet,
      minSupportedWidth: MIN_DESKTOP_TABLET_WIDTH_PX,
    }),
    [width, height, isDesktopOrTablet],
  )
}
