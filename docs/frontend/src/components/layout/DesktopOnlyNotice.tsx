import { MonitorSmartphone } from 'lucide-react'

import { MIN_DESKTOP_TABLET_WIDTH_PX } from '@/hooks/useViewport'

type DesktopOnlyNoticeProps = {
  width: number
  height: number
}

export function DesktopOnlyNotice({ width, height }: DesktopOnlyNoticeProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background px-6 py-10 text-center"
      role="alertdialog"
      aria-labelledby="desktop-only-title"
      aria-describedby="desktop-only-desc"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20">
        <MonitorSmartphone className="h-8 w-8" strokeWidth={1.5} aria-hidden />
      </div>
      <div className="max-w-md space-y-3">
        <h1 id="desktop-only-title" className="text-xl font-semibold tracking-tight text-foreground">
          Use um tablet ou computador
        </h1>
        <p id="desktop-only-desc" className="text-sm leading-relaxed text-muted-foreground">
          Esta aplicação de gestão foi desenhada para telas maiores. Acesse a partir de um tablet
          (modo paisagem ou tela larga) ou desktop para continuar.
        </p>
        <p className="text-xs tabular-nums text-muted-foreground/80">
          Largura atual: {Math.round(width)}px — mínimo sugerido: {MIN_DESKTOP_TABLET_WIDTH_PX}px
          <span className="sr-only">, altura {Math.round(height)} px</span>
        </p>
      </div>
    </div>
  )
}
