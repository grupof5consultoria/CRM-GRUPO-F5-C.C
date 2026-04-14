'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const WA_NUMBER = '5511984314897'
const WA_MESSAGE = 'Olá, gostaria de um diagnostico para a minha clinica'
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

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatItem({ value, suffix, prefix = '', label }: {
  value: number; suffix: string; prefix?: string; label: string
}) {
  const { ref, inView } = useInView()
  const count = useCounter(value, 1800, inView)
  return (
    <div ref={ref} className="text-center px-2">
      <p className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text tabular-nums whitespace-nowrap">
        {prefix}{count}{suffix}
      </p>
      <p className="mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 leading-tight">{label}</p>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-medium"
      style={{
        background: 'rgba(124,58,237,0.1)',
        border: '1px solid rgba(124,58,237,0.25)',
        color: '#a78bfa',
      }}
    >
      {children}
    </span>
  )
}

// ── Data ────────────────────────────────────────────────────────────────────────

const methodology = [
  {
    num: '01', emoji: '🎯', title: 'Captação',
    desc: 'Identificamos seu público ideal e criamos campanhas que geram demanda qualificada e previsível.',
  },
  {
    num: '02', emoji: '💰', title: 'Receita',
    desc: 'Convertemos leads em agendamentos e agendamentos em pacientes pagantes com alto ticket.',
  },
  {
    num: '03', emoji: '🤝', title: 'Engajamento',
    desc: 'Construímos relacionamentos que fidelizam pacientes e geram indicações consistentes.',
  },
  {
    num: '04', emoji: '🚀', title: 'Monetização',
    desc: 'Maximizamos o valor de cada cliente, identificando oportunidades de upsell e recompra.',
  },
]

const services = [
  {
    emoji: '📈', title: 'Tráfego Pago',
    desc: 'Anúncios estratégicos no Meta Ads e Google Ads com segmentação precisa para atrair pacientes qualificados.',
    color: 'rgba(124,58,237,0.14)',
  },
  {
    emoji: '🎯', title: 'Gestão de Leads',
    desc: 'Capturamos, qualificamos e nutrimos cada lead até a conversão, maximizando seu retorno sobre investimento.',
    color: 'rgba(109,40,217,0.14)',
  },
  {
    emoji: '🏆', title: 'Treinamento Comercial',
    desc: 'Capacitamos sua equipe com scripts e técnicas comprovadas para converter consultas em vendas fechadas.',
    color: 'rgba(124,58,237,0.14)',
  },
  {
    emoji: '🧠', title: 'Consultoria Estratégica',
    desc: 'Diagnóstico completo do seu negócio e plano personalizado de crescimento com metas e prazos definidos.',
    color: 'rgba(109,40,217,0.14)',
  },
]

const steps = [
  {
    num: '01', title: 'Diagnóstico',
    desc: 'Analisamos sua operação atual, identificando gargalos e as principais oportunidades de crescimento.',
  },
  {
    num: '02', title: 'Análise Estratégica',
    desc: 'Mapeamos o mercado e desenhamos a estratégia mais eficiente para o seu perfil de negócio.',
  },
  {
    num: '03', title: 'Plano de Ação',
    desc: 'Entregamos um plano detalhado com ações, prazos, responsáveis e metas mensuráveis.',
  },
]

const growthCases = [
  {
    initials: 'CS',
    name: 'Dra. Camila Santiago',
    specialty: 'Odontologia Estética & Implantes',
    city: 'São Paulo - SP',
    before: {
      label: 'Antes',
      icon: '📍',
      text: 'Atendia em 3 clínicas populares diferentes, alugando sala por hora. Sem identidade própria, sem controle de agenda e sem previsibilidade de renda.',
    },
    after: {
      label: 'Depois',
      icon: '🏛️',
      text: 'Hoje atende em espaço próprio, com agenda lotada, marca consolidada e fluxo constante de pacientes — sem depender de clínicas de terceiros.',
    },
    result: 'Do aluguel de sala para o espaço próprio',
    color: '#7c3aed',
  },
  {
    initials: 'SW',
    name: 'Dra. Sabrina Wervisch',
    specialty: 'Harmonização Orofacial & Estética',
    city: 'São Paulo - SP',
    before: {
      label: 'Antes',
      icon: '📍',
      text: 'Atuava em clínicas populares sem autonomia, com dificuldade para fidelizar pacientes e dependendo inteiramente de espaços de terceiros para trabalhar.',
    },
    after: {
      label: 'Depois',
      icon: '🚀',
      text: 'Com demanda própria e consistente, hoje aluga sala diária para realizar os procedimentos — com autonomia, agenda organizada e pacientes que chegam por ela.',
    },
    result: 'Autonomia e demanda própria consolidada',
    color: '#0ea5e9',
  },
]

