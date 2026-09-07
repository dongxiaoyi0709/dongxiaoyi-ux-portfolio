import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import './PdfReader.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

type PdfArticle = {
  title: string
  pdf: string
  prependImages?: Array<{
    src: string
    alt: string
  }>
}

function PdfPage({ pageNumber, width }: { pageNumber: number; width: number }) {
  const pageRef = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(pageNumber <= 2)

  useEffect(() => {
    if (shouldRender) return
    const page = pageRef.current
    if (!page) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setShouldRender(true)
      observer.disconnect()
    }, { root: page.closest('.pdf-reader__viewport'), rootMargin: '1200px 0px' })
    observer.observe(page)
    return () => observer.disconnect()
  }, [shouldRender])

  return <div className="pdf-reader__page" ref={pageRef} aria-label={`第 ${pageNumber} 页`}>
    {shouldRender
      ? <Page pageNumber={pageNumber} width={width} renderTextLayer={false} renderAnnotationLayer={false} loading={<p className="pdf-reader__status">正在渲染第 {pageNumber} 页…</p>} />
      : <div className="pdf-reader__page-placeholder" style={{ width }}><span>{pageNumber}</span></div>}
  </div>
}

export default function PdfReader({ article, onClose }: { article: PdfArticle; onClose: () => void }) {
  const [numPages, setNumPages] = useState(0)
  const [pageWidth, setPageWidth] = useState(960)
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null)
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const pdfSource = useMemo(() => pdfData ? { data: pdfData } : null, [pdfData])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const updateWidth = () => setPageWidth(Math.max(280, Math.min(1180, viewport.clientWidth - 48)))
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    let timedOut = false
    const timeout = window.setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 30_000)

    const loadPdf = async () => {
      try {
        const response = await fetch(article.pdf, {
          cache: 'force-cache',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const total = Number(response.headers.get('content-length')) || 0
        const reader = response.body?.getReader()
        if (!reader) {
          const data = new Uint8Array(await response.arrayBuffer())
          if (active) {
            setLoadProgress(100)
            setPdfData(data)
          }
          return
        }

        const chunks: Uint8Array[] = []
        let loaded = 0
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
          loaded += value.length
          if (active && total > 0) setLoadProgress(Math.min(99, Math.round((loaded / total) * 100)))
        }

        const data = new Uint8Array(loaded)
        let offset = 0
        for (const chunk of chunks) {
          data.set(chunk, offset)
          offset += chunk.length
        }
        if (active) {
          setLoadProgress(100)
          setPdfData(data)
        }
      } catch (error) {
        if (!active) return
        const message = timedOut
          ? '加载时间过长，请检查网络后重试。'
          : `PDF 加载失败${error instanceof Error && error.message ? `（${error.message}）` : ''}。`
        setLoadError(message)
      } finally {
        window.clearTimeout(timeout)
      }
    }

    void loadPdf()
    return () => {
      active = false
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [article.pdf, loadAttempt])

  const retryLoad = () => {
    setPdfData(null)
    setNumPages(0)
    setLoadProgress(0)
    setLoadError(null)
    setLoadAttempt((attempt) => attempt + 1)
  }

  return <motion.div className="pdf-reader" role="dialog" aria-modal="true" aria-label={`${article.title}站内阅读器`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <header className="pdf-reader__bar">
      <div className="pdf-reader__title"><span>Design Sharing</span><strong>{article.title}</strong></div>
      <button className="pdf-reader__close" type="button" onClick={onClose} aria-label="关闭 PDF 阅读器"><X aria-hidden="true" /></button>
    </header>
    <div className="pdf-reader__viewport" ref={viewportRef}>
      {loadError ? <div className="pdf-reader__status pdf-reader__status--error" role="alert">
        <p>{loadError}</p>
        <button type="button" className="pdf-reader__retry" onClick={retryLoad}>重新加载</button>
      </div> : !pdfSource ? <p className="pdf-reader__status" role="status">正在载入设计分享…{loadProgress > 0 ? ` ${loadProgress}%` : ''}</p> : <Document
        file={pdfSource}
        onLoadSuccess={({ numPages: loadedPages }: { numPages: number }) => setNumPages(loadedPages)}
        onLoadError={(error: Error) => setLoadError(`PDF 解析失败${error.message ? `（${error.message}）` : ''}。`)}
        loading={<p className="pdf-reader__status">正在解析设计分享…</p>}
        error={null}
      >
        <div className="pdf-reader__pages">
          {article.prependImages?.map((image, index) => <figure className="pdf-reader__intro-page" key={image.src} style={{ width: pageWidth }}>
            <img src={image.src} alt={image.alt} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
          </figure>)}
          {Array.from({ length: numPages }, (_, index) => <PdfPage key={index + 1} pageNumber={index + 1} width={pageWidth} />)}
        </div>
      </Document>}
    </div>
  </motion.div>
}
