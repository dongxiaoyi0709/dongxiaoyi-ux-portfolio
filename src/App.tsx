import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Mail, Phone, X } from 'lucide-react'
import { gsap } from 'gsap'
import './App.css'

const VIDEO_SOURCE = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8'

const projects = [
  {
    company: '深圳传音控股股份有限公司',
    title: '高级 UI 设计师',
    date: '2026.03 — 至今',
    focus: 'AI Agent · 电商 ERP · AI 体验设计',
    details: [
      '负责 AI Agent 产品「Fika」及电商 ERP 系统「Kilistore」的体验优化设计。',
      '将 AI 融入全流程设计，重新定义团队 AI 体验设计与产研协作流程。',
    ],
  },
  {
    company: '深圳美云集网络科技有限责任公司',
    title: '高级 UI 设计师',
    date: '2024.10 — 至今',
    focus: '跨境电商 ERP · 智能客服 · 体验专项',
    details: [
      '负责跨境电商 ERP 系统「4Seller」及智能客服系统「多客」的体验优化设计。',
      '围绕业务目标开展设计洞察与分析，完成多个体验专项，助力业务数据提升。',
    ],
  },
  {
    company: '广州视源电子科技股份有限公司',
    title: '高级 UI 设计师',
    date: '2021.04 — 2024.03',
    focus: '希沃白板「我的学校」· Web & App · 设计系统',
    details: [
      '负责「希沃白板」“我的学校” Web 端与 App 端设计，把控设计输出质量并持续优化产品体验。',
      '制定组件规范、跟进开发与视觉验收，配合程序封装，提升团队协作效率。',
    ],
  },
  {
    company: '厦门众智创库企业管理咨询有限公司',
    title: 'UI 设计师',
    date: '2019.05 — 2021.04',
    focus: 'MBA 智库 App 2.0 · 体验升级 · 品牌视觉',
    details: [
      '负责「MBA 智库」App 2.0 的 UI 设计，完成各频道体验升级，提升产品转化与留存。',
      '完成品牌视觉语言升级，统一设计风格并强化用户的品牌感知。',
    ],
  },
]

const projectShowcases = [
  { brand: '多客', title: '电商智能客服系统', detail: '自动回复 · AI 坐席 · 多平台聚合', src: '/projects/duoke.png', gallery: 'duoke', galleryLimit: 54 },
  { brand: '希沃白板', title: '集体备课', detail: '在线协同 · 视频研讨 · AI 报告', src: '/projects/seewo-whiteboard.png', gallery: 'jb', galleryLimit: 25 },
  { brand: '希沃信鸽', title: '数智化教研评审平台', detail: 'B 端后台 · 评课管理 · 研修管理', src: '/projects/seewo-xinge-platform.png' },
  { brand: 'seewo', title: '教师数字素养平台', detail: '可视化大屏 · 人机对话系统 · AIGC', src: '/projects/seewo-digital-literacy.png' },
  { brand: 'MBA 智库', title: 'MBA 智库 App', detail: '课堂 · 百科 · 文档 · 商学院', src: '/projects/mba-app.png', gallery: 'mba' },
  { brand: '4Seller', title: '电商 ERP 系统', detail: '多平台聚合 · 订单管理 · 库存同步', src: '/projects/4seller-erp.png', gallery: 'jb', galleryStart: 25 },
]

const detailImageModules = import.meta.glob('/src/assets/project-details/**/*.png', { eager: true, import: 'default', query: '?url' }) as Record<string, string>

function detailImagesFor(folder: string) {
  return Object.entries(detailImageModules)
    .filter(([path]) => path.includes(`/project-details/${folder}/`))
    .sort(([first], [second]) => first.localeCompare(second, undefined, { numeric: true }))
    .map(([, source]) => source)
}

