import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDownRight, ArrowUp, ArrowUpRight, Mail, Phone, X } from 'lucide-react'
import orbArtwork from './assets/doris-orb.png'
import './App.css'

type Project = {
  brand: string
  title: string
  detail: string
  src: string
  category: '教育教研' | '企业服务' | '电商零售' | '移动应用'
  gallery?: 'duoke' | 'jb' | 'mba'
  galleryLimit?: number
  galleryStart?: number
}

const experiences = [
  { company: '深圳美云集网络科技有限责任公司', title: '高级 UI 设计师', date: '2024.10 — 至今', focus: '负责跨境电商 ERP 与智能客服系统的体验优化，沉淀设计系统并推动复杂流程落地。' },
  { company: '广州视源电子科技股份有限公司', title: '高级 UI 设计师', date: '2021.04 — 2024.03', focus: '负责希沃白板「我的学校」Web 与 App 体验优化，提升教育场景中的协同效率。' },
  { company: '厦门众智创库企业管理咨询有限公司', title: 'UI 设计师', date: '2019.05 — 2021.04', focus: '完成 MBA 智库 App 2.0 的体验升级与品牌视觉语言统一。' },
  { company: '在乎（厦门）信息技术有限公司', title: '视觉设计师', date: '2018.03 — 2019.05', focus: '负责 App、小程序、官网与品牌物料的视觉设计，覆盖多个产品线。' },
]

const projectShowcases: Project[] = [
  { brand: '多客', title: '电商智能客服系统', detail: '自动回复 · AI 坐席 · 多平台聚合', src: '/projects/duoke.png', category: '电商零售', gallery: 'duoke', galleryLimit: 54 },
  { brand: '希沃白板', title: '集体备课', detail: '在线协同 · 视频研讨 · AI 报告', src: '/projects/seewo-whiteboard.png', category: '教育教研', gallery: 'jb', galleryLimit: 25 },
  { brand: '希沃信鸽', title: '数智化教研评审平台', detail: 'B 端后台 · 评课管理 · 研修管理', src: '/projects/seewo-xinge-platform.png', category: '教育教研' },
  { brand: 'seewo', title: '教师数字素养平台', detail: '可视化大屏 · 人机对话系统 · AIGC', src: '/projects/seewo-digital-literacy.png', category: '教育教研' },
  { brand: 'MBA 智库', title: 'MBA 智库 App', detail: '课堂 · 百科 · 文档 · 商学院', src: '/projects/mba-app.png', category: '移动应用', gallery: 'mba' },
  { brand: '4Seller', title: '电商 ERP 系统', detail: '多平台聚合 · 订单管理 · 库存同步', src: '/projects/4seller-erp.png', category: '企业服务', gallery: 'jb', galleryStart: 25 },
]

const strengths = [
  { number: '01', title: '用户洞察与业务结果', description: '以数据、用户研究与场景链路为依据，让设计真正服务业务目标。' },
  { number: '02', title: 'B 端与 C 端项目经验', description: '理解不同产品形态的体验侧重点，能形成有针对性的策略。' },
  { number: '03', title: '总结复盘与团队赋能', description: '通过复盘、规范和分享，让个人经验持续沉淀为团队能力。' },
  { number: '04', title: '细节与交付品质', description: '从设计走查到上线验收，持续打磨每个可见与不可见的细节。' },
]

const detailImageModules = import.meta.glob('/src/assets/project-details/**/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

function detailImagesFor(folder: NonNullable<Project['gallery']>) {
  return Object.entries(detailImageModules)
    .filter(([path]) => path.includes('/project-details/' + folder + '/'))
    .sort(([first], [second]) => first.localeCompare(second, undefined, { numeric: true }))
    .map(([, source]) => source)
}

function ArrowIcon({ size = 17 }: { size?: number }) {
  return <ArrowUpRight size={size} strokeWidth={1.65} aria-hidden="true" />
}

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const startedAt = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / 1450, 1)
      setCount(Math.round(progress * 100))
      if (progress < 1) frame = requestAnimationFrame(tick)
      else window.setTimeout(onComplete, 180)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [onComplete])

  return (
    <motion.div className="loading-screen" exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
      <div className="loading-screen__mark">DORIS</div>
      <div className="loading-screen__orb" aria-hidden="true"><img src={orbArtwork} alt="" /></div>
      <p className="loading-screen__message">Designing with intention</p>
      <p className="loading-screen__count">{String(count).padStart(3, '0')}</p>
      <div className="loading-screen__track"><i style={{ transform: 'scaleX(' + count / 100 + ')' }} /></div>
    </motion.div>
  )
}

