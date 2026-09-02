import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUp, ArrowUpRight, Mail, Menu, Phone, X } from 'lucide-react'
import orbArtwork from './assets/doris-orb-orange.png'
import './App.css'

type Project = {
  brand: string
  title: string
  detail: string
  src: string
  gallery?: 'duoke' | 'jb' | 'mba'
  galleryLimit?: number
  galleryStart?: number
}

const projects: Project[] = [
  { brand: '多客', title: '电商智能客服系统', detail: '自动回复 · AI 坐席 · 多平台聚合', src: '/projects/duoke.png', gallery: 'duoke', galleryLimit: 54 },
  { brand: '希沃白板', title: '集体备课', detail: '在线协同 · 视频研讨 · AI 报告', src: '/projects/seewo-whiteboard.png', gallery: 'jb', galleryLimit: 25 },
  { brand: '希沃信鸽', title: '数智化教研评审平台', detail: 'B 端后台 · 评课管理 · 研修管理', src: '/projects/seewo-xinge-platform.png' },
  { brand: 'seewo', title: '教师数字素养平台', detail: '可视化大屏 · 人机对话系统 · AIGC', src: '/projects/seewo-digital-literacy.png' },
  { brand: 'MBA 智库', title: 'MBA 智库 App', detail: '课堂 · 百科 · 文档 · 商学院', src: '/projects/mba-app.png', gallery: 'mba' },
  { brand: '4Seller', title: '电商 ERP 系统', detail: '多平台聚合 · 订单管理 · 库存同步', src: '/projects/4seller-erp.png', gallery: 'jb', galleryStart: 25 },
]

const experiences = [
  { date: '2024 — NOW', company: '深圳美云集网络科技有限责任公司', role: '高级 UI 设计师', note: '跨境电商 ERP 与智能客服系统体验优化' },
  { date: '2021 — 2024', company: '广州视源电子科技股份有限公司', role: '高级 UI 设计师', note: '希沃白板 Web 与 App 体验优化' },
  { date: '2019 — 2021', company: '厦门众智创库企业管理咨询有限公司', role: 'UI 设计师', note: 'MBA 智库 App 2.0 体验与品牌升级' },
  { date: '2018 — 2019', company: '在乎（厦门）信息技术有限公司', role: '视觉设计师', note: '多端产品与品牌视觉设计' },
]

const approaches = [
  ['01', 'Listen closely.', '从用户研究、数据与真实场景里确认问题的边界。'],
  ['02', 'Map the system.', '把复杂流程转译成清晰的结构、关系和关键路径。'],
  ['03', 'Make decisions.', '在业务目标、用户价值和落地成本之间建立判断。'],
  ['04', 'Ship with care.', '通过组件、走查和复盘，让体验在上线后依然成立。'],
]

const detailImageModules = import.meta.glob('/src/assets/project-details/**/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

function ArrowIcon({ size = 19 }: { size?: number }) {
  return <ArrowUpRight size={size} strokeWidth={1.45} aria-hidden="true" />
}

function detailImagesFor(folder: NonNullable<Project['gallery']>) {
  return Object.entries(detailImageModules)
    .filter(([path]) => path.includes('/project-details/' + folder + '/'))
    .sort(([first], [second]) => first.localeCompare(second, undefined, { numeric: true }))
    .map(([, source]) => source)
}

function Loader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startedAt = performance.now()
    let frame = 0
    const update = (now: number) => {
      const next = Math.min(Math.round(((now - startedAt) / 1150) * 100), 100)
      setProgress(next)
      if (next < 100) frame = requestAnimationFrame(update)
      else window.setTimeout(onDone, 180)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [onDone])

  return <motion.div className="loader" exit={{ opacity: 0 }} transition={{ duration: .35 }}><span>DORIS / UX</span><strong>{String(progress).padStart(3, '0')}</strong><i><b style={{ transform: 'scaleX(' + progress / 100 + ')' }} /></i></motion.div>
}

function Header() {
  const navigate = (target: string) => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return (
    <header className="header">
      <a className="header__brand" href="#home" aria-label="Doris UX 首页">DORIS / UX</a>
      <nav className="header__nav" aria-label="网站导航">
        <button onClick={() => navigate('projects')} type="button">Works</button>
        <button onClick={() => navigate('experience')} type="button">Experience</button>
        <button onClick={() => navigate('contact')} type="button">Contact</button>
      </nav>
      <span className="header__menu" aria-hidden="true"><Menu size={18} strokeWidth={1.3} /></span>
    </header>
  )
}

