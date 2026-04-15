import { Topbar } from "@/components/layout/Topbar";
import { getServices, getServiceCategories, CHARGE_TYPE_LABELS } from "@/services/catalog";
import { NewServiceForm } from "./NewServiceForm";
import { ToggleServiceButton } from "./ToggleServiceButton";
import { ImportCatalogButton } from "./ImportCatalogButton";

export const metadata = { title: "Catálogo de Serviços | Gestão Interna" };

const CATEGORY_ICONS: Record<string, string> = {
  "cat-pacotes-f5":    "⚡",
  "cat-trafego-pago":  "📡",
  "cat-landing-page":  "🌐",
  "cat-desenvolvimento": "💻",
  "cat-design":        "🎨",
  "cat-consultoria":   "🧠",
};

const CHARGE_COLORS: Record<string, string> = {
  recurring: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  one_time:  "text-amber-400 bg-amber-500/10 border-amber-500/20",
  hourly:    "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

export default async function CatalogPage() {
  const [services, categories] = await Promise.all([
    getServices(),
    getServiceCategories(),
  ]);

  // Group services by category
  const grouped = categories.map(cat => ({
    category: cat,
    services: services.filter(s => s.categoryId === cat.id),
  })).filter(g => g.services.length > 0);

  const uncategorized = services.filter(s => !categories.find(c => c.id === s.categoryId));

  return (
    <>
      <Topbar title="Catálogo de Serviços" />
      <main className="flex-1 p-6 space-y-6 max-w-6xl">

        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{services.length} serviço{services.length !== 1 ? "s" : ""} cadastrado{services.length !== 1 ? "s" : ""}</p>
          </div>
          <ImportCatalogButton />
        </div>

        {/* Grouped catalog */}
        {grouped.length === 0 && uncategorized.length === 0 ? (
          <div className="bg-[#111] border border-[#262626] rounded-2xl p-12 text-center">
            <p className="text-2xl mb-3">📦</p>
            <p className="text-gray-400 font-medium mb-1">Nenhum serviço cadastrado</p>
            <p className="text-xs text-gray-600">Importe o catálogo padrão F5 ou adicione serviços abaixo</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ category, services: catServices }) => (
              <div key={category.id} className="bg-[#111] border border-[#262626] rounded-2xl overflow-hidden">
                {/* Category header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1e1e1e] bg-[#0d0d0d]">
                  <span className="text-lg">{CATEGORY_ICONS[category.id] ?? "🗂️"}</span>
                  <h2 className="text-sm font-bold text-white">{category.name}</h2>
                  <span className="ml-auto text-xs text-gray-600">{catServices.length} serviço{catServices.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Services grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-[#1e1e1e]">
                  {catServices.map(service => (
                    <div key={service.id} className={`bg-[#111] p-5 space-y-3 ${!service.isActive ? "opacity-50" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white leading-snug">{service.name}</p>
                          {service.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{service.description}</p>
                          )}
                        </div>
                        <ToggleServiceButton id={service.id} isActive={service.isActive} />
                      </div>

                      <div className="flex items-end justify-between pt-1">
                        <div>
                          <p className="text-lg font-bold text-white">
                            R$ {Number(service.defaultValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                          {service.chargeType === "recurring" && (
                            <p className="text-[10px] text-gray-600">/mês</p>
                          )}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${CHARGE_COLORS[service.chargeType] ?? CHARGE_COLORS.one_time}`}>
                          {CHARGE_TYPE_LABELS[service.chargeType]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new service */}
        <div className="bg-[#111] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#1e1e1e] bg-[#0d0d0d]">
            <span className="text-base">➕</span>
            <h2 className="text-sm font-bold text-white">Novo Serviço</h2>
          </div>
          <div className="p-6 max-w-xl">
            <NewServiceForm categories={categories} />
          </div>
        </div>

      </main>
    </>
  );
}
