import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd, EmptyRow } from "@/components/ui/Table";
import { getServices, getServiceCategories, CHARGE_TYPE_LABELS } from "@/services/catalog";
import { NewServiceForm } from "./NewServiceForm";
import { ToggleServiceButton } from "./ToggleServiceButton";

export const metadata = { title: "Catálogo de Serviços | Gestão Interna" };

export default async function CatalogPage() {
  const [services, categories] = await Promise.all([
    getServices(),
    getServiceCategories(),
  ]);

  return (
    <>
      <Topbar title="Catálogo de Serviços" />
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Novo Serviço</h2>
              <NewServiceForm categories={categories} />
            </div>
          </div>

          {/* Lista */}
          <div className="lg:col-span-2">
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Nome</TableTh>
                  <TableTh>Categoria</TableTh>
                  <TableTh>Valor Padrão</TableTh>
                  <TableTh>Tipo</TableTh>
                  <TableTh>Status</TableTh>
                  <TableTh></TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.length === 0 ? (
                  <EmptyRow cols={6} message="Nenhum serviço cadastrado." />
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableTd>
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          {service.description && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{service.description}</p>
                          )}
                        </div>
                      </TableTd>
                      <TableTd>{service.category.name}</TableTd>
                      <TableTd>
                        R$ {Number(service.defaultValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        {service.defaultHours && (
                          <span className="text-xs text-gray-400 ml-1">({Number(service.defaultHours)}h)</span>
                        )}
                      </TableTd>
                      <TableTd>
                        <Badge variant="gray">{CHARGE_TYPE_LABELS[service.chargeType]}</Badge>
                      </TableTd>
                      <TableTd>
                        <Badge variant={service.isActive ? "success" : "gray"}>
                          {service.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableTd>
                      <TableTd>
                        <ToggleServiceButton id={service.id} isActive={service.isActive} />
                      </TableTd>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </>
  );
}