function Navbar() {
  const [active, setActive] = useState('首页')
  const items = [
    { label: '首页', target: 'home' },
    { label: '项目', target: 'projects' },
    { label: '经历', target: 'work' },
    { label: '优势', target: 'advantages' },
  ]
  const navigate = (label: string, target: string) => {
    setActive(label)
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label="Doris 主页">DORIS</a>
      <nav className="site-nav" aria-label="网站导航">
        {items.map((item) => (
          <button key={item.target} className={active === item.label ? 'site-nav__link is-active' : 'site-nav__link'} type="button" onClick={() => navigate(item.label, item.target)}>
            {item.label}
          </button>
        ))}
      </nav>
      <a className="site-contact" href="#contact">联系我 <ArrowIcon size={15} /></a>
    </header>
  )
}

function Hero() {
  const reducedMotion = useReducedMotion()
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  return (
    <section
      id="home"
      className="hero"
      onPointerMove={(event) => {
        if (reducedMotion) return
        setParallax({
          x: (event.clientX / window.innerWidth - 0.5) * 18,
          y: (event.clientY / window.innerHeight - 0.5) * 14,
        })
      }}
      onPointerLeave={() => setParallax({ x: 0, y: 0 })}
    >
      <div className="hero__grid" aria-hidden="true" />
      <motion.div className="hero__content" initial={{ opacity: 0, y: 42 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}>
        <h1>Hi, I&apos;m Doris</h1>
        <p className="hero__meta">UX DESIGNER · 8 YEARS EXPERIENCE</p>
        <p className="hero__role">专注于 <span>用户体验优化</span></p>
        <p className="hero__intro">以数据、用户洞察和完整的设计执行，帮助业务拿到更清晰的结果。</p>
        <div className="hero__actions">
          <a className="action-link action-link--solid" href="#projects">查看项目 <ArrowIcon /></a>
          <a className="action-link" href="#work">了解经历 <ArrowIcon /></a>
        </div>
      </motion.div>
      <div className="hero__orb" aria-hidden="true">
        <motion.img src={orbArtwork} alt="" animate={reducedMotion ? undefined : { x: parallax.x, y: parallax.y }} transition={{ type: 'spring', stiffness: 50, damping: 20, mass: 0.7 }} />
      </div>
      <a className="hero__scroll" href="#projects">向下探索 <ArrowDownRight size={18} strokeWidth={1.5} /></a>
    </section>
  )
}

function SectionLead({ index, title, body, note }: { index: string; title: string; body: string; note?: string }) {
  return (
    <motion.header className="section-lead" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: '-80px' }}>
      <div><span className="section-lead__index">{index}</span><h2>{title}</h2></div>
      <p>{body}</p>
      {note && <span className="section-lead__note">{note}</span>}
    </motion.header>
  )
}

function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const galleryImages = project.gallery ? detailImagesFor(project.gallery) : []
  const images = galleryImages.slice(project.galleryStart ?? 0, project.galleryLimit ? (project.galleryStart ?? 0) + project.galleryLimit : undefined)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <motion.article className="project-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={project.title + '项目详情'}>
      <header className="project-detail__bar"><button type="button" onClick={onClose}><X size={18} />关闭详情</button><span>{project.brand}</span></header>
      <div className="project-detail__intro"><span>{project.category}</span><h2>{project.title}</h2><p>{project.detail}</p><small>{images.length ? images.length + ' 个设计画面' : '项目封面展示'}</small></div>
      {images.length ? (
        <div className="project-detail__gallery">{images.map((source, index) => <img key={source} src={source} alt={project.title + '设计画面 ' + (index + 1)} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />)}</div>
      ) : (
        <div className="project-detail__cover"><img src={project.src} alt={project.title + '项目封面'} /></div>
      )}
    </motion.article>
  )
}

