'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

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

function StatItem({
  value, suffix, prefix = '', label,
}: {
  value: number; suffix: string; prefix?: string; label: string
}) {
  const { ref, inView } = useInView()
  const count = useCounter(value, 1800, inView)
  return (
    <div ref={ref} className="text-center">
      <p className="text-5xl md:text-6xl font-bold gradient-text tabular-nums">
        {prefix}{count}{suffix}
      </p>
      <p className="mt-2 text-xs uppercase tracking-widest text-gray-500">{label}</p>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-medium"
      style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        color: '#f87171',
      }}
    >
      {children}
    </span>
  )
}

// ── Data ────────────────────────────────────────────────────────────────────────

const methodology = [
  {
    num: '01',
    emoji: '🎯',
    title: 'Captação',
    desc: 'Identificamos seu público ideal e criamos campanhas que geram demanda qualificada e previsível.',
  },
  {
    num: '02',
    emoji: '💰',
    title: 'Receita',
    desc: 'Convertemos leads em agendamentos e agendamentos em pacientes pagantes com alto ticket.',
  },
  {
    num: '03',
    emoji: '🤝',
    title: 'Engajamento',
    desc: 'Construímos relacionamentos que fidelizam pacientes e geram indicações consistentes.',
  },
  {
    num: '04',
    emoji: '🚀',
    title: 'Monetização',
    desc: 'Maximizamos o valor de cada cliente, identificando oportunidades de upsell e recompra.',
  },
]

const services = [
  {
    emoji: '📈',
    title: 'Tráfego Pago',
    desc: 'Anúncios estratégicos no Meta Ads e Google Ads com segmentação precisa para atrair pacientes qualificados.',
    color: 'rgba(239,68,68,0.12)',
  },
  {
    emoji: '🎯',
    title: 'Gestão de Leads',
    desc: 'Capturamos, qualificamos e nutrimos cada lead até a conversão, maximizando seu retorno sobre investimento.',
    color: 'rgba(249,115,22,0.12)',
  },
  {
    emoji: '🏆',
    title: 'Treinamento Comercial',
    desc: 'Capacitamos sua equipe com scripts e técnicas comprovadas para converter consultas em vendas fechadas.',
    color: 'rgba(239,68,68,0.12)',
  },
  {
    emoji: '🧠',
    title: 'Consultoria Estratégica',
    desc: 'Diagnóstico completo do seu negócio e plano personalizado de crescimento com metas e prazos definidos.',
    color: 'rgba(249,115,22,0.12)',
  },
]

const steps = [
  {
    num: '01',
    title: 'Diagnóstico',
    desc: 'Analisamos sua operação atual, identificando gargalos e as principais oportunidades de crescimento.',
  },
  {
    num: '02',
    title: 'Análise Estratégica',
    desc: 'Mapeamos o mercado e desenhamos a estratégia mais eficiente para o seu perfil de negócio.',
  },
  {
    num: '03',
    title: 'Plano de Ação',
    desc: 'Entregamos um plano detalhado com ações, prazos, responsáveis e metas mensuráveis.',
  },
]