function Hero() {
  const reducedMotion = useReducedMotion()
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  return (
    <section id="home" className="hero">
      <div className="hero__rule hero__rule--center" aria-hidden="true" />
      <div className="hero__rule hero__rule--left" aria-hidden="true" />
      <motion.div className="hero__art" aria-hidden="true" animate={reducedMotion ? undefined : { x: offset.x, y: offset.y }} transition={{ type: 'spring', stiffness: 38, damping: 20 }}>
        <img src={orbArtwork} alt="" />
      </motion.div>
      <div className="hero__copy" onPointerMove={(event) => {
        if (reducedMotion) return
        setOffset({ x: (event.clientX / window.innerWidth - .5) * 16, y: (event.clientY / window.innerHeight - .5) * 14 })
      }} onPointerLeave={() => setOffset({ x: 0, y: 0 })}>
        <h1><span>Design for people.</span><span>Results for business.</span></h1>
        <p>Doris · UX Designer · 8 years experience</p>
        <a href="#projects" aria-label="查看项目"><ArrowIcon size={25} /></a>
      </div>
      <div className="hero__side-note">用户洞察 / 体验策略 / 设计系统</div>
      <a href="#projects" className="hero__scroll">Scroll to explore <ArrowDown size={17} strokeWidth={1.35} /></a>
    </section>
  )
}

function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const gallery = project.gallery ? detailImagesFor(project.gallery) : []
  const start = project.galleryStart ?? 0
  const images = gallery.slice(start, project.galleryLimit ? start + project.galleryLimit : undefined)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return <motion.article className="project-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={project.title + '项目详情'}>
    <header><button type="button" onClick={onClose}><X size={19} strokeWidth={1.5} />Close</button><span>{project.brand}</span></header>
    <div className="project-detail__heading"><p>{project.detail}</p><h2>{project.title}</h2><small>{images.length ? images.length + ' 个设计画面' : '项目封面展示'}</small></div>
    {images.length ? <div className="project-detail__gallery">{images.map((source, index) => <img key={source} src={source} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" alt={project.title + '设计画面 ' + (index + 1)} />)}</div> : <div className="project-detail__cover"><img src={project.src} alt={project.title + '项目封面'} /></div>}
  </motion.article>
}

function Projects() {
  const [selected, setSelected] = useState<Project | null>(null)
  return <section id="projects" className="works">
    <div className="works__heading"><h2>Selected work</h2><span>01</span></div>
    <div className="works__list">
      {projects.map((project, index) => <motion.button className="work-strip" key={project.title} type="button" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-120px' }} transition={{ duration: .65, delay: index * .03 }} onClick={() => setSelected(project)}>
        <span className="work-strip__meta"><b>{String(index + 1).padStart(2, '0')}</b><strong>{project.title}</strong><small>{project.detail}</small></span>
        <span className="work-strip__media"><img src={project.src} alt={project.title + '项目封面'} /><i><ArrowIcon size={26} /></i></span>
      </motion.button>)}
    </div>
    <AnimatePresence>{selected && <ProjectDetail project={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
  </section>
}

function Experience() {
  return <section id="experience" className="experience">
    <div className="experience__heading"><h2>Experience</h2><p>8 years across complex products, product systems and brand-led experiences.</p></div>
    <div className="experience__rail">
      <i aria-hidden="true" />
      {experiences.map((item) => <motion.article key={item.date} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .6 }}>
        <b>{item.date}</b><em aria-hidden="true" /><h3>{item.company}</h3><strong>{item.role}</strong><p>{item.note}</p>
      </motion.article>)}
    </div>
  </section>
}

function Approach() {
  return <section className="approach">
    <div className="approach__opening"><h2>Think deeply.<br />Make clearly.</h2><p>从问题的根部开始，把设计变成用户能感受到、业务能持续拥有的价值。</p></div>
    <div className="approach__list">{approaches.map(([number, title, body]) => <motion.article key={number} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .55 }}><b>{number}</b><h3>{title}</h3><p>{body}</p><ArrowIcon /></motion.article>)}</div>
  </section>
}

function Contact() {
  const ticker = 'DESIGN FOR RESULTS  •  '
  return <footer id="contact" className="contact">
    <div className="contact__ticker" aria-hidden="true"><span>{ticker.repeat(6)}</span><span>{ticker.repeat(6)}</span></div>
    <img className="contact__art" src={orbArtwork} alt="" aria-hidden="true" />
    <div className="contact__content"><h2>Let&apos;s make<br />useful things.</h2><div className="contact__links"><a href="tel:15606929798"><Phone size={20} strokeWidth={1.25} />156 0692 9798</a><a href="mailto:1021517054@qq.com"><Mail size={20} strokeWidth={1.25} />1021517054@qq.com</a></div></div>
    <div className="contact__footer"><span>DORIS / UX</span><small>© 2026</small><a href="#home" aria-label="回到顶部"><ArrowUp size={21} strokeWidth={1.3} /></a></div>
  </footer>
}

function App() {
  const [loading, setLoading] = useState(true)
  return <><AnimatePresence>{loading && <Loader onDone={() => setLoading(false)} />}</AnimatePresence><Header /><main><Hero /><Projects /><Experience /><Approach /></main><Contact /></>
}

export default App
