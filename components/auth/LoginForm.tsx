"use client";

import { useActionState } from "react";
import { loginAction, type ActionResult } from "@/lib/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface LoginFormProps {
  title?: string;
  subtitle?: string;
}

const initialState: ActionResult = {};

export function LoginForm({
  title = "Acesso ao Sistema",
  subtitle = "Entre com suas credenciais",
}: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #312e81 60%, #1e293b 100%)" }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 via-violet-500 to-purple-600 mb-5 shadow-lg shadow-violet-500/30">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
              <path d="M14 2L5 13.5H11.5L10 22L19 10.5H12.5L14 2Z" fill="white" fillOpacity="0.95" />
              <path d="M13 5L7.5 13H12L11 19L17 11H13L13 5Z" fill="rgba(255,255,255,0.25)" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-sm text-indigo-200/70 mt-2">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 shadow-2xl shadow-black/20 p-8" style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
          <form action={formAction} className="space-y-5">
            {state.error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
                {state.error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-indigo-200">E-mail</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="seu@email.com"
                className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-indigo-300/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-indigo-200">Senha</label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-indigo-300/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center justify-end">
              <a href="/recover-password" className="text-xs text-indigo-300/60 hover:text-indigo-200 transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50"
            >
              {isPending ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-indigo-300/30 mt-6">
          Grupo F5 Consultoria · Gestão Interna
        </p>
      </div>
    </div>
  );
}
