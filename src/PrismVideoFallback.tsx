import { useCallback, useEffect, useRef, useState } from 'react'
import useMediaQuery from './useMediaQuery'

function CompatibilityVideo({ mobile }: { mobile: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const visibleRef = useRef(true)
  const pendingRef = useRef(false)
  const requestRef = useRef(0)
  const mountedRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [failed, setFailed] = useState(false)

  const play = useCallback(() => {
    const video = videoRef.current
    if (!video || pendingRef.current || !visibleRef.current || document.hidden) return
    // Keep this call synchronous with a button click when autoplay is denied.
    video.muted = true
    pendingRef.current = true
    const request = ++requestRef.current
    void video.play().catch(() => {
      if (mountedRef.current && request === requestRef.current) {
        setBlocked(true)
      }
    }).finally(() => {
      if (request === requestRef.current) pendingRef.current = false
    })
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    mountedRef.current = true
    const syncPlayback = () => {
      if (visibleRef.current && !document.hidden) play()
      else {
        ++requestRef.current
        pendingRef.current = false
        video.pause()
      }
    }
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      visibleRef.current = entry?.isIntersecting ?? false
      syncPlayback()
    })
    observer?.observe(video)
    document.addEventListener('visibilitychange', syncPlayback)
    syncPlayback()
    return () => {
      mountedRef.current = false
      ++requestRef.current
      pendingRef.current = false
      observer?.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
      video.pause()
    }
  }, [play])

  return <>
    <video
      ref={videoRef}
      className={`prism-background__video${playing ? ' prism-background__video--playing' : ''}`}
      src={`/hero/prism-${mobile ? 'mobile' : 'desktop'}.mp4`}
      autoPlay muted loop playsInline preload="metadata" aria-hidden="true"
      {...{ 'webkit-playsinline': 'true' }}
      onCanPlay={play}
      onPlaying={() => { setPlaying(true); setBlocked(false) }}
      onPause={() => {
        if (mountedRef.current && visibleRef.current && !document.hidden) setBlocked(true)
      }}
      onError={() => { setPlaying(false); setFailed(true) }}
    />
    {blocked && !failed && <button className="prism-background__play" type="button" onClick={play}>
      <span aria-hidden="true">▶</span> 播放动画
    </button>}
  </>
}

export default function PrismVideoFallback({ enabled }: { enabled: boolean }) {
  // Match the hero's existing framing breakpoint, not a particular phone model.
  const mobile = useMediaQuery('(max-width: 720px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  return <div className="prism-background__fallback">
    <picture>
      <source media="(max-width: 720px)" srcSet="/hero/prism-mobile-poster.jpg" />
      <img className="prism-background__poster" src="/hero/prism-desktop-poster.jpg" alt="" />
    </picture>
    {enabled && !reducedMotion && <CompatibilityVideo key={String(mobile)} mobile={mobile} />}
  </div>
}