const strengths = [
  { number: '01', title: '全流程设计执行', description: '8 年设计经验，能从 0–1 独立负责全流程设计执行。' },
  { number: '02', title: 'AI Coding 与组件体系', description: '熟练运用 AI Coding 完成方案探索与组件库搭建，并辅助前端样式实现、体验优化与数据分析。' },
  { number: '03', title: '设计工程与 AI 协同', description: '具备设计工程思维，能定义团队 AI 体验设计与产研协作流程，提升交付效率与质量。' },
  { number: '04', title: '审美与技术好奇', description: '审美能力在线，对新技术与新趋势保持好奇，始终热爱设计行业。' },
]

function ArrowIcon() { return <ArrowUpRight size={15} strokeWidth={1.6} aria-hidden="true" /> }

function CinematicVideo({ className = '' }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let hls: Hls | undefined
    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true })
      hls.loadSource(VIDEO_SOURCE)
      hls.attachMedia(video)
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) video.src = VIDEO_SOURCE
    void video.play().catch(() => undefined)
    return () => hls?.destroy()
  }, [])
  return <video ref={videoRef} className={className} autoPlay muted loop playsInline aria-hidden="true" />
}

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0)
  const [word, setWord] = useState(0)
  const words = ['洞察', '体验', '结果']
  useEffect(() => {
    const start = performance.now()
    let frame = 0
    const animate = (now: number) => {
      const progress = Math.min((now - start) / 2700, 1)
      setCount(Math.round(progress * 100))
      if (progress < 1) frame = requestAnimationFrame(animate)
      else window.setTimeout(onComplete, 400)
    }
    frame = requestAnimationFrame(animate)
    const interval = window.setInterval(() => setWord((current) => (current + 1) % words.length), 900)
    return () => { cancelAnimationFrame(frame); window.clearInterval(interval) }
  }, [onComplete, words.length])
  return <motion.div className="loading-screen" exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
    <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="loading-screen__label">董晓艺 · UX Portfolio</motion.p>
    <div className="loading-screen__word" aria-live="polite"><AnimatePresence mode="wait"><motion.span key={words[word]} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: .38 }}>{words[word]}</motion.span></AnimatePresence></div>
    <p className="loading-screen__count">{String(count).padStart(3, '0')}</p>
    <div className="loading-screen__track" aria-hidden="true"><div className="loading-screen__progress" style={{ transform: `scaleX(${count / 100})` }} /></div>
  </motion.div>
}

function Logo() { return <a className="logo" href="#home" aria-label="Doris 主页"><span>DX</span></a> }

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [active, setActive] = useState('Home')
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 100)
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const items = [{ label: 'Home', target: 'home' }, { label: 'Work', target: 'projects' }, { label: 'Resume', target: 'work' }]
  const navigate = (label: string, target: string) => { setActive(label); document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  return <header className="nav-wrap"><nav className={`nav ${isScrolled ? 'nav--scrolled' : ''}`} aria-label="Primary navigation">
    <Logo /><span className="nav__divider nav__divider--first" /><div className="nav__links">{items.map((item) => <button key={item.label} className={`nav__link ${active === item.label ? 'nav__link--active' : ''}`} onClick={() => navigate(item.label, item.target)}>{item.label}</button>)}</div><span className="nav__divider" />
    <a className="say-hi" href="#contact"><span>Say hi</span><ArrowIcon /></a>
  </nav></header>
}

