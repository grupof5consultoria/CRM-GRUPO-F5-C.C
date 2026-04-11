'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const WA_NUMBER = '5565999385035'
const WA_MESSAGE = 'Olá, gostaria de agendar uma avaliação com a Dra. Letícia Junqueira'
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

// ── Design tokens ─────────────────────────────────────────────────────────────
const gold       = '#B8943F'
const goldLight  = '#D4AF6A'
const goldDark   = '#8A6D2A'
const goldBg     = '#FBF7EF'
const goldBorder = 'rgba(184,148,63,0.25)'
const cream      = '#FAF8F4'
const text       = '#1C1917'
const textMuted  = '#78716C'

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, inView }
}

function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTs: number | null = null
    const tick = (now: number) => {
      if (!startTs) startTs = now
      const p = Math.min((now - startTs) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setCount(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, start])
  return count
}

// ── Stat items ────────────────────────────────────────────────────────────────
function StatItemDark({ value, suffix, prefix = '', label }: {
  value: number; suffix: string; prefix?: string; label: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.15 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const count = useCounter(value, 1800, inView)
  return (
    <div ref={ref} className="text-center px-2">
      <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tabular-nums whitespace-nowrap">{prefix}{count}{suffix}</p>
      <p className="mt-2 text-[10px] sm:text-xs uppercase tracking-widest leading-tight" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</p>
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────
const services = [
  { emoji: '🦷', title: 'Implantes Dentários',   desc: 'Reposição de dentes perdidos com implantes de titânio de alta qualidade, devolvendo função e estética com naturalidade.' },
  { emoji: '😁', title: 'Prótese Protocolo',      desc: 'Solução completa para pacientes edêntulos — arcada fixa e definitiva sobre implantes com resultado imediato.' },
  { emoji: '✨', title: 'Ortodontia',             desc: 'Alinhamento dos dentes com aparelhos fixos ou alinhadores transparentes para um sorriso harmônico e funcional.' },
  { emoji: '🔬', title: 'Endodontia',             desc: 'Tratamento de canal especializado para salvar dentes comprometidos, eliminando dor e infecção com precisão.' },
  { emoji: '💎', title: 'Facetas em Resina',      desc: 'Transformação estética do sorriso com facetas de resina direta, sem desgaste dental excessivo e resultado imediato.' },
]

const steps = [
  { num: '01', title: 'Agende sua Avaliação',      desc: 'Entre em contato pelo WhatsApp e escolha um horário conveniente para você.' },
  { num: '02', title: 'Avaliação Personalizada',   desc: 'A Dra. Letícia realiza um diagnóstico completo e apresenta o plano de tratamento ideal.' },
  { num: '03', title: 'Inicie o Tratamento',       desc: 'Com o plano definido, inicie seu tratamento com segurança, conforto e cuidado.' },
]

const clinicPhotos = [
  { src: '/leticia/IMG_8051.JPG',                                       label: 'Instituto Junqueira' },
  { src: '/leticia/IMG_8053.JPG',                                       label: 'Consultório' },
  { src: '/leticia/IMG_8057.JPG',                                       label: 'Espaço Premium' },
  { src: '/leticia/IMG_8050.JPG',                                       label: 'Recepção' },
]

const beforeAfter = [
  {
    before: '/leticia/26955972-1f54-44eb-8500-f93cfb040b84.jpg',
    after:  '/leticia/26e91ebf-24b1-40d4-a337-83a4d28f70bf.jpg',
    label:  'Prótese Protocolo',
  },
  {
    before: '/leticia/8747faef-f3ae-429d-aee9-e6c0b2600a64.jpg',
    after:  '/leticia/01c43b65-f169-4852-b6ce-e893cd1c6015.jpg',
    label:  'Reabilitação Completa',
  },
  {
    combined: '/leticia/4b7d1b28-806b-4902-a9e5-25f536f2edf6.jpg',
    label: 'Ortodontia',
  },
  {
    combined: '/leticia/96cb72cc-a663-493c-86e2-ed1ef00b4d53.jpg',
    label: 'Facetas em Resina',
  },
]

const reviews = [
  {
    name: 'Ericka Alvez',
    time: 'Recentemente',
    text: 'A melhor endodontista do Mato Grosso disparada, sem comparação, inteligente, competente, assertiva, atenciosa, um atendimento fora da curva!',
    initials: 'EA',
  },
  {
    name: 'Fernanda Kunz',
    time: 'Há 4 dias',
    text: 'Profissionais extremamente qualificados e competentes. Atendimento de alto nível e excelente entrega. Recomendo com total confiança.',
    initials: 'FK',
  },
  {
    name: 'Lucy Moura',
    time: 'Há 4 dias',
    text: 'O Instituto Junqueira tem os melhores profissionais no que diz respeito à saúde bucal. A excelência começa na recepção e o corpo clínico é competente. Sou paciente há 4 anos, não troco e recomendo muito.',
    initials: 'LM',
  },
  {
    name: 'Maria Virginia Sesti',
    time: 'Há 9 semanas',
    text: 'Fui atendida pela Dra. Letícia e só tenho elogios. Desde o início me senti muito segura, acolhida e confortável. O consultório é lindo, moderno e muito chique. Experiência excelente do começo ao fim. Recomendo de olhos fechados!',
    initials: 'MV',
  },
  {
    name: 'Luiza Dallarmi',
    time: 'Fev/2024',
    text: 'Maravilhoso!!! São super atenciosos e cuidadosos! A Dra. Letícia é uma profissional impecável, sempre pensando no bem-estar do paciente! Amo, minha clínica favorita!',
    initials: 'LD',
  },
]

const schedule = [
  { day: 'Segunda-feira', hours: '08:00 – 12:00 | 14:00 – 18:00' },
  { day: 'Terça-feira',   hours: '08:00 – 12:00 | 14:00 – 18:00' },
  { day: 'Quarta-feira',  hours: '08:00 – 12:00 | 14:00 – 18:00' },
  { day: 'Quinta-feira',  hours: '08:00 – 12:00 | 14:00 – 18:00' },
  { day: 'Sexta-feira',   hours: '08:00 – 12:00 | 14:00 – 18:00' },
  { day: 'Sábado',        hours: 'Fechado' },
  { day: 'Domingo',       hours: 'Fechado' },
]

// ── WhatsApp icon ─────────────────────────────────────────────────────────────
function WaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LeticiaPage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#fff', color: text, fontFamily: 'var(--font-dm-sans, sans-serif)' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={scrolled ? { background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${goldBorder}`, boxShadow: '0 4px 24px rgba(184,148,63,0.08)' } : { background: 'transparent' }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold tracking-wide" style={{ color: goldDark }}>Dra. Letícia Junqueira</p>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: textMuted }}>Odontologia · Cuiabá - MT</p>
          </div>
          <nav className="hidden md:flex items-center gap-7">
            {[['Serviços','#servicos'],['Clínica','#clinica'],['Resultados','#resultados'],['Avaliações','#avaliacoes'],['Sobre','#sobre'],['Contato','#contato']].map(([l,h]) => (
              <a key={l} href={h} className="text-sm font-medium transition-colors" style={{ color: textMuted }}
                onMouseEnter={e => (e.currentTarget.style.color = gold)}
                onMouseLeave={e => (e.currentTarget.style.color = textMuted)}
              >{l}</a>
            ))}
          </nav>
          <a href={WA_URL} target="_blank" rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${gold}, ${goldDark})`, boxShadow: `0 4px 16px rgba(184,148,63,0.35)` }}
          >
            <WaIcon /> Agendar
          </a>
          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8" aria-label="Menu">
            <span className={`block h-0.5 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} style={{ background: text }} />
            <span className={`block h-0.5 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} style={{ background: text }} />
            <span className={`block h-0.5 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} style={{ background: text }} />
          </button>
        </div>
        <div className="md:hidden overflow-hidden transition-all duration-300" style={{ maxHeight: menuOpen ? '300px' : '0', borderBottom: menuOpen ? `1px solid ${goldBorder}` : 'none' }}>
          <div className="px-5 py-4 flex flex-col gap-4" style={{ background: 'rgba(255,255,255,0.97)' }}>
            {[['Serviços','#servicos'],['Clínica','#clinica'],['Resultados','#resultados'],['Avaliações','#avaliacoes'],['Sobre','#sobre'],['Contato','#contato']].map(([l,h]) => (
              <a key={l} href={h} onClick={() => setMenuOpen(false)} className="text-sm py-1" style={{ color: textMuted }}>{l}</a>
            ))}
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${gold}, ${goldDark})` }}
            >
              <WaIcon /> Agendar Avaliação
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16"
        style={{ background: `linear-gradient(135deg, ${cream} 0%, ${goldBg} 60%, #F5EDD8 100%)` }}
      >
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, rgba(184,148,63,0.1), transparent 70%)` }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${goldDark} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-12 w-full">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-6"
                style={{ background: `rgba(184,148,63,0.12)`, border: `1px solid ${goldBorder}`, color: goldDark }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Atendimento com hora marcada
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-5" style={{ color: text }}>
                Seu sorriso merece{' '}
                <span style={{ color: gold }}>o melhor cuidado</span>
              </h1>
              <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: textMuted }}>
                Há mais de 10 anos transformando sorrisos com excelência, precisão e um atendimento verdadeiramente humano. Cuiabá - MT.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${gold}, ${goldDark})`, boxShadow: `0 8px 24px rgba(184,148,63,0.35)` }}
                >
                  <WaIcon /> Agendar Avaliação Gratuita
                </a>
                <a href="#resultados"
                  className="flex items-center justify-center px-7 py-4 rounded-full font-semibold transition-all duration-300"
                  style={{ border: `1.5px solid ${goldBorder}`, color: goldDark }}
                  onMouseEnter={e => (e.currentTarget.style.background = goldBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  Ver Resultados →
                </a>
              </div>
              <div className="mt-10 flex flex-wrap gap-6">
                {[['1.000+','Pacientes'],['1.500+','Procedimentos'],['5.0 ★','Google']].map(([v,l]) => (
                  <div key={l}>
                    <p className="text-lg font-bold" style={{ color: goldDark }}>{v}</p>
                    <p className="text-xs" style={{ color: textMuted }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero photo */}
            <div className="relative hidden md:block">
              <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/leticia/3ff7d43f-5bb7-4e1b-bdb3-892020aba630.jpg"
                  alt="Dra. Letícia Junqueira"
                  fill
                  className="object-cover object-top"
                  priority
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.15), transparent 60%)' }} />
              </div>
              {/* Floating badge */}
              <div className="absolute -left-5 bottom-10 px-5 py-3 rounded-2xl shadow-xl" style={{ background: '#fff', border: `1px solid ${goldBorder}` }}>
                <p className="text-xs font-bold" style={{ color: goldDark }}>+10 anos de experiência</p>
                <p className="text-xs" style={{ color: textMuted }}>Instituto Junqueira · Cuiabá</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20" style={{ background: `linear-gradient(135deg, ${goldDark}, ${gold})` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItemDark value={1000} suffix="+"   label="Pacientes atendidos" />
          <StatItemDark value={1500} suffix="+"   label="Procedimentos realizados" />
          <StatItemDark value={10}   suffix="+"   label="Anos de experiência" />
          <StatItemDark value={5}    suffix=".0★" label="Avaliação no Google" />
        </div>
      </section>

      {/* ── Serviços ────────────────────────────────────────────────────────── */}
      <section id="servicos" className="py-16 sm:py-24" style={{ background: cream }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-4" style={{ background: `rgba(184,148,63,0.1)`, border: `1px solid ${goldBorder}`, color: goldDark }}>Especialidades</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4" style={{ color: text }}>Nossos Serviços</h2>
            <p className="text-sm sm:text-base max-w-lg mx-auto" style={{ color: textMuted }}>Tratamentos odontológicos completos com tecnologia de ponta e cuidado que vai além do técnico.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <div key={s.title}
                className="relative rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 cursor-default"
                style={{ background: '#fff', border: `1px solid rgba(184,148,63,0.12)`, boxShadow: '0 2px 16px rgba(184,148,63,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px rgba(184,148,63,0.18)`; e.currentTarget.style.borderColor = goldBorder }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(184,148,63,0.06)'; e.currentTarget.style.borderColor = 'rgba(184,148,63,0.12)' }}
              >
                <div className="absolute top-0 left-6 right-6 h-px rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
                <div className="text-3xl mb-4">{s.emoji}</div>
                <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: text }}>{s.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: textMuted }}>{s.desc}</p>
                <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold" style={{ color: gold }}>Agendar consulta →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clínica ─────────────────────────────────────────────────────────── */}
      <section id="clinica" className="py-16 sm:py-24" style={{ background: '#fff' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-4" style={{ background: `rgba(184,148,63,0.1)`, border: `1px solid ${goldBorder}`, color: goldDark }}>Nosso Espaço</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4" style={{ color: text }}>Um ambiente feito para você</h2>
            <p className="text-sm sm:text-base max-w-lg mx-auto" style={{ color: textMuted }}>Localizado em um dos edifícios mais modernos de Cuiabá, nosso espaço foi projetado para oferecer conforto e sofisticação.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {clinicPhotos.map((photo) => (
              <div key={photo.src} className="relative rounded-2xl overflow-hidden group" style={{ aspectRatio: '3/4' }}>
                <Image src={photo.src} alt={photo.label} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100" style={{ background: 'linear-gradient(to top, rgba(138,109,42,0.7), transparent)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-xs font-semibold">{photo.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Endereço */}
          <div className="mt-8 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left" style={{ background: goldBg, border: `1px solid ${goldBorder}` }}>
            <div className="text-2xl">📍</div>
            <div>
              <p className="font-semibold text-sm" style={{ color: text }}>Av. Dr. Hélio Ribeiro — Alvorada, Cuiabá - MT</p>
              <p className="text-xs mt-0.5" style={{ color: textMuted }}>Helbor Dual Business Office & Corporate · 78048-848</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Resultados / Antes e Depois ──────────────────────────────────────── */}
      <section id="resultados" className="py-16 sm:py-24" style={{ background: cream }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-4" style={{ background: `rgba(184,148,63,0.1)`, border: `1px solid ${goldBorder}`, color: goldDark }}>Transformações Reais</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4" style={{ color: text }}>Antes e Depois</h2>
            <p className="text-sm sm:text-base max-w-lg mx-auto" style={{ color: textMuted }}>Resultados reais de pacientes reais — cada sorriso é único e tratado com dedicação exclusiva.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {beforeAfter.map((item) => (
              <div key={item.label} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${goldBorder}`, background: '#fff' }}>
                {item.combined ? (
                  <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
                    <Image src={item.combined} alt={item.label} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                      <Image src={item.before!} alt="Antes" fill className="object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold text-white" style={{ background: 'rgba(0,0,0,0.55)' }}>ANTES</div>
                    </div>
                    <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                      <Image src={item.after!} alt="Depois" fill className="object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold text-white" style={{ background: `rgba(184,148,63,0.85)` }}>DEPOIS</div>
                    </div>
                  </div>
                )}
                <div className="p-3 text-center">
                  <p className="text-sm font-semibold" style={{ color: goldDark }}>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sobre ────────────────────────────────────────────────────────────── */}
      <section id="sobre" className="py-16 sm:py-24" style={{ background: goldBg }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ aspectRatio: '3/4' }}>
              <Image
                src="/leticia/5bda90fc-fa80-444c-9438-1658d92ffd3f.jpg"
                alt="Dra. Letícia Junqueira"
                fill
                className="object-cover object-top"
              />
            </div>
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-5" style={{ background: `rgba(184,148,63,0.1)`, border: `1px solid ${goldBorder}`, color: goldDark }}>Sobre a Dra. Letícia</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5" style={{ color: text }}>
                Mais de 10 anos cuidando do seu sorriso com{' '}
                <span style={{ color: gold }}>dedicação e precisão</span>
              </h2>
              <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: textMuted }}>
                A Dra. Letícia Junqueira é especialista em odontologia há mais de 10 anos, oferecendo tratamentos que combinam técnica apurada com um atendimento humanizado para cada paciente.
              </p>
              <p className="text-sm sm:text-base leading-relaxed mb-8" style={{ color: textMuted }}>
                Atua com implantes dentários, prótese protocolo, ortodontia, endodontia e facetas em resina, sempre com foco no conforto, segurança e na melhor experiência para quem a escolhe.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['Implantes','Prótese Protocolo','Ortodontia','Endodontia','Facetas'].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: `rgba(184,148,63,0.1)`, border: `1px solid ${goldBorder}`, color: goldDark }}>{tag}</span>
                ))}
              </div>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm text-white transition-all duration-300 hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${gold}, ${goldDark})`, boxShadow: `0 6px 20px rgba(184,148,63,0.3)` }}
              >
                <WaIcon /> Agendar uma avaliação
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Processo ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24" style={{ background: '#fff' }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-4" style={{ background: `rgba(184,148,63,0.1)`, border: `1px solid ${goldBorder}`, color: goldDark }}>Como funciona</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: text }}>Seu tratamento em 3 passos</h2>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            <div className="hidden sm:block absolute top-8 left-[16%] right-[16%] h-px pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${goldLight}, transparent)` }} />
            {steps.map((s) => (
              <div key={s.num} className="flex sm:block items-start sm:text-center gap-4 sm:gap-0">
                <div className="w-16 h-16 rounded-2xl sm:mx-auto sm:mb-6 flex items-center justify-center font-bold text-lg flex-shrink-0 relative z-10"
                  style={{ background: `linear-gradient(135deg, ${goldBg}, #F0E8D0)`, border: `1.5px solid ${goldBorder}`, color: gold }}
                >{s.num}</div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: text }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ─────────────────────────────────────────────────────── */}
      <section id="avaliacoes" className="py-16 sm:py-24" style={{ background: goldBg }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-4" style={{ background: `rgba(184,148,63,0.1)`, border: `1px solid ${goldBorder}`, color: goldDark }}>Avaliações</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4" style={{ color: text }}>O que dizem nossos pacientes</h2>
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {[...Array(5)].map((_,i) => (
                <svg key={i} className="w-5 h-5" viewBox="0 0 20 20" fill={gold}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              ))}
              <span className="ml-2 text-sm font-bold" style={{ color: goldDark }}>5.0 no Google</span>
            </div>
            <p className="text-xs" style={{ color: textMuted }}>Avaliações reais de pacientes do Instituto Junqueira</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <div key={r.name} className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
                style={{ background: '#fff', border: `1px solid ${goldBorder}`, boxShadow: '0 2px 16px rgba(184,148,63,0.07)' }}
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_,i) => (
                    <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill={gold}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                {/* Quote mark */}
                <p className="text-sm leading-relaxed flex-1" style={{ color: textMuted }}>
                  <span className="text-2xl leading-none font-serif mr-1" style={{ color: goldLight }}>&ldquo;</span>
                  {r.text}
                </p>
                {/* Author */}
                <div className="flex items-center gap-3 pt-2" style={{ borderTop: `1px solid rgba(184,148,63,0.1)` }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${gold}, ${goldDark})` }}
                  >{r.initials}</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: text }}>{r.name}</p>
                    <p className="text-xs" style={{ color: textMuted }}>{r.time} · Google</p>
                  </div>
                  <svg className="ml-auto w-5 h-5 opacity-30" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Google rating badge */}
          <div className="mt-10 flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full" style={{ background: '#fff', border: `1px solid ${goldBorder}`, boxShadow: '0 2px 12px rgba(184,148,63,0.1)' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-semibold" style={{ color: text }}>5.0</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_,i) => (
                  <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill={gold}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
              </div>
              <span className="text-xs" style={{ color: textMuted }}>Google Meu Negócio</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Horários ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24" style={{ background: cream }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-4" style={{ background: `rgba(184,148,63,0.1)`, border: `1px solid ${goldBorder}`, color: goldDark }}>Atendimento</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: text }}>Horários de Funcionamento</h2>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-sm" style={{ border: `1px solid ${goldBorder}`, background: '#fff' }}>
            {schedule.map((item, i) => (
              <div key={item.day} className="flex justify-between items-center px-6 py-4"
                style={{ borderBottom: i < schedule.length - 1 ? `1px solid rgba(184,148,63,0.08)` : 'none' }}
              >
                <span className="text-sm font-medium" style={{ color: text }}>{item.day}</span>
                <span className="text-sm font-semibold" style={{ color: item.hours === 'Fechado' ? '#EF4444' : goldDark }}>{item.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ───────────────────────────────────────────────────────── */}
      <section id="contato" className="py-16 sm:py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${goldDark} 0%, ${gold} 50%, ${goldLight} 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: `radial-gradient(white 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
        <div className="relative max-w-2xl mx-auto px-5 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4">Pronto para transformar o seu sorriso?</h2>
          <p className="text-sm sm:text-base mb-8 sm:mb-10" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Agende sua avaliação gratuita pelo WhatsApp e dê o primeiro passo para o sorriso que você merece.
          </p>
          <a href={WA_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105"
            style={{ background: '#fff', color: goldDark, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
          >
            <WaIcon /> Agendar pelo WhatsApp
          </a>
          <p className="mt-5 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>(65) 99938-5035 · Seg–Sex 08h–18h</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="py-8" style={{ background: text }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span className="font-semibold" style={{ color: goldLight }}>Dra. Letícia Junqueira · Odontologia</span>
          <span>© {new Date().getFullYear()} Todos os direitos reservados.</span>
          <span>Cuiabá - MT</span>
        </div>
      </footer>

    </div>
  )
}
