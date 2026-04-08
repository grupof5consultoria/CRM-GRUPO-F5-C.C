"use client";

import { useState, useRef, useEffect, useActionState } from "react";
import { updateProfileAction, updatePasswordAction } from "@/app/admin/profile/actions";
import Image from "next/image";

interface ProfileMenuProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
}

type Tab = "profile" | "password";

export function ProfileMenu({ name, email, avatarUrl }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("profile");
  const [previewUrl, setPreviewUrl] = useState<string>(avatarUrl ?? "");
  const dropRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, {});
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePasswordAction, {});

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close modal on success after short delay
  useEffect(() => {
    if (profileState?.success || passwordState?.success) {
      const t = setTimeout(() => setOpen(false), 1500);
      return () => clearTimeout(t);
    }
  }, [profileState?.success, passwordState?.success]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPreviewUrl(result);
      if (avatarInputRef.current) avatarInputRef.current.value = result;
    };
    reader.readAsDataURL(file);
  }

  const initials = name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="relative" ref={dropRef}>
      {/* Trigger: avatar + name */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-[#1a1a1a] transition-all group"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-300 leading-tight">{name}</p>
          <p className="text-xs text-gray-600 leading-tight">{email}</p>
        </div>
        <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover:ring-violet-500/40 transition-all">
          {previewUrl ? (
            <img src={previewUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
          )}
        </div>
        <svg className="w-3 h-3 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown modal */}
      {open && (
        <div className="absolute right-0 top-12 w-96 bg-[#1a1a1a] border border-[#262626] rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#262626]">
            <div
              className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer group"
              onClick={() => fileRef.current?.click()}
              title="Clique para trocar a foto"
            >
              {previewUrl ? (
                <img src={previewUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-violet-600 flex items-center justify-center text-white font-bold text-lg">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div>
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-gray-500">{email}</p>
              <p className="text-xs text-violet-400 mt-0.5 cursor-pointer hover:text-violet-300" onClick={() => fileRef.current?.click()}>
                Trocar foto
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#262626]">
            {(["profile", "password"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                  tab === t
                    ? "text-violet-400 border-b-2 border-violet-500"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                {t === "profile" ? "Dados Pessoais" : "Alterar Senha"}
              </button>
            ))}
          </div>

          {/* Tab: Profile */}
          {tab === "profile" && (
            <form action={profileAction} className="p-5 space-y-4">
              {/* Hidden avatar URL input */}
              <input ref={avatarInputRef} type="hidden" name="avatarUrl" defaultValue={previewUrl} />

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nome</label>
                <input
                  name="name"
                  defaultValue={name}
                  required
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={email}
                  required
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {profileState?.error && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{profileState.error}</p>
              )}
              {profileState?.success && (
                <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">{profileState.success}</p>
              )}

              <button
                type="submit"
                disabled={profilePending}
                className="relative w-full py-2 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
              >
                <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
                <span className="relative">{profilePending ? "Salvando..." : "Salvar Alterações"}</span>
              </button>
            </form>
          )}

          {/* Tab: Password */}
          {tab === "password" && (
            <form action={passwordAction} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Senha Atual</label>
                <input
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nova Senha</label>
                <input
                  name="newPassword"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Confirmar Nova Senha</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {passwordState?.error && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{passwordState.error}</p>
              )}
              {passwordState?.success && (
                <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">{passwordState.success}</p>
              )}

              <button
                type="submit"
                disabled={passwordPending}
                className="relative w-full py-2 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
              >
                <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
                <span className="relative">{passwordPending ? "Alterando..." : "Alterar Senha"}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
