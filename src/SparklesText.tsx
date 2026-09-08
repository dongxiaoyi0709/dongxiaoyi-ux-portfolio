import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'

type SparkleColors = { first: string; second: string }

interface SparklesTextProps {
  children: ReactNode
  className?: string
  sparklesCount?: number
  colors?: SparkleColors
}

const defaultColors = { first: '#9E7AFF', second: '#FE8BBB' }

function createSparkle(colors: SparkleColors) {
  return {
    x: `${2 + Math.random() * 96}%`,
    y: `${Math.random() * 100}%`,
    color: Math.random() > .5 ? colors.first : colors.second,
    delay: Math.random() * 2,
    scale: .3 + Math.random(),
  }
}

// Adapted from the supplied Magic UI Sparkles Text example.
function Sparkle({ colors }: { colors: SparkleColors }) {
  const [star, setStar] = useState(() => ({ ...createSparkle(colors), generation: 0 }))

  return <motion.svg
    key={star.generation}
    className="sparkles-text__star"
    aria-hidden="true"
    focusable="false"
    style={{ left: star.x, top: star.y }}
    initial={{ opacity: 0, scale: 0, rotate: 75 }}
    animate={{ opacity: [0, 1, 0], scale: [0, star.scale, 0], rotate: [75, 120, 150] }}
    transition={{ duration: .8, delay: star.delay }}
    onAnimationComplete={() => setStar(current => ({ ...createSparkle(colors), generation: current.generation + 1 }))}
    width="21"
    height="21"
    viewBox="0 0 21 21"
  >
    <path
      d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z"
      fill={star.color}
    />
  </motion.svg>
}

export default function SparklesText({ children, className = '', sparklesCount = 10, colors = defaultColors }: SparklesTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref)
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null)
  const [pageVisible, setPageVisible] = useState(true)

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => setReducedMotion(motionPreference.matches)
    const syncVisibility = () => setPageVisible(document.visibilityState === 'visible')
    syncMotionPreference()
    syncVisibility()
    motionPreference.addEventListener('change', syncMotionPreference)
    document.addEventListener('visibilitychange', syncVisibility)
    return () => {
      motionPreference.removeEventListener('change', syncMotionPreference)
      document.removeEventListener('visibilitychange', syncVisibility)
    }
  }, [])

  // Mount animation loops only while visible; Motion cleans them up on unmount.
  const animate = isInView && pageVisible && reducedMotion === false

  return <span ref={ref} className={`sparkles-text ${className}`.trim()}>
    {children}
    {animate && Array.from({ length: sparklesCount }, (_, index) => <Sparkle key={index} colors={colors} />)}
  </span>
}
