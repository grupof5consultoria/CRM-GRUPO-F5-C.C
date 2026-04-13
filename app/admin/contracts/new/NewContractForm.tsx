"use client";

import { useActionState, useState } from "react";
import { createContractAction } from "../actions";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { renderContract, ContractVars, DEFAULT_SERVICES } from "@/lib/contractTemplate";
import { PLAN_CONFIG } from "@/lib/agencia-config";

interface Client { id: string; name: string; document: string | null }

const initialState = { error: undefined as string | undefined };

function buildPreview(fields: {
  clientName: string; cpf: string; endereco: string; cidadeEstadoCep: string;
  plano: string; meses: number; valor: number; valorExtenso: string; dia: number;
  publico: string; servicos: string[];
}): string {
  const vars: ContractVars = {
    plano: fields.plano || "START",
    nomeContratante: fields.clientName || "{{NOME DO CONTRATANTE}}",
    enderecoContratante: fields.endereco || "{{ENDEREÇO}}",
    cidadeEstadoCep: fields.cidadeEstadoCep || "{{CIDADE - ESTADO, CEP}}",
    cpfContratante: fields.cpf || "{{CPF}}",
    meses: fields.meses || 3,
    valorMensal: fields.valor || 0,
    valorMensalExtenso: fields.valorExtenso || "{{VALOR POR EXTENSO}}",
    diaVencimento: fields.dia || 10,
    publicoAlvo: fields.publico || "{{PÚBLICO-ALVO}}",
    servicos: fields.servicos.length > 0 ? fields.servicos : DEFAULT_SERVICES,
  };
  return renderContract(vars);
}

