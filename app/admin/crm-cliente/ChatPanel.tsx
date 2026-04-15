"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  fromMe: boolean;
  text: string;
  timestamp: string;
  pushName: string | null;
}

export interface ChatLead {
  id: string;
  name: string;
  phone: string | null;
  photoUrl: string | null;
  city: string | null;
  state: string | null;
  origin: string;
  client: { name: string };
}

interface ChatPanelProps {
  lead: ChatLead;
  instanceName: string;
  onClose: () => void;
}

// ─── Quick replies ────────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  { label: "Olá 👋",        text: "Olá! Recebemos sua mensagem 😊 Como posso te ajudar?" },
  { label: "Horário 📅",    text: "Qual horário seria melhor para você? Temos disponibilidade essa semana!" },
  { label: "Parcelas 💳",   text: "Temos opções de parcelamento em até 12x! Quer saber mais detalhes?" },
  { label: "Aguarda ⏳",    text: "Vou verificar com a Dra. e já te retorno em instantes!" },
  { label: "Serviço 🦷",    text: "Pode me informar qual tratamento tem interesse? Assim posso te ajudar melhor 😊" },
  { label: "Agendamento 📍", text: "Posso te ajudar a marcar uma avaliação gratuita! Qual o melhor dia para você?" },
];

// ─── Labels ───────────────────────────────────────────────────────────────────

const ORIGIN_LABELS: Record<string, string> = {
  meta_ads: "Meta Ads", google_ads: "Google Ads", instagram: "Instagram",
  google_organic: "Google Orgânico", referral: "Indicação", organic: "Orgânico", other: "Outro",
};