const testimonials = [
  {
    name: 'Dr. Carlos Mendes',
    role: 'Clínica Sorriso Perfeito • São Paulo',
    text: 'Em 3 meses triplicamos os agendamentos mensais. A equipe do Grupo F5 vai muito além do esperado, entregando resultados que agências anteriores nunca conseguiram.',
    stars: 5,
  },
  {
    name: 'Dra. Ana Lima',
    role: 'OdontoVida Clínica • Rio de Janeiro',
    text: 'O investimento em tráfego pago com eles é completamente diferente. Cada real investido retorna multiplicado. Dedicação e profissionalismo fora do comum.',
    stars: 5,
  },
  {
    name: 'Dr. Rafael Costa',
    role: 'Centro Odontológico Costa • BH',
    text: 'Depois do treinamento comercial minha taxa de fechamento aumentou mais de 60%. Hoje sei exatamente como converter uma consulta em venda.',
    stars: 5,
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
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
          {/* Logo */}
          <span className="text-xl font-bold gradient-text tracking-tight select-none">
            GRUPO F5
          </span>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              ['Metodologia', '#metodologia'],
              ['Serviços',    '#servicos'],
              ['Resultados',  '#resultados'],
              ['Depoimentos', '#depoimentos'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <a
            href="#contato"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold glow-btn"
          >
            Falar com especialista
            <span className="text-base">→</span>
          </a>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8"
            aria-label="Menu"
          >
            <span className={`block h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{
            maxHeight: menuOpen ? '320px' : '0',
            borderBottom: menuOpen ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}
        >
          <div className="px-6 py-4 flex flex-col gap-4" style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(24px)' }}>
            {[
              ['Metodologia', '#metodologia'],
              ['Serviços',    '#servicos'],
              ['Resultados',  '#resultados'],
              ['Depoimentos', '#depoimentos'],
            ].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors py-1">
                {label}
              </a>
            ))}
            <a
              href="#contato"
              onClick={() => setMenuOpen(false)}
              className="text-center py-3 rounded-xl font-semibold glow-btn"
            >
              Falar com especialista
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">

        {/* Background base */}
        <div className="absolute inset-0 bg-[#080808]" />

        {/* Animated orbs */}
        <div
          className="absolute animate-orb pointer-events-none"
          style={{
            top: '10%', left: '-8%',
            width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, rgba(239,68,68,0.25), transparent 65%)',
            filter: 'blur(48px)',
          }}
        />
        <div
          className="absolute animate-orb-2 pointer-events-none"
          style={{
            bottom: '5%', right: '-8%',
            width: 600, height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 60% 60%, rgba(249,115,22,0.2), transparent 65%)',
            filter: 'blur(56px)',
          }}
        />
        <div
          className="absolute animate-orb-3 pointer-events-none"
          style={{
            top: '40%', left: '35%',
            width: 400, height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239,68,68,0.06), transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #080808 100%)' }} />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center animate-fade-up">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 mb-8">
            <Badge>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              100+ clínicas odontológicas atendidas
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-6">
            Transformamos clínicas em{' '}
            <br className="hidden sm:block" />
            <span className="gradient-text-animated">máquinas de agendamento</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Estratégia, tecnologia e execução de alto nível para clínicas odontológicas que querem crescimento previsível e escalável.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contato" className="px-8 py-4 rounded-full text-base font-semibold glow-btn animate-pulse-glow">
              Quero consultoria gratuita
            </a>
            <a
              href="#resultados"
              className="px-8 py-4 rounded-full text-base font-semibold text-gray-300 hover:text-white transition-all duration-300 hover:border-white/20"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Ver resultados →
            </a>
          </div>

          {/* Floating stats pills */}
          <div className="mt-16 flex flex-wrap justify-center gap-3">
            {['R$20M+ em vendas geradas', '100+ empresas', 'Retorno em 12h'].map(pill => (
              <span
                key={pill}
                className="px-4 py-2 rounded-full text-xs text-gray-400"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[10px] uppercase tracking-widest">scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section id="resultados" className="py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, #0a0a0a, #0d0d0d)' }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          <StatItem value={100} suffix="+" label="Empresas atendidas" />
          <StatItem value={20}  suffix="M+" prefix="R$" label="Em vendas geradas" />
          <StatItem value={10}  suffix="M+" prefix="R$" label="Em demanda captada" />
          <StatItem value={2}   suffix="+" label="Anos de experiência" />
        </div>
      </section>

      {/* ── Metodologia ─────────────────────────────────────────────────────── */}
      <section id="metodologia" className="py-28 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(239,68,68,0.04), transparent 60%)' }} />

        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge>Nossa metodologia</Badge>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold">
              O Método <span className="gradient-text">F5</span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-lg mx-auto">
              Um sistema completo de 4 pilares que transforma seu negócio em uma operação previsível e escalável.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {methodology.map((m) => (
              <div key={m.num} className="glass-card card-hover top-line relative rounded-2xl p-6 overflow-hidden">
                <div className="text-3xl mb-4">{m.emoji}</div>
                <p className="text-xs font-mono text-gray-600 mb-1">{m.num}</p>
                <h3 className="text-lg font-bold mb-2">{m.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p>

                {/* Subtle inner glow on hover via CSS */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.05), rgba(249,115,22,0.05))', opacity: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Serviços ────────────────────────────────────────────────────────── */}
      <section id="servicos" className="py-28" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge>O que oferecemos</Badge>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold">Nossos Serviços</h2>
            <p className="mt-4 text-gray-400 max-w-lg mx-auto">
              Soluções completas e integradas para crescimento sustentável de clínicas odontológicas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {services.map((s) => (
              <div key={s.title} className="glass-card card-hover top-line relative rounded-2xl p-7">
                <div className="flex items-start gap-5">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: s.color }}
                  >
                    {s.emoji}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Processo ────────────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(249,115,22,0.05), transparent 60%)' }}
        />
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge>Como funciona</Badge>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold">
              Consultoria{' '}
              <span className="gradient-text">gratuita</span>{' '}
              em 3 passos
            </h2>
            <p className="mt-4 text-gray-400 max-w-lg mx-auto">
              Do primeiro contato ao plano de ação em mãos — sem compromisso.
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Connector */}
            <div
              className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.35), rgba(249,115,22,0.25), transparent)' }}
            />

            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center font-bold text-lg relative z-10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.15))',
                    border: '1px solid rgba(239,68,68,0.25)',
                  }}
                >
                  <span className="gradient-text">{s.num}</span>
                </div>
                <h3 className="text-lg font-bold mb-3">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ─────────────────────────────────────────────────────── */}
      <section id="depoimentos" className="py-28" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge>Prova social</Badge>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold">O que nossos clientes dizem</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="glass-card card-hover relative rounded-2xl p-7 overflow-hidden"
              >
                {/* Top shimmer line */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), rgba(249,115,22,0.3), transparent)' }}
                />

                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>

                <p className="text-sm text-gray-300 leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
                  >
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
      <section id="contato" className="py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(249,115,22,0.06))' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: 800, height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(239,68,68,0.12), rgba(249,115,22,0.08), transparent)',
            filter: 'blur(40px)',
          }}
        />

        <div className="relative max-w-xl mx-auto px-6 text-center">
          <Badge>Diagnóstico gratuito</Badge>
          <h2 className="mt-5 text-3xl md:text-5xl font-bold mb-4">
            Pronto para{' '}
            <span className="gradient-text">crescer?</span>
          </h2>
          <p className="text-gray-400 mb-10">
            Preencha o formulário e nossa equipe entrará em contato em até 12 horas.
          </p>

          {submitted ? (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-2">Recebemos seu contato!</h3>
              <p className="text-gray-400 text-sm">Nossa equipe vai entrar em contato em até 12 horas.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  placeholder="Seu nome"
                  className="lp-input px-4 py-3.5 rounded-xl text-sm text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <input
                  required
                  type="text"
                  placeholder="WhatsApp"
                  className="lp-input px-4 py-3.5 rounded-xl text-sm text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
              <input
                required
                type="text"
                placeholder="Nome da clínica"
                className="lp-input px-4 py-3.5 rounded-xl text-sm text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <select
                className="lp-input px-4 py-3.5 rounded-xl text-sm transition-all appearance-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
              >
                <option value="">Faturamento mensal</option>
                <option value="ate10k" style={{ background: '#1a1a1a', color: 'white' }}>Até R$ 10.000</option>
                <option value="10k30k" style={{ background: '#1a1a1a', color: 'white' }}>R$ 10.000 – R$ 30.000</option>
                <option value="30k80k" style={{ background: '#1a1a1a', color: 'white' }}>R$ 30.000 – R$ 80.000</option>
                <option value="acima80k" style={{ background: '#1a1a1a', color: 'white' }}>Acima de R$ 80.000</option>
              </select>
              <button type="submit" className="py-4 rounded-xl font-semibold text-base glow-btn">
                Quero meu diagnóstico gratuito →
              </button>
            </form>
          )}

          <p className="mt-5 text-xs text-gray-600">
            Prefere WhatsApp?{' '}
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors underline underline-offset-2"
            >
              Clique aqui para falar agora
            </a>
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer
        className="py-10"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-5">
          <span className="text-xl font-bold gradient-text tracking-tight">GRUPO F5</span>

          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Grupo F5. Todos os direitos reservados.
          </p>

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
