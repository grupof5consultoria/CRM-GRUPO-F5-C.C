import { Topbar } from "@/components/layout/Topbar";
import { getWikiPages } from "@/services/agencia";
import { EducacionalClient } from "./EducacionalClient";

export const metadata = { title: "Agência · Educacional | Gestão Interna" };

export default async function EducacionalPage() {
  const [cursosPages, acessosPages, aprendizadoPages] = await Promise.all([
    getWikiPages("edu_cursos"),
    getWikiPages("edu_acessos"),
    getWikiPages("edu_aprendizado"),
  ]);

  return (
    <>
      <Topbar title="Agência · Educacional" />
      <main className="flex-1 overflow-auto p-6">
        <EducacionalClient
          cursosPages={cursosPages}
          acessosPages={acessosPages}
          aprendizadoPages={aprendizadoPages}
        />
      </main>
    </>
  );
}