function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  useLayoutEffect(() => {
    if (reducedMotion || !heroRef.current) return
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline.fromTo('.name-reveal', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, delay: .1 })
      timeline.fromTo('.blur-in', { opacity: 0, filter: 'blur(10px)', y: 20 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, stagger: .1 }, '-=.9')
    }, heroRef)
    return () => context.revert()
  }, [reducedMotion])
  return <section id="home" className="hero-section" ref={heroRef}>
    <CinematicVideo className="hero-section__video" /><div className="hero-section__veil" /><div className="hero-section__fade" />
    <div className="hero-section__content">
      <p className="hero-section__edition blur-in"><span aria-hidden="true" /><b>UX PORTFOLIO · 2026</b><span aria-hidden="true" /></p>
      <h1 className="hero-section__name name-reveal">Doris Dong</h1>
      <p className="hero-section__role blur-in">A UX designer building AI-native product experiences.</p>
      <div className="hero-section__divider blur-in" aria-hidden="true"><span /><i /><span /></div>
      <p className="hero-section__description blur-in">8 years across AI Agent, cross-border e-commerce, education and knowledge products.</p>
      <div className="hero-section__actions blur-in"><a className="button button--solid" href="#projects">See work <ArrowIcon /></a><a className="button button--outline" href="#contact">Reach out... <ArrowIcon /></a></div>
    </div>
    <a className="scroll-indicator" href="#projects" aria-label="查看项目"><span className="scroll-indicator__orb"><i /></span><span>Scroll</span></a>
  </section>
}

function SectionTitle({ eyebrow, title, subtext, action }: { eyebrow: string; title: React.ReactNode; subtext: string; action?: string }) {
  return <motion.div className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: .85, ease: [.25, .1, .25, 1] }} viewport={{ once: true, margin: '-100px' }}><div><p className="section-label section-label--with-line"><span />{eyebrow}</p><h2>{title}</h2><p className="section-title__subtext">{subtext}</p></div>{action && <span className="section-title__action section-title__note">{action}</span>}</motion.div>
}

function Works() {
  return <section id="work" className="content-section works-section"><SectionTitle eyebrow="Professional Experience" title={<>工作<em>经历</em></>} subtext="8 年 UX 设计经验，聚焦 AI Agent、跨境电商、教育产品与知识服务。" action="4 段经历" /><div className="experience-timeline">{projects.map((project, index) => <motion.article key={project.company} className="timeline-entry" initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: index * .08 }} viewport={{ once: true, margin: '-60px' }}><time className="timeline-entry__date">{project.date}</time><span className="timeline-entry__marker" aria-hidden="true"><i /></span><div className="timeline-entry__content"><p>{project.company}</p><h3>{project.title}</h3><span className="timeline-entry__focus">{project.focus}</span><ul className="timeline-entry__details">{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></div></motion.article>)}</div></section>
}

function ProjectDetail({ project, onClose }: { project: (typeof projectShowcases)[number]; onClose: () => void }) {
  const galleryImages = project.gallery ? detailImagesFor(project.gallery) : []
  const images = galleryImages.slice(project.galleryStart ?? 0, project.galleryLimit ? (project.galleryStart ?? 0) + project.galleryLimit : undefined)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
  return <motion.article className="project-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`${project.title}项目详情`}><header className="project-detail__bar"><button type="button" onClick={onClose} aria-label="关闭项目详情"><X size={18} /><span>关闭详情</span></button><p>{project.brand}</p></header><div className="project-detail__intro"><p className="section-label">Project Case Study</p><h2>{project.title}</h2><p>{project.detail}</p><span>{images.length} 个设计画面</span></div><div className="project-detail__gallery">{images.map((source, index) => <img key={source} src={source} alt={`${project.title}设计画面 ${index + 1}`} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />)}</div></motion.article>
}

