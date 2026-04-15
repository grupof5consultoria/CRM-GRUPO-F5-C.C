"use client";

import { useState, useActionState, useRef } from "react";
import { saveGeneratorAction } from "./actions";
import { generateLandingPageCode } from "./generator";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Testimonial {
  name: string;
  text: string;
  time: string;
  rating: number;
}

interface Project {
  id: string;
  clientId: string;
  slug?: string | null;
  doctorName?: string | null;
  clinicName?: string | null;
  city?: string | null;
  whatsapp?: string | null;
  specialties?: string[];
  yearsExperience?: number | null;
  patientsCount?: string | null;
  proceduresCount?: string | null;
  googleRating?: string | null;
  address?: string | null;
  colorPrimary?: string | null;
  photoDentistUrl?: string | null;
  photoClinic1Url?: string | null;
  photoClinic2Url?: string | null;
  photoClinic3Url?: string | null;
  photoClinic4Url?: string | null;
  ogImageUrl?: string | null;
  testimonials?: Testimonial[] | null;
  generatorStatus?: string | null;
  generatedAt?: Date | string | null;
}

// ─── Image Upload Field ────────────────────────────────────────────────────────

function ImageUpload({
  label,
  fieldName,
  currentUrl,
  slug,
  onUploaded,
}: {
  label: string;
  fieldName: string;
  currentUrl?: string | null;
  slug: string;
  onUploaded: (field: string, url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;
    setError(null);
    setUploading(true);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const form = new FormData();
    form.append("file", file);
    form.append("slug", slug || "landing");
    form.append("field", fieldName);

    try {
      const res = await fetch("/api/admin/landing-upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      onUploaded(fieldName, data.url);
    } catch {
      setError("Falha ao enviar imagem");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-500 block">{label}</label>
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer group ${
          preview ? "border-violet-500/40" : "border-[#333] hover:border-violet-500/40"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={label} className="w-full h-28 object-cover rounded-xl" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">Trocar imagem</span>
            </div>
          </div>
        ) : (
          <div className="h-28 flex flex-col items-center justify-center gap-2 text-gray-600">
            {uploading ? (
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">Clique ou arraste</span>
                <span className="text-[10px] text-gray-700">JPG, PNG, WebP · máx 5MB</span>
              </>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Specialty Tag Input ───────────────────────────────────────────────────────

function SpecialtiesInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput("");
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-500 block">Especialidades</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map(s => (
          <span key={s} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300">
            {s}
            <button type="button" onClick={() => onChange(value.filter(x => x !== s))} className="text-violet-500 hover:text-red-400 ml-0.5">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Ex: Implantes, Ortodontia, Clareamento..."
          className="flex-1 bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <button type="button" onClick={add} className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors">
          + Add
        </button>
      </div>
    </div>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────

function TestimonialCard({
  index,
  value,
  onChange,
}: {
  index: number;
  value: Testimonial;
  onChange: (v: Testimonial) => void;
}) {
  const INP = "w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500";
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-500">Depoimento {index + 1}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-gray-600 block mb-1">Nome do paciente</label>
          <input value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} placeholder="Ex: Maria S." className={INP} />
        </div>
        <div>
          <label className="text-[10px] text-gray-600 block mb-1">Tempo (ex: há 2 semanas)</label>
          <input value={value.time} onChange={e => onChange({ ...value, time: e.target.value })} placeholder="há 1 mês" className={INP} />
        </div>
      </div>
      <div>
        <label className="text-[10px] text-gray-600 block mb-1">Texto do depoimento</label>
        <textarea value={value.text} onChange={e => onChange({ ...value, text: e.target.value })} rows={2} placeholder="Experiência incrível..." className={`${INP} resize-none`} />
      </div>
    </div>
  );
}

// ─── Generator ────────────────────────────────────────────────────────────────

const INP = "w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500";

export function LandingGenerator({ project }: { project: Project }) {
  const [state, action, isPending] = useActionState(saveGeneratorAction, {});

  // Form state
  const [slug,            setSlug]            = useState(project.slug ?? "");
  const [doctorName,      setDoctorName]      = useState(project.doctorName ?? "");
  const [clinicName,      setClinicName]      = useState(project.clinicName ?? "");
  const [city,            setCity]            = useState(project.city ?? "");
  const [whatsapp,        setWhatsapp]        = useState(project.whatsapp ?? "");
  const [specialties,     setSpecialties]     = useState<string[]>(project.specialties ?? []);
  const [yearsExp,        setYearsExp]        = useState(project.yearsExperience?.toString() ?? "");
  const [patientsCount,   setPatientsCount]   = useState(project.patientsCount ?? "");
  const [proceduresCount, setProceduresCount] = useState(project.proceduresCount ?? "");
  const [googleRating,    setGoogleRating]    = useState(project.googleRating ?? "5.0");
  const [address,         setAddress]         = useState(project.address ?? "");

  // Images
  const [photoDentist,  setPhotoDentist]  = useState(project.photoDentistUrl ?? "");
  const [photoClinic1,  setPhotoClinic1]  = useState(project.photoClinic1Url ?? "");
  const [photoClinic2,  setPhotoClinic2]  = useState(project.photoClinic2Url ?? "");
  const [photoClinic3,  setPhotoClinic3]  = useState(project.photoClinic3Url ?? "");
  const [photoClinic4,  setPhotoClinic4]  = useState(project.photoClinic4Url ?? "");
  const [ogImage,       setOgImage]       = useState(project.ogImageUrl ?? "");

  // Testimonials
  const defaultTestimonials: Testimonial[] = (project.testimonials as Testimonial[] | null) ?? [
    { name: "", text: "", time: "", rating: 5 },
    { name: "", text: "", time: "", rating: 5 },
    { name: "", text: "", time: "", rating: 5 },
  ];
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);

  // Generated code
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleImageUploaded(field: string, url: string) {
    if (field === "photoDentistUrl") setPhotoDentist(url);
    if (field === "photoClinic1Url") setPhotoClinic1(url);
    if (field === "photoClinic2Url") setPhotoClinic2(url);
    if (field === "photoClinic3Url") setPhotoClinic3(url);
    if (field === "photoClinic4Url") setPhotoClinic4(url);
    if (field === "ogImageUrl")      setOgImage(url);
  }

  function handleGenerate() {
    const data = {
      slug,
      doctorName,
      clinicName,
      city,
      whatsapp,
      specialties,
      yearsExperience: yearsExp ? Number(yearsExp) : 5,
      patientsCount,
      proceduresCount,
      googleRating,
      address,
      colorPrimary: project.colorPrimary ?? "#B8943F",
      photoDentistUrl: photoDentist,
      photoClinic1Url: photoClinic1,
      photoClinic2Url: photoClinic2,
      photoClinic3Url: photoClinic3,
      photoClinic4Url: photoClinic4,
      testimonials: testimonials.filter(t => t.name && t.text),
    };
    const code = generateLandingPageCode(data);
    setGeneratedCode(code);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function handleCopy() {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const slugFromName = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="projectId"       value={project.id} />
      <input type="hidden" name="clientId"        value={project.clientId} />
      <input type="hidden" name="specialties"     value={specialties.join(",")} />
      <input type="hidden" name="testimonials"    value={JSON.stringify(testimonials)} />
      <input type="hidden" name="photoDentistUrl" value={photoDentist} />
      <input type="hidden" name="photoClinic1Url" value={photoClinic1} />
      <input type="hidden" name="photoClinic2Url" value={photoClinic2} />
      <input type="hidden" name="photoClinic3Url" value={photoClinic3} />
      <input type="hidden" name="photoClinic4Url" value={photoClinic4} />
      <input type="hidden" name="ogImageUrl"      value={ogImage} />

      {state.error   && <p className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">{state.error}</p>}
      {state.success && <p className="text-emerald-400 text-xs bg-emerald-500/10 px-3 py-2 rounded-lg">Dados salvos!</p>}

      {/* ── Seção 1: Informações Básicas ──────────────────────────────────── */}
      <Section title="Informações Básicas" icon="👤">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nome da Dentista</label>
            <input
              name="doctorName" value={doctorName}
              onChange={e => { setDoctorName(e.target.value); if (!slug) setSlug(slugFromName(e.target.value)); }}
              placeholder="Dra. Ana Paula Souza" className={INP}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nome da Clínica/Instituto</label>
            <input name="clinicName" value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder="Instituto Sorriso Premium" className={INP} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Cidade e Estado</label>
            <input name="city" value={city} onChange={e => setCity(e.target.value)} placeholder="Cuiabá - MT" className={INP} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">WhatsApp (com DDD)</label>
            <input name="whatsapp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="65999991234" className={INP} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Slug da URL</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">/</span>
              <input name="slug" value={slug} onChange={e => setSlug(e.target.value)} placeholder="dra-ana-paula" className={INP} />
            </div>
            <p className="text-[10px] text-gray-700 mt-1">A landing page ficará em /{slug || "slug"}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Endereço completo</label>
            <input name="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua das Flores, 123 - Centro" className={INP} />
          </div>
        </div>
        <SpecialtiesInput value={specialties} onChange={setSpecialties} />
      </Section>

      {/* ── Seção 2: Números e Prova Social ───────────────────────────────── */}
      <Section title="Números e Prova Social" icon="📊">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Anos de experiência</label>
            <input name="yearsExperience" type="number" value={yearsExp} onChange={e => setYearsExp(e.target.value)} placeholder="10" className={INP} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Pacientes atendidos</label>
            <input name="patientsCount" value={patientsCount} onChange={e => setPatientsCount(e.target.value)} placeholder="1.000+" className={INP} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Procedimentos realizados</label>
            <input name="proceduresCount" value={proceduresCount} onChange={e => setProceduresCount(e.target.value)} placeholder="1.500+" className={INP} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Avaliação Google</label>
            <input name="googleRating" value={googleRating} onChange={e => setGoogleRating(e.target.value)} placeholder="5.0" className={INP} />
          </div>
        </div>
      </Section>

      {/* ── Seção 3: Depoimentos ──────────────────────────────────────────── */}
      <Section title="Depoimentos de Pacientes" icon="💬">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={i}
              index={i}
              value={t}
              onChange={v => setTestimonials(prev => prev.map((x, j) => j === i ? v : x))}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setTestimonials(prev => [...prev, { name: "", text: "", time: "", rating: 5 }])}
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors mt-1"
        >
          + Adicionar depoimento
        </button>
      </Section>

      {/* ── Seção 4: Imagens ──────────────────────────────────────────────── */}
      <Section title="Imagens" icon="🖼️">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ImageUpload label="📸 Foto da Dentista" fieldName="photoDentistUrl" currentUrl={photoDentist} slug={slug} onUploaded={handleImageUploaded} />
          <ImageUpload label="🏥 Foto da Clínica 1" fieldName="photoClinic1Url" currentUrl={photoClinic1} slug={slug} onUploaded={handleImageUploaded} />
          <ImageUpload label="🏥 Foto da Clínica 2" fieldName="photoClinic2Url" currentUrl={photoClinic2} slug={slug} onUploaded={handleImageUploaded} />
          <ImageUpload label="🏥 Foto da Clínica 3" fieldName="photoClinic3Url" currentUrl={photoClinic3} slug={slug} onUploaded={handleImageUploaded} />
          <ImageUpload label="🏥 Foto da Clínica 4" fieldName="photoClinic4Url" currentUrl={photoClinic4} slug={slug} onUploaded={handleImageUploaded} />
          <ImageUpload label="🔗 Imagem OG (WhatsApp/Social)" fieldName="ogImageUrl" currentUrl={ogImage} slug={slug} onUploaded={handleImageUploaded} />
        </div>
        <p className="text-[10px] text-gray-700 mt-2">Imagens serão hospedadas no Vercel Blob e referenciadas na landing page automaticamente.</p>
      </Section>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-[#1a1a1a] border border-[#333] hover:border-violet-500/50 text-sm font-medium text-gray-300 rounded-xl transition-all disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "💾 Salvar dados"}
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!doctorName || !whatsapp || !slug}
          className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
        >
          ⚡ Gerar Landing Page
        </button>
        {!doctorName || !whatsapp || !slug ? (
          <p className="text-xs text-gray-600 self-center">Preencha nome, WhatsApp e slug para gerar</p>
        ) : null}
      </div>

      {/* ── Código Gerado ─────────────────────────────────────────────────── */}
      {generatedCode && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-white">Código Gerado — <code className="text-violet-400">app/{slug}/page.tsx</code></h3>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              {copied ? "✓ Copiado!" : "📋 Copiar código"}
            </button>
          </div>
          <div className="relative bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#1e1e1e] bg-[#111]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-xs text-gray-600 font-mono">app/{slug}/page.tsx</span>
            </div>
            <pre className="p-4 text-xs text-gray-300 font-mono overflow-auto max-h-[400px] leading-relaxed whitespace-pre-wrap">
              {generatedCode}
            </pre>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 space-y-1">
            <p className="text-xs font-semibold text-amber-400">Próximos passos</p>
            <p className="text-xs text-gray-500">1. Copie o código e salve em <code className="text-amber-300">app/{slug}/page.tsx</code></p>
            <p className="text-xs text-gray-500">2. Faça commit e push → o Vercel fará o deploy automaticamente</p>
            <p className="text-xs text-gray-500">3. A landing page estará em <code className="text-amber-300">/{slug}</code></p>
          </div>
        </div>
      )}
    </form>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#262626]">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  );
}
