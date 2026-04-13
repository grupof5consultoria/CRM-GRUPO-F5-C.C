"use client";

import { useState, useActionState, useTransition } from "react";
import {
  saveTrafficSettingsAction,
  updateTrafficTaskAction,
  addOptimizationAction,
  deleteOptimizationAction,
  addAudienceAction,
  updateAudienceAction,
  deleteAudienceAction,
  saveInstagramTrackingAction,
  deleteInstagramTrackingAction,
} from "./trafficActions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrafficSettings {
  platforms: string[];
  caMeta?: string | null;
  caGoogle?: string | null;
  dailyBudget?: number | string | null;
  monthlyBudget?: number | string | null;
  driveLink?: string | null;
}

interface TrafficTask {
  id: string;
  type: string;
  title: string;
  frequency?: string | null;
  assignedTo?: string | null;
  status: string;
  comment?: string | null;
  dueDate?: Date | string | null;
}

interface CampaignOptimization {
  id: string;
  date: string;
  platform: string;
  campaignName?: string | null;
  description?: string | null;
  frequencyType?: string | null;
  assignedTo?: string | null;
  comment?: string | null;
}

interface AudienceUpdate {
  id: string;
  audienceType: string;
  name: string;
  windowDays?: number | null;
  assignedTo?: string | null;
  comment?: string | null;
  lastUpdated?: Date | string | null;
}

interface InstagramTracking {
  id: string;
  weekReference: string;
  postedDaily?: string | null;
  postedWeekly?: boolean | null;
  assignedTo?: string | null;
  comment?: string | null;
}

interface Props {
  clientId: string;
  settings: TrafficSettings | null;
  tasks: TrafficTask[];
  optimizations: CampaignOptimization[];
  audiences: AudienceUpdate[];
  instagram: InstagramTracking[];
}

type TabId = "settings" | "tasks" | "optimizations" | "audiences" | "instagram";

