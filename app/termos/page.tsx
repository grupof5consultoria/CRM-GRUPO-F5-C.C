export const metadata = {
  title: "Termos de Serviço | OdontoPulse by Grupo F5",
  description: "Termos de Serviço da plataforma OdontoPulse, desenvolvida pela Grupo F5 Consultoria.",
};

export default function TermosPage() {
  const updated = "08 de abril de 2026";

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Serviço</h1>
          <p className="text-sm text-gray-500">Última atualização: {updated}</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">

          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma <strong>OdontoPulse</strong>, operada pela{" "}
              <strong>Grupo F5 Consultoria</strong> (CNPJ 44.106.618/0001-06), você concorda com
              estes Termos de Serviço. Caso não concorde, não utilize a plataforma.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Descrição do Serviço</h2>
            <p>
              O OdontoPulse é uma plataforma de gestão voltada para clínicas de odontologia e
              harmonização facial, oferecendo funcionalidades de CRM, acompanhamento de métricas
              de campanhas publicitárias, gestão financeira e portal do cliente.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Cadastro e Acesso</h2>
            <p>Para utilizar a plataforma, o usuário deve:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Fornecer informações verdadeiras e atualizadas no cadastro;</li>
              <li>Manter a confidencialidade de suas credenciais de acesso;</li>
              <li>Notificar imediatamente qualquer uso não autorizado da sua conta;</li>
              <li>Ser responsável por todas as atividades realizadas com sua conta.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Integração com Plataformas de Terceiros</h2>
            <p>
              A plataforma permite integração com <strong>Meta Ads</strong> e{" "}
              <strong>Google Ads</strong> mediante autorização do usuário via OAuth. Ao autorizar
              essas integrações, o usuário concede ao OdontoPulse acesso de leitura às métricas
              das contas de anúncios autorizadas.
            </p>
            <p className="mt-2">
              O uso dessas integrações está sujeito também aos termos e políticas das respectivas
              plataformas (Meta Platform Terms e Google Ads Terms of Service).
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Uso Aceitável</h2>
            <p>O usuário concorda em não utilizar a plataforma para:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Atividades ilegais ou fraudulentas;</li>
              <li>Violar direitos de terceiros;</li>
              <li>Transmitir vírus ou código malicioso;</li>
              <li>Tentar obter acesso não autorizado a outros sistemas;</li>
              <li>Revender ou sublicenciar o acesso à plataforma sem autorização expressa.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Pagamento e Cancelamento</h2>
            <p>
              O acesso à plataforma está condicionado ao pagamento da mensalidade contratada.
              O não pagamento poderá resultar na suspensão ou encerramento do acesso. O cancelamento
              pode ser solicitado a qualquer momento pelo e-mail{" "}
              <a href="mailto:grupof5consultoria@gmail.com" className="text-violet-600 underline">
                grupof5consultoria@gmail.com
              </a>{" "}
              com aviso prévio de 30 dias.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo, código, design e funcionalidades da plataforma OdontoPulse são de
              propriedade exclusiva da Grupo F5 Consultoria. É vedada a reprodução, distribuição
              ou criação de obras derivadas sem autorização prévia por escrito.
            </p>
            <p className="mt-2">
              Os dados inseridos pelo cliente na plataforma pertencem ao próprio cliente.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Limitação de Responsabilidade</h2>
            <p>
              A Grupo F5 Consultoria não se responsabiliza por:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Decisões tomadas com base nas métricas exibidas na plataforma;</li>
              <li>Interrupções temporárias por manutenção ou falhas de terceiros;</li>
              <li>Perda de dados causada por uso indevido das credenciais pelo usuário.</li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Alterações nos Termos</h2>
            <p>
              Estes termos podem ser atualizados a qualquer momento. Alterações relevantes serão
              comunicadas por e-mail com antecedência mínima de 15 dias. O uso continuado após
              esse prazo implica aceitação dos novos termos.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Foro e Legislação</h2>
            <p>
              Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de{" "}
              <strong>São Paulo, SP</strong> para dirimir quaisquer controvérsias decorrentes
              deste contrato.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Contato</h2>
            <p>
              <strong>Grupo F5 Consultoria</strong><br />
              CNPJ: 44.106.618/0001-06<br />
              São Paulo, SP<br />
              E-mail:{" "}
              <a href="mailto:grupof5consultoria@gmail.com" className="text-violet-600 underline">
                grupof5consultoria@gmail.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
