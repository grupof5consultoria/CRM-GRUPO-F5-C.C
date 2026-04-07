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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <form action={formAction} className="space-y-5">
            {state.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <Input
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="seu@email.com"
            />

            <Input
              label="Senha"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />

            <div className="flex items-center justify-end">
              <a href="/recover-password" className="text-xs text-blue-600 hover:underline">
                Esqueceu a senha?
              </a>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isPending}>
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