const ORIGIN_COLOR: Record<string, string> = {
  meta_ads: "text-blue-400", google_ads: "text-yellow-400", instagram: "text-pink-400",
  google_organic: "text-green-400", referral: "text-violet-400", organic: "text-emerald-400", other: "text-gray-400",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function fmtDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return "Hoje";
  if (d.toDateString() === yesterday.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

// ─── ChatPanel ────────────────────────────────────────────────────────────────

export function ChatPanel({ lead, instanceName, onClose }: ChatPanelProps) {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [loading, setLoading]     = useState(true);
  const [sendError, setSendError] = useState<string | null>(null);
  const [text, setText]           = useState("");
  const [sending, setSending]     = useState(false);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch messages ─────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (silent = false) => {
    if (!lead.phone) {
      setLoading(false);
      return;
    }
    try {
      const phone = lead.phone.replace(/\D/g, "");
      const res = await fetch(
        `/api/admin/whatsapp/chat/messages?instanceName=${encodeURIComponent(instanceName)}&phone=${phone}`,
        { cache: "no-store" }
      );
      if (!res.ok) return; // keep existing messages on error
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch {
      // Network error — keep existing messages, don't crash
    } finally {
      if (!silent) setLoading(false);
    }
  }, [instanceName, lead.phone]);

  // ── Start polling ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchMessages(false);
    pollRef.current = setInterval(() => fetchMessages(true), 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  // ── Auto-scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // ── Close on Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async (overrideText?: string) => {
    const toSend = (overrideText ?? text).trim();
    if (!toSend || sending || !lead.phone) return;

    setSendError(null);

    // Optimistic: show message immediately
    const tempId: string = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId, fromMe: true, text: toSend,
      timestamp: new Date().toISOString(), pushName: null,
    };
    setMessages((prev) => [...prev, optimistic]);
    if (!overrideText) setText("");
    setSending(true);

    try {
      const res = await fetch("/api/admin/whatsapp/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName, phone: lead.phone, text: toSend }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as Record<string, string>;
        // Remove optimistic on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setSendError(err.error ?? "Falha ao enviar. Tente novamente.");
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setSendError("Sem conexão com a API. Verifique o WhatsApp.");
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }, [instanceName, lead.phone, sending, text]);

  // ── Enter to send (Shift+Enter = nova linha) ───────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const initials = lead.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  // Group messages by date for date separators
  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const dateKey = new Date(msg.timestamp).toDateString();
    const last = acc[acc.length - 1];
    if (last && last.date === dateKey) {
      last.msgs.push(msg);
    } else {
      acc.push({ date: dateKey, msgs: [msg] });
    }
    return acc;
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — slides in from right */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[420px] flex flex-col bg-[#0a0a0a] border-l border-[#1e1e1e] shadow-2xl"
           style={{ animation: "slideInRight 0.2s ease-out" }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#111] border-b border-[#1e1e1e] flex-shrink-0">
          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-[#1e1e1e] transition-colors flex-shrink-0"
            title="Fechar (Esc)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#262626] flex items-center justify-center flex-shrink-0 ring-2 ring-[#333]">
            {lead.photoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={lead.photoUrl} alt={lead.name} className="w-full h-full object-cover" />
              : <span className="text-sm font-bold text-gray-300">{initials}</span>
            }
          </div>

          {/* Name + info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate">{lead.name}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs font-medium ${ORIGIN_COLOR[lead.origin] ?? "text-gray-400"}`}>
                {ORIGIN_LABELS[lead.origin] ?? "Outro"}
              </span>
              {lead.city && (
                <span className="text-xs text-gray-600">
                  · {lead.city}{lead.state ? `, ${lead.state}` : ""}
                </span>
              )}
            </div>
          </div>

          {/* WhatsApp external link */}
          {lead.phone && (
            <a
              href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl text-[#25D366] hover:bg-[#25D366]/10 transition-colors flex-shrink-0"
              title="Abrir no WhatsApp"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.529 5.855L0 24l6.335-1.502A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.935 0-3.741-.516-5.299-1.415l-.38-.224-3.762.892.952-3.655-.247-.397A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </a>
          )}
        </div>

        {/* ── Messages ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#333 transparent" }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#333] border-t-[#25D366] animate-spin" />
              <p className="text-xs text-gray-600">Carregando conversa...</p>
            </div>
          ) : !lead.phone ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <span className="text-3xl">📵</span>
              <p className="text-sm text-gray-500">Número não disponível</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <span className="text-3xl">💬</span>
              <p className="text-sm text-gray-500">Nenhuma mensagem ainda</p>
              <p className="text-xs text-gray-700">Use uma resposta rápida para iniciar</p>
            </div>
          ) : (
            <div className="space-y-1">
              {groupedMessages.map(({ date, msgs }) => (
                <div key={date}>
                  {/* Date separator */}
                  <div className="flex justify-center my-4">
                    <span className="text-[10px] text-gray-600 bg-[#1a1a1a] border border-[#262626] px-3 py-1 rounded-full">
                      {fmtDateLabel(msgs[0].timestamp)}
                    </span>
                  </div>

                  {/* Messages in this group */}
                  <div className="space-y-1">
                    {msgs.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                        <div className={`
                          max-w-[82%] px-3 py-2 rounded-2xl
                          ${msg.fromMe
                            ? "bg-[#005c4b] rounded-tr-sm"
                            : "bg-[#1e1e1e] rounded-tl-sm"
                          }
                          ${msg.id.startsWith("temp-") ? "opacity-70" : ""}
                        `}>
                          {/* Sender name (only for received messages) */}
                          {!msg.fromMe && msg.pushName && (
                            <p className="text-[10px] font-semibold text-[#25D366] mb-0.5">{msg.pushName}</p>
                          )}
                          {/* Message text */}
                          <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                          {/* Timestamp + check */}
                          <div className={`flex items-center gap-1 mt-0.5 ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                            <span className="text-[10px] text-gray-500">{fmtTime(msg.timestamp)}</span>
                            {msg.fromMe && (
                              <span className="text-[10px] text-[#53bdeb]">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Quick replies ─────────────────────────────────────────────────── */}
        <div
          className="flex gap-2 px-4 py-2.5 bg-[#0d0d0d] border-t border-[#1a1a1a] overflow-x-auto flex-shrink-0"
          style={{ scrollbarWidth: "none" }}
        >
          {QUICK_REPLIES.map((qr) => (
            <button
              key={qr.label}
              onClick={() => handleSend(qr.text)}
              disabled={sending || !lead.phone}
              title={qr.text}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-[#2a2a2a] text-gray-400 bg-[#161616] hover:border-[#25D366]/40 hover:text-[#25D366] hover:bg-[#25D366]/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {qr.label}
            </button>
          ))}
        </div>

        {/* ── Send error ────────────────────────────────────────────────────── */}
        {sendError && (
          <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 flex items-center justify-between gap-2 flex-shrink-0">
            <p className="text-xs text-red-400">{sendError}</p>
            <button onClick={() => setSendError(null)} className="text-red-400/60 hover:text-red-400 text-xs flex-shrink-0">✕</button>
          </div>
        )}

        {/* ── Input ─────────────────────────────────────────────────────────── */}
        <div className="flex items-end gap-2 px-4 py-3 bg-[#111] border-t border-[#1e1e1e] flex-shrink-0">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => { setText(e.target.value); setSendError(null); }}
            onKeyDown={handleKeyDown}
            disabled={!lead.phone || sending}
            placeholder={lead.phone ? "Digite... (Enter envia, Shift+Enter pula linha)" : "Número não disponível"}
            rows={1}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#25D366]/40 resize-none transition-colors disabled:opacity-40"
            style={{ minHeight: "42px", maxHeight: "96px" }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!text.trim() || sending || !lead.phone}
            className="w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center bg-[#25D366] hover:bg-[#22c55e] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {sending ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <svg className="w-5 h-5 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