function ProjectShowcase() {
  const [activeProject, setActiveProject] = useState<(typeof projectShowcases)[number] | null>(null)
  const [detailProject, setDetailProject] = useState<(typeof projectShowcases)[number] | null>(null)
  const openProject = (project: (typeof projectShowcases)[number]) => project.gallery ? setDetailProject(project) : setActiveProject(project)
  return <section id="projects" className="projects-section"><div className="content-section projects-section__inner"><SectionTitle eyebrow="Selected Projects" title={<>项目<em>展示</em></>} subtext="覆盖跨境电商、教育产品、知识服务与品牌体验的设计实践。" action="6 个项目" /><div className="showcase-grid">{projectShowcases.map((project, index) => <motion.button type="button" key={project.src} className="showcase-card" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: (index % 3) * .07 }} viewport={{ once: true, margin: '-70px' }} onClick={() => openProject(project)} aria-label={`查看 ${project.brand}${project.title}${project.gallery ? '项目详情' : '项目封面'}`}><img src={project.src} alt={`${project.brand}${project.title}项目封面`} /><span className="showcase-card__shade" /><span className="showcase-card__caption"><span>{String(index + 1).padStart(2, '0')}</span><strong>{project.title}</strong><small>{project.detail}</small><i>{project.gallery ? '查看详情' : '点击查看'} <ArrowIcon /></i></span></motion.button>)}</div></div><AnimatePresence>{activeProject && <motion.div className="lightbox showcase-lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveProject(null)} role="dialog" aria-modal="true" aria-label={`${activeProject.title}项目封面预览`}><motion.div className="lightbox__content showcase-lightbox__content" initial={{ scale: .96 }} animate={{ scale: 1 }} exit={{ scale: .96 }} onClick={(event) => event.stopPropagation()}><img src={activeProject.src} alt={`${activeProject.brand}${activeProject.title}项目封面`} /><div><span>{activeProject.brand}</span><strong>{activeProject.title}</strong><small>{activeProject.detail}</small></div><button type="button" onClick={() => setActiveProject(null)} aria-label="关闭项目封面预览"><X size={20} /></button></motion.div></motion.div>}</AnimatePresence><AnimatePresence>{detailProject && <ProjectDetail project={detailProject} onClose={() => setDetailProject(null)} />}</AnimatePresence></section>
}

function Journal() {
  return <section id="advantages" className="content-section journal-section"><SectionTitle eyebrow="Core Strengths" title={<>个人<em>优势</em></>} subtext="从全流程设计到 AI 协同，让策略、体验与交付保持同一节奏。" action="UX 能力" /><div className="journal-list">{strengths.map((strength, index) => <motion.article key={strength.number} className="journal-entry" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: index * .06 }} viewport={{ once: true }}><span className="journal-entry__number">{strength.number}</span><span className="journal-entry__title">{strength.title}</span><span className="journal-entry__meta">{strength.description}</span><ArrowIcon /></motion.article>)}</div></section>
}

function Stats() {
  const stats = [{ value: '8+', label: '年 UX 设计经验' }, { value: '4', label: '段完整工作经历' }, { value: 'B / C', label: '端项目设计经验' }]
  return <section id="stats" className="stats-section"><div className="stats-section__inner">{stats.map((stat, index) => <motion.div key={stat.label} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: index * .1 }} viewport={{ once: true }}><p>{stat.value}</p><span>{stat.label}</span></motion.div>)}</div></section>
}

function Contact() {
  const marquee = Array.from({ length: 10 }, () => 'DESIGN FOR RESULTS •').join(' ')
  return <footer id="contact" className="contact-section"><CinematicVideo className="contact-section__video" /><div className="contact-section__veil" /><div className="contact-section__marquee" aria-hidden="true"><span>{marquee}</span><span>{marquee}</span></div><div className="contact-section__content"><h2>用设计，帮助业务 <em>拿结果。</em></h2><div className="contact-details" aria-label="联系方式"><a className="contact-detail" href="tel:15606929798" aria-label="致电 156 0692 9798"><Phone aria-hidden="true" /><strong>156 0692 9798</strong></a><a className="contact-detail" href="mailto:1021517054@qq.com" aria-label="发送邮件至 1021517054@qq.com"><Mail aria-hidden="true" /><strong>1021517054@qq.com</strong></a></div></div></footer>
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  return <><AnimatePresence>{isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}</AnimatePresence><Navbar /><main><Hero /><Works /><ProjectShowcase /><Journal /><Stats /></main><Contact /></>
}

export default App
