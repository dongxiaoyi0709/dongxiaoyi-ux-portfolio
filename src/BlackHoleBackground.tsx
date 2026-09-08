import { useEffect, useRef, useState } from 'react'

type Renderer = ReturnType<typeof import('../optimized-black-hole/renderer').createRenderer>
type RenderState = 'idle' | 'loading' | 'ready' | 'fallback'

function initialRenderState(): RenderState {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'fallback'
  return 'gpu' in navigator && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'idle'
    : 'fallback'
}

export default function BlackHoleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<RenderState>(initialRenderState)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (initialRenderState() === 'fallback') return

    let cancelled = false
    let started = false
    let renderer: Renderer | undefined

    const start = async () => {
      if (started || cancelled) return
      started = true
      setState('loading')

      try {
        const { createRenderer } = await import('../optimized-black-hole/renderer')
        if (cancelled) return
        renderer = createRenderer({ canvas })
        await renderer.ready
        if (!cancelled) setState('ready')
      } catch {
        renderer?.dispose()
        renderer = undefined
        if (!cancelled) setState('fallback')
      }
    }

    const observer = typeof IntersectionObserver === 'undefined'
      ? undefined
      : new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              observer?.disconnect()
              void start()
            }
          },
          { rootMargin: '480px 0px' },
        )

    if (observer) observer.observe(canvas)
    else void start()

    return () => {
      cancelled = true
      observer?.disconnect()
      renderer?.dispose()
    }
  }, [])

  return (
    <div className={`contact-black-hole contact-black-hole--${state}`} aria-hidden="true">
      <div className="contact-black-hole__fallback" />
      <canvas ref={canvasRef} className="contact-black-hole__canvas" />
    </div>
  )
}
