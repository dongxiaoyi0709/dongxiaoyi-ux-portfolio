import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'

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
  const viewportRef = useRef<HTMLDivElement>(null)

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

  return <motion.div className="pdf-reader" role="dialog" aria-modal="true" aria-label={`${article.title}站内阅读器`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <header className="pdf-reader__bar">
      <div className="pdf-reader__title"><span>Design Sharing</span><strong>{article.title}</strong></div>
      <button className="pdf-reader__close" type="button" onClick={onClose} aria-label="关闭 PDF 阅读器"><X aria-hidden="true" /></button>
    </header>
    <div className="pdf-reader__viewport" ref={viewportRef}>
      <Document
        file={article.pdf}
        onLoadSuccess={({ numPages: loadedPages }: { numPages: number }) => setNumPages(loadedPages)}
        loading={<p className="pdf-reader__status">正在载入设计分享…</p>}
        error={<p className="pdf-reader__status pdf-reader__status--error">PDF 加载失败，请稍后重试。</p>}
      >
        <div className="pdf-reader__pages">
          {article.prependImages?.map((image, index) => <figure className="pdf-reader__intro-page" key={image.src} style={{ width: pageWidth }}>
            <img src={image.src} alt={image.alt} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
          </figure>)}
          {Array.from({ length: numPages }, (_, index) => <PdfPage key={index + 1} pageNumber={index + 1} width={pageWidth} />)}
        </div>
      </Document>
    </div>
  </motion.div>
}