const testimonials = [
  {
    name: 'Dr. Carlos Mendes', role: 'Clínica Sorriso Perfeito • São Paulo',
    text: 'Em 3 meses triplicamos os agendamentos mensais. A equipe do Grupo F5 vai muito além do esperado, entregando resultados que agências anteriores nunca conseguiram.',
    stars: 5,
  },
  {
    name: 'Dra. Ana Lima', role: 'OdontoVida Clínica • Rio de Janeiro',
    text: 'O investimento em tráfego pago com eles é completamente diferente. Cada real investido retorna multiplicado. Dedicação e profissionalismo fora do comum.',
    stars: 5,
  },
  {
    name: 'Dr. Rafael Costa', role: 'Centro Odontológico Costa • BH',
    text: 'Depois do treinamento comercial minha taxa de fechamento aumentou mais de 60%. Hoje sei exatamente como converter uma consulta em venda.',
    stars: 5,
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    window.open(WA_URL, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={scrolled ? {
          background: 'rgba(8,8,8,0.88)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        } : {}}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold gradient-text tracking-tight select-none">GRUPO F5</span>

          <nav className="hidden md:flex items-center gap-8">
            {[
              ['Metodologia', '#metodologia'],
              ['Serviços',    '#servicos'],
              ['Resultados',  '#resultados'],
              ['Casos Reais', '#casos'],
              ['Depoimentos', '#depoimentos'],
            ].map(([label, href]) => (
              <a key={label} href={href} className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
                {label}
              </a>
            ))}
          </nav>

          <a href="#contato" className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold glow-btn">
            Falar com especialista <span>→</span>
          </a>

          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8" aria-label="Menu">
            <span className={`block h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{ maxHeight: menuOpen ? '320px' : '0', borderBottom: menuOpen ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
        >
          <div className="px-6 py-4 flex flex-col gap-4" style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(24px)' }}>
            {[['Metodologia','#metodologia'],['Serviços','#servicos'],['Resultados','#resultados'],['Casos Reais','#casos'],['Depoimentos','#depoimentos']].map(([l,h]) => (
              <a key={l} href={h} onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors py-1">{l}</a>
            ))}
            <a href="#contato" onClick={() => setMenuOpen(false)} className="text-center py-3 rounded-xl font-semibold glow-btn">
              Falar com especialista
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[#080808]" />

        {/* Orbs */}
        <div className="absolute animate-orb pointer-events-none" style={{ top: '10%', left: '-8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, rgba(124,58,237,0.28), transparent 65%)', filter: 'blur(48px)' }} />
        <div className="absolute animate-orb-2 pointer-events-none" style={{ bottom: '5%', right: '-8%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle at 60% 60%, rgba(109,40,217,0.22), transparent 65%)', filter: 'blur(56px)' }} />
        <div className="absolute animate-orb-3 pointer-events-none" style={{ top: '40%', left: '35%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.07), transparent 70%)', filter: 'blur(40px)' }} />

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #080808 100%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 mb-6 sm:mb-8">
            <Badge>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              100+ clínicas atendidas
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-5 sm:mb-6">
            Transformamos clínicas em{' '}
            <br className="hidden sm:block" />
            <span className="gradient-text-animated">máquinas de agendamento</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Estratégia, tecnologia e execução de alto nível para clínicas odontológicas que querem crescimento previsível e escalável.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a href="#contato" className="px-7 py-3.5 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base font-semibold glow-btn animate-pulse-glow">
              Quero consultoria gratuita
            </a>
            <a href="#resultados" className="px-7 py-3.5 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base font-semibold text-gray-300 hover:text-white transition-all duration-300" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              Ver resultados →
            </a>
          </div>

          <div className="mt-10 sm:mt-16 flex flex-wrap justify-center gap-2 sm:gap-3">
            {['R$20M+ em vendas', '100+ empresas', 'Retorno em 12h'].map(pill => (
              <span key={pill} className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs text-gray-400" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 opacity-30">
          <span className="text-[10px] uppercase tracking-widest">scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section id="resultados" className="py-16 md:py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, #0a0a0a, #0d0d0d)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          <StatItem value={100} suffix="+" label="Empresas atendidas" />
          <StatItem value={20}  suffix="M+" prefix="R$" label="Em vendas geradas" />
          <StatItem value={10}  suffix="M+" prefix="R$" label="Em demanda captada" />
          <StatItem value={2}   suffix="+" label="Anos de experiência" />
        </div>
      </section>

      {/* ── Metodologia ─────────────────────────────────────────────────────── */}
      <section id="metodologia" className="py-16 sm:py-24 md:py-28 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.05), transparent 60%)' }} />
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <Badge>Nossa metodologia</Badge>
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-bold">O Método <span className="gradient-text">F5</span></h2>
            <p className="mt-3 text-gray-400 text-sm sm:text-base max-w-lg mx-auto">Um sistema completo de 4 pilares que transforma seu negócio em uma operação previsível e escalável.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {methodology.map((m) => (
              <div key={m.num} className="glass-card card-hover top-line relative rounded-2xl p-5 sm:p-6 overflow-hidden">
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{m.emoji}</div>
                <p className="text-xs font-mono text-gray-600 mb-1">{m.num}</p>
                <h3 className="text-base sm:text-lg font-bold mb-2">{m.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Serviços ────────────────────────────────────────────────────────── */}
      <section id="servicos" className="py-16 sm:py-24 md:py-28" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <Badge>O que oferecemos</Badge>
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-bold">Nossos Serviços</h2>
            <p className="mt-3 text-gray-400 text-sm sm:text-base max-w-lg mx-auto">Soluções completas e integradas para crescimento sustentável de clínicas odontológicas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {services.map((s) => (
              <div key={s.title} className="glass-card card-hover top-line relative rounded-2xl p-5 sm:p-7">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0" style={{ background: s.color }}>
                    {s.emoji}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Processo ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(109,40,217,0.06), transparent 60%)' }} />
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <Badge>Como funciona</Badge>
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-bold">
              Consultoria <span className="gradient-text">gratuita</span> em 3 passos
            </h2>
            <p className="mt-3 text-gray-400 text-sm sm:text-base max-w-lg mx-auto">Do primeiro contato ao plano de ação em mãos — sem compromisso.</p>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            <div className="hidden sm:block absolute top-8 left-[16%] right-[16%] h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), rgba(109,40,217,0.3), transparent)' }} />
            {steps.map((s, i) => (
              <div key={s.num} className="flex sm:block items-start sm:text-center gap-4 sm:gap-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:mx-auto sm:mb-6 flex items-center justify-center font-bold text-base sm:text-lg relative z-10 flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(109,40,217,0.18))', border: '1px solid rgba(124,58,237,0.3)' }}>
                  <span className="gradient-text">{s.num}</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-3">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="sm:hidden mt-4 ml-0 w-px h-6 bg-gradient-to-b from-purple-500/30 to-transparent" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Casos de Crescimento ────────────────────────────────────────────── */}
      <section id="casos" className="py-16 sm:py-24 md:py-28" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <Badge>Resultados reais</Badge>
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-bold">
              Histórias de <span className="gradient-text">transformação</span>
            </h2>
            <p className="mt-3 text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
              Dentistas que começaram sem espaço próprio e hoje constroem carreiras sólidas com demanda previsível.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {growthCases.map((c) => (
              <div key={c.name} className="glass-card relative rounded-2xl overflow-hidden">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }} />

                {/* Header */}
                <div className="flex items-center gap-4 px-5 sm:px-7 pt-6 pb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 text-white" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}99)` }}>
                    {c.initials}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.specialty} · {c.city}</p>
                  </div>
                </div>

                {/* Before / After */}
                <div className="px-5 sm:px-7 py-5 space-y-4">
                  {/* Antes */}
                  <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{c.before.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{c.before.label}</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{c.before.text}</p>
                  </div>

                  {/* Seta */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c.color}50)` }} />
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${c.color}20`, border: `1px solid ${c.color}40` }}>
                      <svg className="w-4 h-4" style={{ color: c.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" transform="rotate(-90 12 12)" />
                      </svg>
                    </div>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${c.color}50, transparent)` }} />
                  </div>

                  {/* Depois */}
                  <div className="rounded-xl p-4" style={{ background: `${c.color}10`, border: `1px solid ${c.color}30` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{c.after.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: c.color }}>{c.after.label}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{c.after.text}</p>
                  </div>
                </div>

                {/* Footer result tag */}
                <div className="px-5 sm:px-7 pb-6">
                  <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: `${c.color}10`, border: `1px solid ${c.color}20` }}>
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: c.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <p className="text-xs font-semibold" style={{ color: c.color }}>{c.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ─────────────────────────────────────────────────────── */}
      <section id="depoimentos" className="py-16 sm:py-24 md:py-28" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <Badge>Prova social</Badge>
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-bold">O que nossos clientes dizem</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card card-hover relative rounded-2xl p-5 sm:p-7 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), rgba(109,40,217,0.4), transparent)' }} />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / Contato ────────────────────────────────────────────────────── */}
      <section id="contato" className="py-16 sm:py-24 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.07), rgba(109,40,217,0.07))' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ width: 800, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.14), rgba(109,40,217,0.08), transparent)', filter: 'blur(40px)' }} />

        <div className="relative max-w-xl mx-auto px-5 sm:px-6 text-center">
          <Badge>Diagnóstico gratuito</Badge>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4">
            Pronto para <span className="gradient-text">crescer?</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-8 sm:mb-10">
            Preencha o formulário e nossa equipe entrará em contato em até 12 horas pelo WhatsApp.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input required type="text" placeholder="Seu nome"
                className="lp-input px-4 py-3.5 rounded-xl text-sm text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <input required type="tel" placeholder="WhatsApp"
                className="lp-input px-4 py-3.5 rounded-xl text-sm text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
            <input required type="text" placeholder="Nome da clínica"
              className="lp-input px-4 py-3.5 rounded-xl text-sm text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <select
              className="lp-input px-4 py-3.5 rounded-xl text-sm transition-all appearance-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
            >
              <option value="">Faturamento mensal</option>
              <option value="ate10k"   style={{ background: '#1a1a1a', color: 'white' }}>Até R$ 10.000</option>
              <option value="10k30k"   style={{ background: '#1a1a1a', color: 'white' }}>R$ 10.000 – R$ 30.000</option>
              <option value="30k80k"   style={{ background: '#1a1a1a', color: 'white' }}>R$ 30.000 – R$ 80.000</option>
              <option value="acima80k" style={{ background: '#1a1a1a', color: 'white' }}>Acima de R$ 80.000</option>
            </select>
            <button type="submit" className="py-4 rounded-xl font-semibold text-sm sm:text-base glow-btn flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Quero meu diagnóstico gratuito
            </button>
          </form>

          <p className="mt-4 sm:mt-5 text-xs text-gray-600">
            Prefere ir direto?{' '}
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors underline underline-offset-2">
              Falar agora no WhatsApp
            </a>
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="py-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-5">
          <span className="text-xl font-bold gradient-text tracking-tight">GRUPO F5</span>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Grupo F5. Todos os direitos reservados.</p>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacidade" className="hover:text-gray-300 transition-colors">Privacidade</Link>
            <Link href="/termos"      className="hover:text-gray-300 transition-colors">Termos</Link>
            <Link href="/login"       className="hover:text-gray-300 transition-colors">Acesso interno</Link>
          </nav>
        </div>
      </footer>

    </div>
  )
}
