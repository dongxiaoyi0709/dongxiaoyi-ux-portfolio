import { useEffect, useRef, useState } from 'react'
import type { PrismRenderer } from '../vendor/vgpu-prism/renderer'

type PrismState = 'idle' | 'loading' | 'ready' | 'fallback'

export default function PrismBackground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framingRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<PrismRenderer | null>(null)
  const [shouldStart, setShouldStart] = useState(false)
  const [state, setState] = useState<PrismState>('idle')

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (typeof IntersectionObserver === 'undefined') {
      setShouldStart(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      setShouldStart(true)
      observer.disconnect()
    }, { rootMargin: '160px 0px' })

    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!shouldStart) return

    const canvas = canvasRef.current
    if (!canvas || !('gpu' in navigator)) {
      setState('fallback')
      return
    }

    let cancelled = false
    setState('loading')

    void Promise.all([
      import('../vendor/vgpu-prism/renderer'),
      import('../vendor/vgpu-prism/types'),
    ]).then(async ([{ createRenderer }, { DEFAULT_PRISM_CONTROLS }]) => {
      if (cancelled) return

      const renderer = createRenderer({
        canvas,
        framingElement: framingRef.current ?? undefined,
        initialMode: 'light',
        initialQuality: 'auto',
        initialControls: {
          ...DEFAULT_PRISM_CONTROLS,
          wallColor: '#d2ccc2',
        },
        onError: (error) => console.error('Prism background rendering issue.', error),
      })

      rendererRef.current = renderer
      await renderer.ready
      if (!cancelled) setState('ready')
    }).catch((error: unknown) => {
      console.error('Prism background failed to initialize.', error)
      if (!cancelled) setState('fallback')
    })

    return () => {
      cancelled = true
      rendererRef.current?.dispose()
      rendererRef.current = null
    }
  }, [shouldStart])

  return <div ref={rootRef} className={`prism-background prism-background--${state}`} aria-hidden="true">
    <div className="prism-background__fallback" />
    <canvas ref={canvasRef} className="prism-background__canvas" />
    <div ref={framingRef} className="prism-background__frame" />
  </div>
}
