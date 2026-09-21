import { useEffect, useRef, useState } from 'react'
import type { PrismRenderer } from '../vendor/vgpu-prism/renderer'
import PrismVideoFallback from './PrismVideoFallback'
import useMediaQuery from './useMediaQuery'

type PrismState = 'idle' | 'loading' | 'ready' | 'fallback'

export default function PrismBackground() {
  // Use the existing mobile layout breakpoint, plus touch-only devices in landscape.
  // Static mode never mounts a canvas, imports WebGPU, or requests a video.
  const staticOnly = useMediaQuery('(max-width: 767px), (hover: none) and (pointer: coarse), (prefers-reduced-motion: reduce)')

  if (staticOnly) {
    return <div className="prism-background prism-background--static">
      <PrismVideoFallback enabled={false} />
    </div>
  }

  return <InteractivePrismBackground />
}

function InteractivePrismBackground() {
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
    let failed = false
    setState('loading')

    const fallBack = () => {
      failed = true
      if (!cancelled) setState('fallback')
    }
    // Keep the poster visible while loading. Slow imports/adapter startup must not
    // permanently replace the desktop's mouse interaction with a looping video.
    void Promise.all([
      import('../vendor/vgpu-prism/renderer'),
      import('../vendor/vgpu-prism/types'),
    ]).then(async ([{ createRenderer }, { DEFAULT_PRISM_CONTROLS }]) => {
      if (cancelled || failed) return

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
        onFatalError: fallBack,
      })

      rendererRef.current = renderer
      await renderer.ready
      if (!cancelled && !failed) setState('ready')
    }).catch((error: unknown) => {
      console.error('Prism background failed to initialize.', error)
      fallBack()
    })

    return () => {
      cancelled = true
      rendererRef.current?.dispose()
      rendererRef.current = null
    }
  }, [shouldStart])

  return <div ref={rootRef} className={`prism-background prism-background--${state}`}>
    <PrismVideoFallback enabled={state === 'fallback'} />
    <canvas ref={canvasRef} className="prism-background__canvas" aria-hidden="true" />
    <div ref={framingRef} className="prism-background__frame" aria-hidden="true" />
  </div>
}
