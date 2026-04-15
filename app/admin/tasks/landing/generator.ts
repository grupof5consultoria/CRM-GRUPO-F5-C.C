// ─── Landing Page Code Generator ──────────────────────────────────────────────
// Generates a complete page.tsx based on the Dra. Letícia Junqueira template

interface Testimonial {
  name: string;
  text: string;
  time: string;
  rating: number;
}

interface BeforeAfterItem {
  label: string;
  beforeUrl: string;
  afterUrl: string;
}

interface GeneratorData {
  slug: string;
  doctorName: string;
  clinicName: string;
  city: string;
  whatsapp: string;
  specialties: string[];
  yearsExperience: number;
  patientsCount: string;
  proceduresCount: string;
  googleRating: string;
  address: string;
  colorPrimary: string;
  photoDentistUrl?: string;
  photoClinic1Url?: string;
  photoClinic2Url?: string;
  photoClinic3Url?: string;
  photoClinic4Url?: string;
  testimonials: Testimonial[];
  beforeAfterPhotos?: BeforeAfterItem[];
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function lighten(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  return `#${Math.min(255, r + amt).toString(16).padStart(2, "0")}${Math.min(255, g + amt).toString(16).padStart(2, "0")}${Math.min(255, b + amt).toString(16).padStart(2, "0")}`;
}

function darken(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  return `#${Math.max(0, r - amt).toString(16).padStart(2, "0")}${Math.max(0, g - amt).toString(16).padStart(2, "0")}${Math.max(0, b - amt).toString(16).padStart(2, "0")}`;
}

export function generateLandingPageCode(data: GeneratorData): string {
  const {
    slug,
    doctorName,
    clinicName,
    city,
    whatsapp,
    specialties,
    yearsExperience,
    patientsCount,
    proceduresCount,
    googleRating,
    address,
    colorPrimary,
    photoDentistUrl,
    photoClinic1Url,
    photoClinic2Url,
    photoClinic3Url,
    photoClinic4Url,
    testimonials,
    beforeAfterPhotos,
  } = data;

  const primaryLight = lighten(colorPrimary, 40);
  const primaryDark  = darken(colorPrimary, 40);
  const whatsappLink = `https://wa.me/55${whatsapp}?text=${encodeURIComponent("Olá! Gostaria de agendar uma consulta.")}`;
  const firstName    = doctorName.replace(/^(Dra?\.\s*)/i, "").split(" ")[0];

  const clinicPhotos = [photoClinic1Url, photoClinic2Url, photoClinic3Url, photoClinic4Url]
    .filter(Boolean)
    .map(url => `"${url}"`)
    .join(", ");

  const testimonialsCode = testimonials
    .filter(t => t.name && t.text)
    .map(t => `  { name: "${t.name}", text: "${t.text.replace(/"/g, '\\"')}", time: "${t.time}", rating: ${t.rating} }`)
    .join(",\n");

  const specialtiesCode = specialties
    .map(s => `  { title: "${s}", desc: "Tratamento especializado e moderno.", emoji: "🦷" }`)
    .join(",\n");

  const baItems = (beforeAfterPhotos ?? []).filter(b => b.beforeUrl || b.afterUrl);
  const baCode  = baItems
    .map(b => `  { label: "${b.label || "Resultado"}", beforeUrl: "${b.beforeUrl}", afterUrl: "${b.afterUrl}" }`)
    .join(",\n");

  return `'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// ─── Dados ────────────────────────────────────────────────────────────────────

const DOCTOR_NAME    = "${doctorName}";
const CLINIC_NAME    = "${clinicName}";
const CITY           = "${city}";
const WHATSAPP       = "${whatsapp}";
const WHATSAPP_LINK  = "${whatsappLink}";
const PRIMARY        = "${colorPrimary}";
const PRIMARY_LIGHT  = "${primaryLight}";
const PRIMARY_DARK   = "${primaryDark}";
const YEARS          = ${yearsExperience};
const PATIENTS       = "${patientsCount || `${yearsExperience * 100}+`}";
const PROCEDURES     = "${proceduresCount || `${yearsExperience * 150}+`}";
const GOOGLE_RATING  = "${googleRating}";
const ADDRESS        = "${address}";
const PHOTO_DENTIST  = "${photoDentistUrl || ""}";
const CLINIC_PHOTOS  = [${clinicPhotos}];

const SERVICES = [
${specialtiesCode}
];

const TESTIMONIALS = [
${testimonialsCode}
];

const BEFORE_AFTER = [
${baCode}
];

// ─── Counter ──────────────────────────────────────────────────────────────────

function Counter({ to, suffix = "", duration = 1800 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref  = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val.toLocaleString("pt-BR")}{suffix}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (TESTIMONIALS.length < 2) return;
    timerRef.current = setInterval(() => setSlideIndex(i => (i + 1) % TESTIMONIALS.length), 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function pauseSlider() { if (timerRef.current) clearInterval(timerRef.current); }
  function resumeSlider() {
    timerRef.current = setInterval(() => setSlideIndex(i => (i + 1) % TESTIMONIALS.length), 4500);
  }

  const navLinks = ["Serviços", "Clínica", "Sobre", "Avaliações", "Contato"];

  return (
    <div style={{ fontFamily: "var(--font-dm-sans, sans-serif)", background: "#FAF8F4", color: "#1C1917" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? "rgba(250,248,244,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "none",
        transition: "all 0.3s ease",
        padding: "0 1.5rem",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: PRIMARY_DARK, margin: 0 }}>{DOCTOR_NAME}</p>
            <p style={{ fontSize: 11, color: "#78716C", margin: 0 }}>Odontologia · {CITY}</p>
          </div>
          <div className="hidden md:flex" style={{ gap: 28, alignItems: "center" }}>
            {navLinks.map(l => (
              <a key={l} href={\`#\${l.toLowerCase().replace("ç","c").replace("õ","o")}\`}
                style={{ fontSize: 14, color: "#78716C", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = PRIMARY)}
                onMouseLeave={e => (e.currentTarget.style.color = "#78716C")}>
                {l}
              </a>
            ))}
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
              style={{ padding: "10px 20px", borderRadius: 12, background: \`linear-gradient(135deg, \${PRIMARY}, \${PRIMARY_DARK})\`, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Agendar
            </a>
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            <div style={{ width: 22, height: 2, background: menuOpen ? "transparent" : "#1C1917", position: "relative", transition: "all 0.3s" }}>
              <span style={{ position: "absolute", top: menuOpen ? 0 : -7, left: 0, width: 22, height: 2, background: "#1C1917", transform: menuOpen ? "rotate(45deg)" : "none", transition: "all 0.3s" }} />
              <span style={{ position: "absolute", top: menuOpen ? 0 : 7, left: 0, width: 22, height: 2, background: "#1C1917", transform: menuOpen ? "rotate(-45deg)" : "none", transition: "all 0.3s" }} />
            </div>
          </button>
        </div>
        {menuOpen && (
          <div style={{ background: "rgba(250,248,244,0.98)", backdropFilter: "blur(12px)", padding: "1rem 1.5rem 1.5rem", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            {navLinks.map(l => (
              <a key={l} href={\`#\${l.toLowerCase().replace("ç","c").replace("õ","o")}\`}
                onClick={() => setMenuOpen(false)}
                style={{ display: "block", padding: "12px 0", fontSize: 15, color: "#1C1917", textDecoration: "none", fontWeight: 500, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                {l}
              </a>
            ))}
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
              style={{ display: "block", marginTop: 16, padding: "14px", textAlign: "center", borderRadius: 12, background: \`linear-gradient(135deg, \${PRIMARY}, \${PRIMARY_DARK})\`, color: "#fff", fontWeight: 700, textDecoration: "none" }}>
              Agendar Consulta
            </a>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight: "100vh", background: \`linear-gradient(160deg, #FAF8F4 0%, \${PRIMARY}15 50%, \${PRIMARY}25 100%)\`, paddingTop: 72, display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <span style={{ display: "inline-block", padding: "6px 16px", borderRadius: 100, background: \`\${PRIMARY}18\`, border: \`1px solid \${PRIMARY}40\`, color: PRIMARY_DARK, fontSize: 12, fontWeight: 600, marginBottom: 24 }}>
              {CLINIC_NAME} · {DOCTOR_NAME}
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
              Seu sorriso merece{" "}
              <span style={{ color: PRIMARY }}>o melhor cuidado</span>
            </h1>
            <p style={{ fontSize: 17, color: "#78716C", lineHeight: 1.7, marginBottom: 32 }}>
              {YEARS} anos transformando sorrisos em {CITY}. Atendimento humanizado com tecnologia de ponta.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
                style={{ padding: "16px 32px", borderRadius: 14, background: \`linear-gradient(135deg, \${PRIMARY}, \${PRIMARY_DARK})\`, color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: \`0 8px 24px \${PRIMARY}40\` }}>
                Agendar Avaliação Gratuita
              </a>
              <a href="#servicos"
                style={{ padding: "16px 24px", borderRadius: 14, border: \`1.5px solid \${PRIMARY}50\`, color: PRIMARY_DARK, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                Ver Serviços →
              </a>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {[
                { label: "Pacientes", value: PATIENTS },
                { label: "Procedimentos", value: PROCEDURES },
                { label: "Google", value: \`\${GOOGLE_RATING} ⭐\` },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: PRIMARY_DARK, margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: "#A8A29E", margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            {PHOTO_DENTIST && (
              <div style={{ position: "relative", aspectRatio: "3/4", borderRadius: 24, overflow: "hidden", boxShadow: \`0 32px 80px \${PRIMARY}30\` }}>
                <Image src={PHOTO_DENTIST} alt={DOCTOR_NAME} fill style={{ objectFit: "cover" }} priority />
                <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "10px 20px", whiteSpace: "nowrap", fontWeight: 700, fontSize: 13, color: PRIMARY_DARK, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
                  +{YEARS} anos de experiência
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: \`linear-gradient(135deg, \${PRIMARY}, \${PRIMARY_DARK})\`, padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
          {[
            { label: "Pacientes", num: parseInt(PATIENTS.replace(/\D/g, "")), suffix: "+" },
            { label: "Procedimentos", num: parseInt(PROCEDURES.replace(/\D/g, "")), suffix: "+" },
            { label: "Anos", num: YEARS, suffix: "" },
            { label: "Google", num: parseFloat(GOOGLE_RATING) * 10, suffix: "", display: GOOGLE_RATING + " ⭐" },
          ].map(s => (
            <div key={s.label}>
              <p style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>
                {s.display ? s.display : <Counter to={s.num} suffix={s.suffix} />}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Serviços ── */}
      <section id="servicos" style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, marginBottom: 12 }}>Nossos Serviços</h2>
            <p style={{ color: "#78716C", fontSize: 16 }}>Tecnologia e cuidado para transformar o seu sorriso</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {SERVICES.map(s => (
              <div key={s.title} style={{ background: "#fff", borderRadius: 20, padding: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", borderTop: \`3px solid \${PRIMARY}\`, transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.10)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)"; }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.emoji}</div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: "#78716C", fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
                  style={{ display: "inline-block", marginTop: 16, fontSize: 13, fontWeight: 600, color: PRIMARY, textDecoration: "none" }}>
                  Agendar consulta →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      ${CLINIC_PHOTOS.length > 0 ? `
      {/* ── Clínica ── */}
      <section id="clinica" style={{ padding: "4rem 1.5rem", background: "#F5F0E8" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, marginBottom: 40 }}>Nossa Clínica</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {CLINIC_PHOTOS.map((src, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "1", position: "relative" }}>
                <Image src={src} alt={\`Clínica \${i + 1}\`} fill style={{ objectFit: "cover" }} />
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32, color: "#78716C", fontSize: 14 }}>📍 {ADDRESS}</div>
        </div>
      </section>` : ``}

      {/* ── Sobre ── */}
      <section id="sobre" style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          {PHOTO_DENTIST && (
            <div style={{ borderRadius: 24, overflow: "hidden", aspectRatio: "3/4", position: "relative", boxShadow: \`0 32px 80px \${PRIMARY}20\` }}>
              <Image src={PHOTO_DENTIST} alt={DOCTOR_NAME} fill style={{ objectFit: "cover" }} />
            </div>
          )}
          <div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, marginBottom: 16 }}>
              Conheça <span style={{ color: PRIMARY }}>{DOCTOR_NAME}</span>
            </h2>
            <p style={{ color: "#78716C", lineHeight: 1.8, fontSize: 16, marginBottom: 24 }}>
              Com {YEARS} anos dedicados à odontologia em {CITY}, {firstName} combina expertise clínica com atendimento verdadeiramente humanizado. Cada sorriso é único e merece um tratamento personalizado.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
              {SERVICES.map(s => (
                <span key={s.title} style={{ padding: "6px 14px", borderRadius: 100, background: \`\${PRIMARY}12\`, border: \`1px solid \${PRIMARY}30\`, color: PRIMARY_DARK, fontSize: 12, fontWeight: 600 }}>
                  {s.title}
                </span>
              ))}
            </div>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
              style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: \`linear-gradient(135deg, \${PRIMARY}, \${PRIMARY_DARK})\`, color: "#fff", fontWeight: 700, textDecoration: "none" }}>
              Agendar Consulta
            </a>
          </div>
        </div>
      </section>

      ${baCode.length > 0 ? `
      {/* ── Antes e Depois ── */}
      <section id="resultados" style={{ padding: "6rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: PRIMARY, textTransform: "uppercase", marginBottom: 12 }}>Resultados Reais</p>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, color: "#1C1917", marginBottom: 16 }}>Transformações que falam por si</h2>
          <p style={{ textAlign: "center", color: "#78716C", fontSize: 16, maxWidth: 520, margin: "0 auto 48px" }}>Cada sorriso transformado é uma história de confiança e dedicação.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 28 }}>
            {BEFORE_AFTER.map((item, i) => (
              <div key={i} style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.10)", background: "#fafafa" }}>
                <div style={{ position: "relative", height: 200 }}>
                  <div style={{ position: "absolute", inset: 0 }}>
                    {item.beforeUrl ? (
                      <Image src={item.beforeUrl} alt={"Antes — " + item.label} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 13 }}>Foto Antes</div>
                    )}
                  </div>
                  <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", padding: "4px 10px", borderRadius: 6 }}>ANTES</span>
                </div>
                <div style={{ position: "relative", height: 200 }}>
                  <div style={{ position: "absolute", inset: 0 }}>
                    {item.afterUrl ? (
                      <Image src={item.afterUrl} alt={"Depois — " + item.label} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 13 }}>Foto Depois</div>
                    )}
                  </div>
                  <span style={{ position: "absolute", top: 10, left: 10, background: PRIMARY, color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", padding: "4px 10px", borderRadius: 6 }}>DEPOIS</span>
                </div>
                {item.label && (
                  <div style={{ padding: "14px 16px", textAlign: "center" }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#1C1917", margin: 0 }}>{item.label}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>` : ``}

      ${testimonialsCode.length > 0 ? `
      {/* ── Avaliações ── */}
      <section id="avaliacoes" style={{ padding: "6rem 1.5rem", background: "#F5F0E8" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, marginBottom: 48 }}>O que dizem nossos pacientes</h2>
          {TESTIMONIALS.length > 0 && (
            <div style={{ position: "relative" }} onMouseEnter={pauseSlider} onMouseLeave={resumeSlider}>
              <div style={{ overflow: "hidden", borderRadius: 20 }}>
                <div style={{ display: "flex", transition: "transform 0.5s ease", transform: \`translateX(-\${slideIndex * 100}%)\` }}>
                  {TESTIMONIALS.map((t, i) => (
                    <div key={i} style={{ minWidth: "100%", background: "#fff", borderRadius: 20, padding: "2.5rem", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
                      <p style={{ fontSize: 48, color: PRIMARY, margin: "0 0 16px", lineHeight: 1 }}>"</p>
                      <p style={{ fontSize: 17, lineHeight: 1.8, color: "#1C1917", marginBottom: 24 }}>{t.text}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: \`linear-gradient(135deg, \${PRIMARY}, \${PRIMARY_DARK})\`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, margin: 0, fontSize: 14 }}>{t.name}</p>
                          <p style={{ color: "#A8A29E", margin: 0, fontSize: 12 }}>{t.time} · Google ★★★★★</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setSlideIndex(i)} style={{ width: i === slideIndex ? 24 : 8, height: 8, borderRadius: 4, background: i === slideIndex ? PRIMARY : "#D6D3D1", border: "none", cursor: "pointer", transition: "all 0.3s" }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>` : ``}

      {/* ── CTA ── */}
      <section id="contato" style={{ padding: "6rem 1.5rem", background: \`linear-gradient(135deg, \${PRIMARY}, \${PRIMARY_DARK}, \${PRIMARY_LIGHT})\`, textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, color: "#fff", marginBottom: 16 }}>
            Pronto para transformar seu sorriso?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 17, marginBottom: 36 }}>
            Agende sua avaliação gratuita e dê o primeiro passo.
          </p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
            style={{ display: "inline-block", padding: "18px 40px", borderRadius: 16, background: "#fff", color: PRIMARY_DARK, fontWeight: 800, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            Agendar Agora via WhatsApp
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#1C1917", padding: "2rem 1.5rem", textAlign: "center" }}>
        <p style={{ color: PRIMARY_LIGHT, fontWeight: 700, marginBottom: 4 }}>{DOCTOR_NAME}</p>
        <p style={{ color: "#78716C", fontSize: 12 }}>© {new Date().getFullYear()} · {CITY} · Todos os direitos reservados</p>
      </footer>

      {/* ── WhatsApp flutuante (mobile) ── */}
      <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="md:hidden"
        style={{ position: "fixed", bottom: 20, right: 20, width: 56, height: 56, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(37,211,102,0.4)", zIndex: 999 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </div>
  );
}
`;
}