function Projects() {
  const [filter, setFilter] = useState<'全部项目' | Project['category']>('全部项目')
  const [selected, setSelected] = useState<Project | null>(null)
  const filters: Array<'全部项目' | Project['category']> = ['全部项目', '教育教研', '企业服务', '电商零售', '移动应用']
  const visibleProjects = filter === '全部项目' ? projectShowcases : projectShowcases.filter((project) => project.category === filter)

  return (
    <section id="projects" className="projects">
      <div className="content-shell">
        <SectionLead index="01 / SELECTED WORK" title="项目展示" body="从跨境电商到教育产品，用系统化设计回应真实的业务与用户问题。" note="6 个项目" />
        <div className="project-layout">
          <div className="project-grid">
            <AnimatePresence mode="popLayout">
              {visibleProjects.map((project, index) => (
                <motion.button type="button" className="project-tile" key={project.title} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.5, delay: index * 0.04 }} onClick={() => setSelected(project)}>
                  <span className="project-tile__media"><img src={project.src} alt={project.title + '项目封面'} /></span>
                  <span className="project-tile__caption"><b>{String(projectShowcases.indexOf(project) + 1).padStart(2, '0')}</b><strong>{project.title}</strong><small>{project.detail}</small><i>查看项目 <ArrowIcon size={16} /></i></span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
          <div className="project-filter" aria-label="项目筛选">
            {filters.map((item) => <button type="button" className={filter === item ? 'is-active' : ''} key={item} onClick={() => setFilter(item)}><i />{item}</button>)}
            <span className="project-filter__label">FILTER</span>
          </div>
        </div>
      </div>
      <AnimatePresence>{selected && <ProjectDetail project={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </section>
  )
}

function Experience() {
  return (
    <section id="work" className="experience">
      <div className="content-shell">
        <SectionLead index="02 / EXPERIENCE" title="工作经历" body="8 年 UX 设计经验，持续在多端体验、设计系统和业务目标之间找到平衡。" note="2018 — NOW" />
        <div className="experience-list">
          {experiences.map((item, index) => (
            <motion.article className="experience-row" key={item.company} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: index * 0.08 }} viewport={{ once: true, margin: '-60px' }}>
              <span className="experience-row__point" aria-hidden="true" />
              <div className="experience-row__main"><h3>{item.company}</h3><strong>{item.title}</strong><p>{item.focus}</p></div>
              <time>{item.date}</time>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Strengths() {
  return (
    <section id="advantages" className="strengths">
      <div className="content-shell strengths__shell">
        <div className="strengths__lead"><span>03 / CORE STRENGTHS</span><h2>个人优势</h2></div>
        <div className="strength-list">
          {strengths.map((item, index) => (
            <motion.article key={item.number} className="strength-row" initial={{ opacity: 0, x: 22 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: index * 0.07 }} viewport={{ once: true }}>
              <b>{item.number}</b><i aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.description}</p></div><ArrowIcon />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const marquee = 'PRODUCT DESIGN  •  UX STRATEGY  •  DESIGN SYSTEM  •  RESEARCH INSIGHT  •  '
  return (
    <footer id="contact" className="contact">
      <div className="contact__marquee" aria-hidden="true"><span>{marquee.repeat(3)}</span><span>{marquee.repeat(3)}</span></div>
      <div className="contact__orb" aria-hidden="true"><img src={orbArtwork} alt="" /></div>
      <div className="content-shell contact__content">
        <h2>用设计，<br />帮助业务拿结果。</h2>
        <div className="contact__details" aria-label="联系方式">
          <a href="tel:15606929798"><Phone size={22} strokeWidth={1.5} /><span>156 0692 9798</span><ArrowIcon /></a>
          <a href="mailto:1021517054@qq.com"><Mail size={22} strokeWidth={1.5} /><span>1021517054@qq.com</span><ArrowIcon /></a>
        </div>
      </div>
      <div className="contact__footer content-shell"><span>DORIS UX</span><small>© 2026 Doris UX. All rights reserved.</small><a href="#home" aria-label="回到顶部"><ArrowUp size={23} strokeWidth={1.45} /><em>回到顶部</em></a></div>
    </footer>
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  return (
    <>
      <AnimatePresence>{isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}</AnimatePresence>
      <Navbar />
      <main><Hero /><Projects /><Experience /><Strengths /></main>
      <Contact />
    </>
  )
}

export default App
