'use client'

import { useState, useEffect, useRef } from 'react'

const WA_NUMBER = '5565999385035'
const WA_MESSAGE = 'Olá, gostaria de agendar uma avaliação com a Dra. Letícia Junqueira'
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

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

// ── Design tokens ─────────────────────────────────────────────────────────────

const gold       = '#B8943F'
const goldLight  = '#D4AF6A'
const goldDark   = '#8A6D2A'
const goldBg     = '#FBF7EF'
const goldBorder = 'rgba(184,148,63,0.25)'
const cream      = '#FAF8F4'
const text       = '#1C1917'
const textMuted  = '#78716C'
const white      = '#FFFFFF'

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatItem({ value, suffix, prefix = '', label }: {
  value: number; suffix: string; prefix?: string; label: string
}) {
  const { ref, inView } = useInView()
  const count = useCounter(value, 1800, inView)
  return (
    <div ref={ref} className="text-center px-2">
      <p className="text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums whitespace-nowrap" style={{ color: gold }}>
        {prefix}{count}{suffix}
      </p>
      <p className="mt-2 text-[10px] sm:text-xs uppercase tracking-widest leading-tight" style={{ color: textMuted }}>
        {label}
      </p>
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const services = [
  {
    emoji: '🦷',
    title: 'Implantes Dentários',
    desc: 'Reposição de dentes perdidos com implantes de titânio de alta qualidade, devolvendo função e estética com naturalidade.',
  },
  {
    emoji: '😁',
    title: 'Prótese Protocolo',
    desc: 'Solução completa para pacientes edêntulos — uma arcada fixa e definitiva sobre implantes com resultado imediato.',
  },
  {
    emoji: '✨',
    title: 'Ortodontia',
    desc: 'Alinhamento dos dentes com aparelhos fixos ou alinhadores transparentes para um sorriso harmônico e funcional.',
  },
  {
    emoji: '🔬',
    title: 'Endodontia',
    desc: 'Tratamento de canal especializado para salvar dentes comprometidos, eliminando dor e infecção com precisão.',
  },
  {
    emoji: '💎',
    title: 'Facetas em Resina',
    desc: 'Transformação estética do sorriso com facetas de resina direta, sem desgaste dental excessivo e com resultado imediato.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Agende sua Avaliação',
    desc: 'Entre em contato pelo WhatsApp e agende um horário conveniente para você.',
  },
  {
    num: '02',
    title: 'Avaliação Personalizada',
    desc: 'A Dra. Letícia realiza um diagnóstico completo e apresenta o plano de tratamento ideal.',
  },
  {
    num: '03',
    title: 'Inicie o Tratamento',
    desc: 'Com o plano definido, inicie seu tratamento com toda segurança, conforto e cuidado.',
  },
]

const schedule = [
  { day: 'Segunda-feira',  hours: '08:00 – 12:00 | 14:00 – 18:00' },
  { day: 'Terça-feira',    hours: '08:00 – 12:00 | 14:00 – 18:00' },
  { day: 'Quarta-feira',   hours: '08:00 – 12:00 | 14:00 – 18:00' },
  { day: 'Quinta-feira',   hours: '08:00 – 12:00 | 14:00 – 18:00' },
  { day: 'Sexta-feira',    hours: '08:00 – 12:00 | 14:00 – 18:00' },
  { day: 'Sábado',         hours: 'Fechado' },
  { day: 'Domingo',        hours: 'Fechado' },
]

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
    <div className="min-h-screen overflow-x-hidden" style={{ background: white, color: text, fontFamily: 'var(--font-dm-sans, sans-serif)' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={scrolled ? {
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${goldBorder}`,
          boxShadow: '0 4px 24px rgba(184,148,63,0.08)',
        } : { background: 'transparent' }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <p className="text-base font-bold tracking-wide" style={{ color: goldDark }}>Dra. Letícia Junqueira</p>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: textMuted }}>Odontologia</p>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {[['Serviços','#servicos'],['Sobre','#sobre'],['Contato','#contato']].map(([l,h]) => (
              <a key={l} href={h} className="text-sm font-medium transition-colors duration-200" style={{ color: textMuted }}
                onMouseEnter={e => (e.currentTarget.style.color = gold)}
                onMouseLeave={e => (e.currentTarget.style.color = textMuted)}
              >{l}</a>
            ))}
          </nav>

          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${gold}, ${goldDark})`, boxShadow: `0 4px 16px rgba(184,148,63,0.35)` }}
          >
            Agendar Avaliação
          </a>

          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8" aria-label="Menu">
            <span className={`block h-0.5 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} style={{ background: text }} />
            <span className={`block h-0.5 transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} style={{ background: text }} />
            <span className={`block h-0.5 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} style={{ background: text }} />
          </button>
        </div>

        <div className="md:hidden overflow-hidden transition-all duration-300" style={{ maxHeight: menuOpen ? '280px' : '0', borderBottom: menuOpen ? `1px solid ${goldBorder}` : 'none' }}>
          <div className="px-5 py-4 flex flex-col gap-4" style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)' }}>
            {[['Serviços','#servicos'],['Sobre','#sobre'],['Contato','#contato']].map(([l,h]) => (
              <a key={l} href={h} onClick={() => setMenuOpen(false)} className="text-sm font-medium py-1" style={{ color: textMuted }}>{l}</a>
            ))}
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="text-center py-3 rounded-full text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDark})` }}>
              Agendar Avaliação
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${cream} 0%, ${goldBg} 60%, #F5EDD8 100%)` }}>

        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, rgba(184,148,63,0.12), transparent 70%)` }} />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, rgba(184,148,63,0.08), transparent 70%)` }} />

        {/* Subtle pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${goldDark} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-24 pb-16 w-full">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-6" style={{ background: `rgba(184,148,63,0.12)`, border: `1px solid ${goldBorder}`, color: goldDark }}>
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
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${gold}, ${goldDark})`, boxShadow: `0 8px 24px rgba(184,148,63,0.35)` }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Agendar Avaliação Gratuita
                </a>
                <a href="#servicos" className="flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold transition-all duration-300" style={{ border: `1.5px solid ${goldBorder}`, color: goldDark, background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = goldBg }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  Ver Serviços
                </a>
              </div>

              {/* Mini stats */}
              <div className="mt-10 flex flex-wrap gap-6">
                {[['1.000+','Pacientes'],['1.500+','Procedimentos'],['5.0★','Google']].map(([v,l]) => (
                  <div key={l}>
                    <p className="text-lg font-bold" style={{ color: goldDark }}>{v}</p>
                    <p className="text-xs" style={{ color: textMuted }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image placeholder */}
            <div className="relative hidden md:block">
              <div
                className="w-full aspect-[3/4] rounded-3xl overflow-hidden flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, rgba(184,148,63,0.15), rgba(184,148,63,0.05))`, border: `1px solid ${goldBorder}` }}
              >
                {/* Replace with: <Image src="/leticia/foto-principal.jpg" alt="Dra. Letícia Junqueira" fill className="object-cover" /> */}
                <div className="text-center px-8">
                  <div className="text-5xl mb-4">👩‍⚕️</div>
                  <p className="text-sm font-medium" style={{ color: goldDark }}>Dra. Letícia Junqueira</p>
                  <p className="text-xs mt-1" style={{ color: textMuted }}>Adicione a foto aqui</p>
                  <p className="text-xs mt-1" style={{ color: textMuted }}>public/leticia/foto-principal.jpg</p>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -left-6 bottom-12 px-5 py-3 rounded-2xl shadow-xl" style={{ background: white, border: `1px solid ${goldBorder}` }}>
                <p className="text-xs font-semibold" style={{ color: goldDark }}>+10 anos de experiência</p>
                <p className="text-xs" style={{ color: textMuted }}>Cuiabá - MT</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20" style={{ background: `linear-gradient(135deg, ${goldDark}, ${gold})` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 1000, suffix: '+',  prefix: '',   label: 'Pacientes atendidos' },
            { value: 1500, suffix: '+',  prefix: '',   label: 'Procedimentos realizados' },
            { value: 10,   suffix: '+',  prefix: '',   label: 'Anos de experiência' },
            { value: 5,    suffix: '.0★', prefix: '',  label: 'Avaliação no Google' },
          ].map(s => (
            <div key={s.label} ref={undefined} className="text-center px-2">
              <StatItemLight value={s.value} suffix={s.suffix} prefix={s.prefix} label={s.label} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Serviços ────────────────────────────────────────────────────────── */}
      <section id="servicos" className="py-16 sm:py-24" style={{ background: cream }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-4" style={{ background: `rgba(184,148,63,0.1)`, border: `1px solid ${goldBorder}`, color: goldDark }}>
              Especialidades
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4" style={{ color: text }}>Nossos Serviços</h2>
            <p className="text-sm sm:text-base max-w-lg mx-auto" style={{ color: textMuted }}>
              Tratamentos odontológicos completos com tecnologia de ponta e um cuidado que vai além do técnico.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <div
                key={s.title}
                className="group relative rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: white,
                  border: `1px solid rgba(184,148,63,0.12)`,
                  boxShadow: '0 2px 16px rgba(184,148,63,0.06)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px rgba(184,148,63,0.18)`; e.currentTarget.style.borderColor = goldBorder }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(184,148,63,0.06)'; e.currentTarget.style.borderColor = 'rgba(184,148,63,0.12)' }}
              >
                {/* Top accent */}
                <div className="absolute top-0 left-6 right-6 h-px rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />

                <div className="text-3xl mb-4">{s.emoji}</div>
                <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: text }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{s.desc}</p>

                <div className="mt-5">
                  <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold transition-colors duration-200" style={{ color: gold }}
                    onMouseEnter={e => (e.currentTarget.style.color = goldDark)}
                    onMouseLeave={e => (e.currentTarget.style.color = gold)}
                  >
                    Agendar consulta →
                  </a>
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

            {/* Image */}
            <div className="order-2 md:order-1">
              <div
                className="w-full aspect-square rounded-3xl overflow-hidden flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, rgba(184,148,63,0.1), rgba(184,148,63,0.04))`, border: `1px solid ${goldBorder}` }}
              >
                {/* Replace: <Image src="/leticia/foto-sobre.jpg" alt="Dra. Letícia" fill className="object-cover" /> */}
                <div className="text-center px-8">
                  <div className="text-5xl mb-3">📸</div>
                  <p className="text-xs" style={{ color: textMuted }}>public/leticia/foto-sobre.jpg</p>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 md:order-2">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-5" style={{ background: `rgba(184,148,63,0.1)`, border: `1px solid ${goldBorder}`, color: goldDark }}>
                Sobre a Dra. Letícia
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5" style={{ color: text }}>
                Mais de 10 anos cuidando do seu sorriso com{' '}
                <span style={{ color: gold }}>dedicação e precisão</span>
              </h2>
              <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: textMuted }}>
                A Dra. Letícia Junqueira é especialista em odontologia há mais de 10 anos, oferecendo tratamentos que combinam técnica apurada e um atendimento humanizado para cada paciente.
              </p>
              <p className="text-sm sm:text-base leading-relaxed mb-8" style={{ color: textMuted }}>
                Atua com implantes dentários, prótese protocolo, ortodontia, endodontia e facetas em resina, sempre com foco no conforto, segurança e na melhor experiência para quem a escolhe.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {['Implantes','Prótese Protocolo','Ortodontia','Endodontia','Facetas'].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: `rgba(184,148,63,0.1)`, border: `1px solid ${goldBorder}`, color: goldDark }}>
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm text-white transition-all duration-300 hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${gold}, ${goldDark})`, boxShadow: `0 6px 20px rgba(184,148,63,0.3)` }}
              >
                Agendar uma avaliação
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Processo ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24" style={{ background: white }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-4" style={{ background: `rgba(184,148,63,0.1)`, border: `1px solid ${goldBorder}`, color: goldDark }}>
              Como funciona
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: text }}>Seu tratamento em 3 passos</h2>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            <div className="hidden sm:block absolute top-8 left-[16%] right-[16%] h-px" style={{ background: `linear-gradient(90deg, transparent, ${goldLight}, transparent)` }} />

            {steps.map((s) => (
              <div key={s.num} className="flex sm:block items-start sm:text-center gap-4 sm:gap-0">
                <div className="w-16 h-16 rounded-2xl sm:mx-auto sm:mb-6 flex items-center justify-center font-bold text-lg flex-shrink-0 relative z-10" style={{ background: `linear-gradient(135deg, ${goldBg}, #F0E8D0)`, border: `1.5px solid ${goldBorder}`, color: gold }}>
                  {s.num}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: text }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Horários ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24" style={{ background: cream }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-4" style={{ background: `rgba(184,148,63,0.1)`, border: `1px solid ${goldBorder}`, color: goldDark }}>
              Atendimento
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: text }}>Horários de Funcionamento</h2>
          </div>

          <div className="rounded-3xl overflow-hidden" style={{ border: `1px solid ${goldBorder}`, background: white }}>
            {schedule.map((item, i) => (
              <div key={item.day} className="flex justify-between items-center px-6 py-4" style={{ borderBottom: i < schedule.length - 1 ? `1px solid rgba(184,148,63,0.08)` : 'none' }}>
                <span className="text-sm font-medium" style={{ color: text }}>{item.day}</span>
                <span className="text-sm font-semibold" style={{ color: item.hours === 'Fechado' ? '#EF4444' : goldDark }}>
                  {item.hours}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 rounded-2xl text-center" style={{ background: goldBg, border: `1px solid ${goldBorder}` }}>
            <p className="text-sm" style={{ color: textMuted }}>
              📍 <span className="font-medium" style={{ color: text }}>Av. Dr. Hélio Ribeiro — Alvorada, Cuiabá - MT</span>
            </p>
            <p className="text-xs mt-1" style={{ color: textMuted }}>Helbor Dual Business Office & Corporate</p>
          </div>
        </div>
      </section>

      {/* ── CTA Final ───────────────────────────────────────────────────────── */}
      <section id="contato" className="py-16 sm:py-24 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${goldDark} 0%, ${gold} 50%, ${goldLight} 100%)` }}>
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: `radial-gradient(white 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

        <div className="relative max-w-2xl mx-auto px-5 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4">
            Pronto para transformar o seu sorriso?
          </h2>
          <p className="text-sm sm:text-base mb-8 sm:mb-10" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Agende sua avaliação gratuita agora mesmo pelo WhatsApp e dê o primeiro passo para o sorriso que você merece.
          </p>

          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105"
            style={{ background: white, color: goldDark, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Agendar pelo WhatsApp
          </a>

          <p className="mt-5 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            (65) 99938-5035 · Seg–Sex 08h–18h
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="py-8" style={{ background: text, color: 'rgba(255,255,255,0.5)' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <span className="font-semibold" style={{ color: goldLight }}>Dra. Letícia Junqueira · Odontologia</span>
          <span>© {new Date().getFullYear()} Todos os direitos reservados.</span>
          <span>Cuiabá - MT</span>
        </div>
      </footer>

    </div>
  )
}

// Light stat item (usado na faixa dourada)
function StatItemLight({ value, suffix, prefix = '', label }: {
  value: number; suffix: string; prefix?: string; label: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true) }, { threshold: 0.15 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const count = useCounter(value, 1800, inView)
  return (
    <div ref={ref} className="text-center px-2">
      <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tabular-nums whitespace-nowrap">
        {prefix}{count}{suffix}
      </p>
      <p className="mt-2 text-[10px] sm:text-xs uppercase tracking-widest leading-tight" style={{ color: 'rgba(255,255,255,0.7)' }}>
        {label}
      </p>
    </div>
  )
}