const TABS: { id: TabId; label: string }[] = [
  { id: "settings",      label: "Manual" },
  { id: "tasks",         label: "Tarefas" },
  { id: "optimizations", label: "Otimizações" },
  { id: "audiences",     label: "Públicos" },
  { id: "instagram",     label: "Instagram" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function TrafficPanel({ clientId, settings, tasks, optimizations, audiences, instagram }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("settings");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-[#111] rounded-xl mb-4 border border-[#262626]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-xs font-medium px-3 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-violet-600 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "settings" && (
        <SettingsTab clientId={clientId} settings={settings} />
      )}
      {activeTab === "tasks" && (
        <TasksTab clientId={clientId} tasks={tasks} hasSettings={!!settings} />
      )}
      {activeTab === "optimizations" && (
        <OptimizationsTab clientId={clientId} optimizations={optimizations} />
      )}
      {activeTab === "audiences" && (
        <AudiencesTab clientId={clientId} audiences={audiences} />
      )}
      {activeTab === "instagram" && (
        <InstagramTab clientId={clientId} instagram={instagram} />
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ clientId, settings }: { clientId: string; settings: TrafficSettings | null }) {
  const [state, action, isPending] = useActionState(saveTrafficSettingsAction, {});
  const [platforms, setPlatforms] = useState<string[]>(settings?.platforms ?? []);

  function togglePlatform(p: string) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="clientId" value={clientId} />
      {platforms.map(p => <input key={p} type="hidden" name="platforms" value={p} />)}

      {state.error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">{state.error}</div>
      )}
      {state.success && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-400">Salvo com sucesso!</div>
      )}

      {/* Platforms */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Plataformas</p>
        <div className="flex gap-2">
          {["meta_ads", "google_ads"].map(p => (
            <button
              key={p}
              type="button"
              onClick={() => togglePlatform(p)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                platforms.includes(p)
                  ? "bg-violet-600/20 border-violet-500 text-violet-300"
                  : "bg-[#111] border-[#333] text-gray-500 hover:border-[#555]"
              }`}
            >
              {p === "meta_ads" ? "Meta Ads" : "Google Ads"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="CA Meta" name="caMeta" defaultValue={settings?.caMeta ?? ""} placeholder="ID da conta" />
        <FieldInput label="CA Google" name="caGoogle" defaultValue={settings?.caGoogle ?? ""} placeholder="ID da conta" />
        <FieldInput label="Orçamento Diário (R$)" name="dailyBudget" type="number" step="0.01" defaultValue={settings?.dailyBudget != null ? String(settings.dailyBudget) : ""} placeholder="0,00" />
        <FieldInput label="Orçamento Mensal (R$)" name="monthlyBudget" type="number" step="0.01" defaultValue={settings?.monthlyBudget != null ? String(settings.monthlyBudget) : ""} placeholder="0,00" />
      </div>

      <FieldInput label="Link da Pasta Drive" name="driveLink" defaultValue={settings?.driveLink ?? ""} placeholder="https://drive.google.com/..." />

      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition-colors"
      >
        {isPending ? "Salvando..." : "Salvar Manual"}
      </button>
    </form>
  );
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────

const FREQ_LABELS: Record<string, string> = {
  daily: "Diária", weekly: "Semanal", monthly: "Mensal",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  done:    { label: "Concluída", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  skipped: { label: "Ignorada", color: "text-gray-500 bg-[#222] border-[#333]" },
};

function dueDateLabel(dueDate: Date | string | null | undefined): string {
  if (!dueDate) return "";
  const d = new Date(dueDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `Atrasada ${Math.abs(diff)}d`;
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff <= 7) return `Em ${diff} dias`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function TasksTab({ clientId, tasks, hasSettings }: { clientId: string; tasks: TrafficTask[]; hasSettings: boolean }) {
  if (!hasSettings) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Configure o Manual do Cliente primeiro para gerar as tarefas recorrentes.
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Nenhuma tarefa ainda. Salve o Manual para gerar as tarefas padrão.
      </div>
    );
  }

  // Group: pending first, then done
  const pending = tasks.filter(t => t.status !== "done" && t.status !== "skipped");
  const done    = tasks.filter(t => t.status === "done" || t.status === "skipped");

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map(task => (
            <TaskRow key={task.id} task={task} clientId={clientId} />
          ))}
        </div>
      )}
      {done.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-400 transition-colors list-none flex items-center gap-1.5 py-1">
            <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {done.length} concluída{done.length > 1 ? "s" : ""}
          </summary>
          <div className="space-y-2 mt-2">
            {done.map(task => (
              <TaskRow key={task.id} task={task} clientId={clientId} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function TaskRow({ task, clientId }: { task: TrafficTask; clientId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [assignedTo, setAssignedTo] = useState(task.assignedTo ?? "");
  const [comment, setComment] = useState(task.comment ?? "");
  const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.pending;

  function handleStatusChange(newStatus: string) {
    startTransition(() =>
      updateTrafficTaskAction(task.id, clientId, {
        status: newStatus,
        assignedTo: assignedTo || null,
        comment: comment || null,
      })
    );
  }

  function handleSave() {
    startTransition(() =>
      updateTrafficTaskAction(task.id, clientId, {
        status: task.status,
        assignedTo: assignedTo || null,
        comment: comment || null,
      })
    );
    setExpanded(false);
  }

  return (
    <div className={`bg-[#111] border rounded-xl overflow-hidden transition-all ${task.status === "done" ? "border-emerald-500/20" : "border-[#262626]"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => handleStatusChange(task.status === "done" ? "pending" : "done")}
          disabled={isPending}
          className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${
            task.status === "done"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-[#444] hover:border-emerald-500"
          }`}
        >
          {task.status === "done" && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.status === "done" ? "text-gray-500 line-through" : "text-gray-200"}`}>
            {task.title}
          </p>
          {task.assignedTo && (
            <p className="text-xs text-gray-600 mt-0.5">{task.assignedTo}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.frequency && (
            <span className="text-xs text-gray-600 hidden sm:block">{FREQ_LABELS[task.frequency] ?? task.frequency}</span>
          )}
          {task.dueDate && task.status !== "done" && (
            <span className={`text-xs font-medium hidden sm:block ${
              dueDateLabel(task.dueDate).startsWith("Atrasada") ? "text-red-400" :
              dueDateLabel(task.dueDate) === "Hoje" ? "text-sky-400" : "text-gray-500"
            }`}>
              {dueDateLabel(task.dueDate)}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-lg border ${cfg.color}`}>{cfg.label}</span>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-gray-600 hover:text-gray-300 transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-[#262626] space-y-3 mt-0">
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Responsável</label>
              <input
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                placeholder="Nome"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Status</label>
              <select
                value={task.status}
                onChange={e => handleStatusChange(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="pending">Pendente</option>
                <option value="done">Concluída</option>
                <option value="skipped">Ignorada</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Comentário</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={2}
              placeholder="Observações..."
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg text-xs font-medium text-white transition-colors"
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Optimizations Tab ────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<string, string> = {
  meta: "Meta Ads", google: "Google Ads", both: "Ambas",
};

const FREQ_TYPE_LABELS: Record<string, string> = {
  daily: "Diária", weekly: "Semanal", monthly: "Mensal",
};

function OptimizationsTab({ clientId, optimizations }: { clientId: string; optimizations: CampaignOptimization[] }) {
  const [showForm, setShowForm] = useState(false);
  const [state, action, isPending] = useActionState(addOptimizationAction, {});
  const [deleting, startDelete] = useTransition();

  return (
    <div className="space-y-4">
      {/* Add form */}
      {showForm ? (
        <form action={action} className="bg-[#111] border border-[#333] rounded-xl p-4 space-y-3">
          <input type="hidden" name="clientId" value={clientId} />
          {state.error && <p className="text-red-400 text-xs">{state.error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Data *</label>
              <input
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Plataforma *</label>
              <select
                name="platform"
                required
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="">Selecione...</option>
                <option value="meta">Meta Ads</option>
                <option value="google">Google Ads</option>
                <option value="both">Ambas</option>
              </select>
            </div>
            <FieldInput label="Campanha" name="campaignName" placeholder="Nome da campanha" />
            <div>
              <label className="text-xs text-gray-500 block mb-1">Frequência</label>
              <select
                name="frequencyType"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="">Selecione...</option>
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            <FieldInput label="Responsável" name="assignedTo" placeholder="Nome" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Descrição</label>
            <textarea
              name="description"
              rows={2}
              placeholder="O que foi otimizado..."
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Comentário</label>
            <textarea
              name="comment"
              rows={2}
              placeholder="Observações..."
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg text-xs font-medium text-white transition-colors"
            >
              {isPending ? "Salvando..." : "Adicionar"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-[#1a1a1a] border border-[#333] hover:border-[#555] rounded-lg text-xs font-medium text-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#333] hover:border-violet-500 rounded-xl text-xs text-gray-500 hover:text-violet-400 transition-all"
        >
          + Registrar Otimização
        </button>
      )}

      {/* List */}
      {optimizations.length === 0 ? (
        <p className="text-center text-gray-600 text-sm py-4">Nenhuma otimização registrada.</p>
      ) : (
        <div className="space-y-2">
          {optimizations.map(opt => (
            <div key={opt.id} className="bg-[#111] border border-[#262626] rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-lg">
                      {PLATFORM_LABELS[opt.platform] ?? opt.platform}
                    </span>
                    {opt.frequencyType && (
                      <span className="text-xs text-gray-500">{FREQ_TYPE_LABELS[opt.frequencyType]}</span>
                    )}
                    <span className="text-xs text-gray-600">{opt.date}</span>
                  </div>
                  {opt.campaignName && <p className="text-sm text-gray-300 font-medium">{opt.campaignName}</p>}
                  {opt.description && <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>}
                  {opt.assignedTo && <p className="text-xs text-gray-600 mt-1">por {opt.assignedTo}</p>}
                  {opt.comment && <p className="text-xs text-gray-600 italic mt-0.5">{opt.comment}</p>}
                </div>
                <button
                  onClick={() => startDelete(() => deleteOptimizationAction(opt.id, clientId))}
                  disabled={deleting}
                  className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Audiences Tab ────────────────────────────────────────────────────────────

function AudiencesTab({ clientId, audiences }: { clientId: string; audiences: AudienceUpdate[] }) {
  const videoview   = audiences.filter(a => a.audienceType === "videoview");
  const remarketing = audiences.filter(a => a.audienceType === "remarketing");

  return (
    <div className="space-y-6">
      <AudienceSection label="Videoview" audienceType="videoview" items={videoview} clientId={clientId} />
      <AudienceSection label="Remarketing" audienceType="remarketing" items={remarketing} clientId={clientId} />
    </div>
  );
}

function AudienceSection({
  label, audienceType, items, clientId,
}: {
  label: string;
  audienceType: string;
  items: AudienceUpdate[];
  clientId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [addState, addAction, addPending] = useActionState(addAudienceAction, {});
  const [deleting, startDelete] = useTransition();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <button
          onClick={() => setShowForm(s => !s)}
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          + Adicionar público
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form action={addAction} className="bg-[#111] border border-[#333] rounded-xl p-4 space-y-3 mb-3">
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="audienceType" value={audienceType} />
          {addState.error && <p className="text-red-400 text-xs">{addState.error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <FieldInput label="Nome do público *" name="name" placeholder={audienceType === "videoview" ? "Ex: Visualizou 75% do vídeo" : "Ex: Visitou página de serviços"} />
            </div>
            <FieldInput label="Janela de dias" name="windowDays" type="number" placeholder="Ex: 30" />
            <FieldInput label="Responsável" name="assignedTo" placeholder="Nome" />
            <div>
              <label className="text-xs text-gray-500 block mb-1">Última atualização</label>
              <input name="lastUpdated" type="date" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Comentário</label>
            <textarea name="comment" rows={2} placeholder="Observações..." className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={addPending} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg text-xs font-medium text-white transition-colors">
              {addPending ? "Salvando..." : "Adicionar"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-[#1a1a1a] border border-[#333] hover:border-[#555] rounded-lg text-xs font-medium text-gray-400 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {items.length === 0 && !showForm && (
        <p className="text-xs text-gray-600 py-2">Nenhum público cadastrado ainda.</p>
      )}

      <div className="space-y-2">
        {items.map(item => (
          <AudienceItem
            key={item.id}
            item={item}
            clientId={clientId}
            onDelete={() => startDelete(() => deleteAudienceAction(item.id, clientId))}
            deleting={deleting}
          />
        ))}
      </div>
    </div>
  );
}

function AudienceItem({ item, clientId, onDelete, deleting }: {
  item: AudienceUpdate; clientId: string; onDelete: () => void; deleting: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, isPending] = useActionState(updateAudienceAction, {});

  const lastUpdatedStr = item.lastUpdated
    ? new Date(item.lastUpdated).toLocaleDateString("pt-BR")
    : null;

  return (
    <div className={`bg-[#111] border rounded-xl overflow-hidden ${lastUpdatedStr ? "border-emerald-500/20" : "border-[#262626]"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-300 font-medium truncate">{item.name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            {item.windowDays && <span className="text-xs text-gray-600">{item.windowDays} dias</span>}
            {item.assignedTo && <span className="text-xs text-gray-600">{item.assignedTo}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {lastUpdatedStr
            ? <span className="text-xs text-emerald-400 hidden sm:block">Atualizado {lastUpdatedStr}</span>
            : <span className="text-xs text-gray-600 hidden sm:block">Não atualizado</span>
          }
          <button onClick={() => setEditing(e => !e)} className="text-gray-600 hover:text-violet-400 transition-colors" title="Editar">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={onDelete} disabled={deleting} className="text-gray-600 hover:text-red-400 transition-colors" title="Excluir">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {editing && (
        <form action={action} className="px-4 pb-4 border-t border-[#262626] pt-3 space-y-3">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="clientId" value={clientId} />
          {state.error && <p className="text-red-400 text-xs">{state.error}</p>}
          {state.success && <p className="text-emerald-400 text-xs">Salvo!</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <FieldInput label="Nome do público" name="name" defaultValue={item.name} />
            </div>
            <FieldInput label="Janela de dias" name="windowDays" type="number" defaultValue={item.windowDays != null ? String(item.windowDays) : ""} placeholder="Ex: 30" />
            <FieldInput label="Responsável" name="assignedTo" defaultValue={item.assignedTo ?? ""} placeholder="Nome" />
            <div>
              <label className="text-xs text-gray-500 block mb-1">Última atualização</label>
              <input name="lastUpdated" type="date" defaultValue={item.lastUpdated ? new Date(item.lastUpdated).toISOString().split("T")[0] : ""} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Comentário</label>
            <textarea name="comment" rows={2} defaultValue={item.comment ?? ""} placeholder="Observações..." className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg text-xs font-medium text-white transition-colors">
              {isPending ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-xs font-medium text-gray-400 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Instagram Tab ────────────────────────────────────────────────────────────

const POSTED_DAILY_OPTIONS = [
  { value: "yes", label: "Sim", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  { value: "partial", label: "Parcial", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { value: "no", label: "Não", color: "text-red-400 bg-red-500/10 border-red-500/30" },
];

function InstagramTab({ clientId, instagram }: { clientId: string; instagram: InstagramTracking[] }) {
  const [showForm, setShowForm] = useState(false);
  const [state, action, isPending] = useActionState(saveInstagramTrackingAction, {});
  const [deleting, startDelete] = useTransition();

  // Helper: get ISO week reference for current week
  function currentWeekRef() {
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(year, 0, 1);
    const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
    return `${year}-W${String(week).padStart(2, "0")}`;
  }

  return (
    <div className="space-y-4">
      {showForm ? (
        <form action={action} className="bg-[#111] border border-[#333] rounded-xl p-4 space-y-3">
          <input type="hidden" name="clientId" value={clientId} />
          {state.error && <p className="text-red-400 text-xs">{state.error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Semana de referência *</label>
              <input
                name="weekReference"
                type="week"
                required
                defaultValue={currentWeekRef()}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Postou diariamente?</label>
              <select
                name="postedDaily"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="">Selecione...</option>
                <option value="yes">Sim</option>
                <option value="partial">Parcial</option>
                <option value="no">Não</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Postou semanalmente?</label>
              <select
                name="postedWeekly"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="">Selecione...</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <FieldInput label="Responsável" name="assignedTo" placeholder="Nome" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Comentário</label>
            <textarea
              name="comment"
              rows={2}
              placeholder="Observações..."
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg text-xs font-medium text-white transition-colors"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-[#1a1a1a] border border-[#333] hover:border-[#555] rounded-lg text-xs font-medium text-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#333] hover:border-violet-500 rounded-xl text-xs text-gray-500 hover:text-violet-400 transition-all"
        >
          + Registrar Semana
        </button>
      )}

      {instagram.length === 0 ? (
        <p className="text-center text-gray-600 text-sm py-4">Nenhum registro de postagens ainda.</p>
      ) : (
        <div className="space-y-2">
          {instagram.map(row => {
            const dailyCfg = row.postedDaily
              ? POSTED_DAILY_OPTIONS.find(o => o.value === row.postedDaily)
              : null;
            return (
              <div key={row.id} className="bg-[#111] border border-[#262626] rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-medium text-gray-400">{row.weekReference}</span>
                      {dailyCfg && (
                        <span className={`text-xs px-2 py-0.5 rounded-lg border ${dailyCfg.color}`}>
                          Diário: {dailyCfg.label}
                        </span>
                      )}
                      {row.postedWeekly != null && (
                        <span className={`text-xs px-2 py-0.5 rounded-lg border ${row.postedWeekly ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-red-400 bg-red-500/10 border-red-500/30"}`}>
                          Semanal: {row.postedWeekly ? "Sim" : "Não"}
                        </span>
                      )}
                    </div>
                    {row.assignedTo && <p className="text-xs text-gray-600">por {row.assignedTo}</p>}
                    {row.comment && <p className="text-xs text-gray-600 italic mt-0.5">{row.comment}</p>}
                  </div>
                  <button
                    onClick={() => startDelete(() => deleteInstagramTrackingAction(row.id, clientId))}
                    disabled={deleting}
                    className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function FieldInput({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        step={step}
        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
      />
    </div>
  );
}