export function NewContractForm({ clients }: { clients: Client[] }) {
  const [state, formAction, isPending] = useActionState(createContractAction, initialState);
  const [showPreview, setShowPreview] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidadeEstadoCep, setCidadeEstadoCep] = useState("");
  const [plano, setPlano] = useState("START");
  const [meses, setMeses] = useState(3);
  const [valor, setValor] = useState(0);
  const [valorExtenso, setValorExtenso] = useState("");
  const [dia, setDia] = useState(10);
  const [publico, setPublico] = useState("");

  // Serviços
  const [servicos, setServicos] = useState<string[]>(DEFAULT_SERVICES);
  const [novoServico, setNovoServico] = useState("");

  const selectedClient = clients.find(c => c.id === selectedClientId);

  function handleClientChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const c = clients.find(x => x.id === e.target.value);
    setSelectedClientId(e.target.value);
    if (c?.document) setCpf(c.document);
  }

  function toggleServico(s: string) {
    setServicos(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function addServico() {
    const trimmed = novoServico.trim();
    if (trimmed && !servicos.includes(trimmed)) {
      setServicos(prev => [...prev, trimmed]);
    }
    setNovoServico("");
  }

  function removeServico(s: string) {
    setServicos(prev => prev.filter(x => x !== s));
  }

  const previewText = buildPreview({
    clientName: selectedClient?.name ?? "",
    cpf, endereco, cidadeEstadoCep, plano, meses, valor, valorExtenso, dia, publico, servicos,
  });

  return (
    <form action={formAction} className="space-y-0">
      {state.error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 mb-6">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left: form fields ── */}
        <div className="space-y-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Dados do Contratante</h2>

          {/* Client */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Cliente *</label>
            <select
              name="clientId"
              value={selectedClientId}
              onChange={handleClientChange}
              required
              className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Selecione o cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Nome no contrato */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Nome completo (como aparece no contrato) *</label>
            <input
              name="nomeContratante"
              required
              value={selectedClient?.name ?? ""}
              readOnly
              className="w-full rounded-xl border border-[#333] bg-[#111] px-3 py-2.5 text-sm text-gray-400 focus:outline-none"
            />
          </div>

          {/* CPF */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">CPF do Contratante *</label>
            <input
              name="cpfContratante"
              required
              value={cpf}
              onChange={e => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Endereço *</label>
            <input
              name="enderecoContratante"
              required
              value={endereco}
              onChange={e => setEndereco(e.target.value)}
              placeholder="Rua, número, bairro"
              className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Cidade / Estado / CEP */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Cidade — Estado, CEP *</label>
            <input
              name="cidadeEstadoCep"
              required
              value={cidadeEstadoCep}
              onChange={e => setCidadeEstadoCep(e.target.value)}
              placeholder="São Paulo - SP, 01310-100"
              className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="pt-2 border-t border-[#222]">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Dados do Contrato</h2>

            {/* Plano */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Plano / Método</label>
              <select
                name="plano"
                value={plano}
                onChange={e => {
                  const p = e.target.value;
                  setPlano(p);
                  // Auto-fill price and services from PLAN_CONFIG
                  if (p === "F5 START") {
                    setValor(PLAN_CONFIG.start.priceMonthly);
                    setServicos(PLAN_CONFIG.start.services);
                  } else if (p === "F5 SCALE") {
                    setValor(PLAN_CONFIG.scale.priceMonthly);
                    setServicos(PLAN_CONFIG.scale.services);
                  }
                }}
                className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <optgroup label="Planos F5 Agência">
                  <option value="F5 START">F5 START — R$ {PLAN_CONFIG.start.priceMonthly.toLocaleString("pt-BR")}/mês</option>
                  <option value="F5 SCALE">F5 SCALE — R$ {PLAN_CONFIG.scale.priceMonthly.toLocaleString("pt-BR")}/mês</option>
                </optgroup>
                <optgroup label="Outros">
                  <option value="START">START</option>
                  <option value="SCALE">SCALE</option>
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="ELITE">ELITE</option>
                </optgroup>
              </select>
              {(plano === "F5 START" || plano === "F5 SCALE") && (
                <p className="text-xs text-violet-400 mt-1">✓ Preço e serviços preenchidos automaticamente pelo plano selecionado</p>
              )}
            </div>

            {/* Meses + Dia vencimento */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">Duração (meses) *</label>
                <input
                  name="meses"
                  type="number"
                  min={1}
                  max={24}
                  required
                  value={meses}
                  onChange={e => setMeses(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">Dia de vencimento *</label>
                <input
                  name="diaVencimento"
                  type="number"
                  min={1}
                  max={28}
                  required
                  value={dia}
                  onChange={e => setDia(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Valor */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Valor mensal (R$) *</label>
              <input
                name="value"
                type="number"
                min={0}
                step={0.01}
                required
                value={valor || ""}
                onChange={e => setValor(Number(e.target.value))}
                placeholder="1800.00"
                className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Valor por extenso */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Valor por extenso *</label>
              <input
                name="valorMensalExtenso"
                required
                value={valorExtenso}
                onChange={e => setValorExtenso(e.target.value)}
                placeholder="Mil e oitocentos reais"
                className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Público-alvo */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Público-alvo / bairros *</label>
              <input
                name="publicoAlvo"
                required
                value={publico}
                onChange={e => setPublico(e.target.value)}
                placeholder="Classes A, B, C — bairros de São Paulo e adjacentes"
                className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* ── Serviços incluídos ── */}
          <div className="border-t border-[#222] pt-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Serviços incluídos (Cláusula 1.2)
            </h2>
            <p className="text-xs text-gray-600 mb-4">Marque apenas os serviços que fazem parte deste contrato.</p>

            <div className="space-y-2">
              {DEFAULT_SERVICES.map(s => (
                <label key={s} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="servicos"
                    value={s}
                    checked={servicos.includes(s)}
                    onChange={() => toggleServico(s)}
                    className="accent-violet-500 w-4 h-4 flex-shrink-0"
                  />
                  <span className={`text-sm transition-colors ${servicos.includes(s) ? "text-gray-200" : "text-gray-600 line-through"}`}>
                    {s}
                  </span>
                </label>
              ))}

              {/* Custom services added by user */}
              {servicos.filter(s => !DEFAULT_SERVICES.includes(s)).map(s => (
                <div key={s} className="flex items-center gap-3">
                  <input type="checkbox" name="servicos" value={s} checked readOnly className="accent-violet-500 w-4 h-4 flex-shrink-0" />
                  <span className="text-sm text-violet-300 flex-1">{s}</span>
                  <button
                    type="button"
                    onClick={() => removeServico(s)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                  >
                    remover
                  </button>
                </div>
              ))}
            </div>

            {/* Add custom service */}
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={novoServico}
                onChange={e => setNovoServico(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addServico())}
                placeholder="Adicionar serviço personalizado..."
                className="flex-1 rounded-xl border border-dashed border-[#333] bg-[#111] px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
              <button
                type="button"
                onClick={addServico}
                className="px-3 py-2 rounded-xl border border-dashed border-[#333] hover:border-violet-600 text-gray-600 hover:text-violet-400 transition-colors text-sm"
              >
                + Adicionar
              </button>
            </div>
          </div>

          {/* Hidden title */}
          <input
            type="hidden"
            name="title"
            value={`Contrato ${plano} — ${selectedClient?.name ?? "Cliente"} (${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })})`}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending}>Criar Contrato</Button>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2.5 rounded-xl border border-[#333] text-sm text-gray-400 hover:border-violet-600 hover:text-violet-400 transition-colors"
            >
              {showPreview ? "Ocultar Preview" : "Visualizar Contrato"}
            </button>
            <Link href="/admin/contracts">
              <button type="button" className="px-4 py-2.5 rounded-xl border border-[#333] text-sm text-gray-600 hover:text-gray-400 transition-colors">
                Cancelar
              </button>
            </Link>
          </div>
        </div>

        {/* ── Right: preview ── */}
        {showPreview && (
          <div className="bg-[#111] border border-[#262626] rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: "85vh", position: "sticky", top: "1rem" }}>
            <div className="px-4 py-3 border-b border-[#1e1e1e] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              <span className="text-xs font-medium text-gray-400">Preview do Contrato</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {previewText}
              </pre>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
