export const metadata = {
  title: "Política de Privacidade | OdontoPulse by Grupo F5",
  description: "Política de Privacidade da plataforma OdontoPulse, desenvolvida pela Grupo F5 Consultoria.",
};

export default function PrivacidadePage() {
  const updated = "08 de abril de 2026";

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
          <p className="text-sm text-gray-500">Última atualização: {updated}</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">

          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Quem somos</h2>
            <p>
              Esta política se aplica à plataforma <strong>OdontoPulse</strong>, desenvolvida e operada pela
              <strong> Grupo F5 Consultoria</strong>, inscrita no CNPJ <strong>44.106.618/0001-06</strong>,
              com sede na cidade de <strong>São Paulo, SP</strong>.
            </p>
            <p className="mt-2">
              Para dúvidas sobre privacidade, entre em contato pelo e-mail:{" "}
              <a href="mailto:grupof5consultoria@gmail.com" className="text-violet-600 underline">
                grupof5consultoria@gmail.com
              </a>
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Quais dados coletamos</h2>
            <p>Coletamos as seguintes categorias de dados:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Dados de identificação:</strong> nome, e-mail, telefone e documento (CPF/CNPJ) dos usuários cadastrados.</li>
              <li><strong>Dados de acesso:</strong> endereço IP, navegador e data/hora de acesso à plataforma.</li>
              <li><strong>Dados de campanhas publicitárias:</strong> métricas de anúncios provenientes de plataformas como Meta Ads e Google Ads, mediante autorização expressa do titular.</li>
              <li><strong>Dados financeiros:</strong> informações sobre cobranças e contratos, sem armazenamento de dados de cartão de crédito.</li>
              <li><strong>Dados operacionais:</strong> registros de atendimentos, tarefas e anotações inseridos pelos usuários da plataforma.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Como usamos os dados</h2>
            <p>Os dados coletados são utilizados exclusivamente para:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Fornecimento e operação da plataforma OdontoPulse;</li>
              <li>Autenticação e controle de acesso dos usuários;</li>
              <li>Geração de relatórios e métricas de desempenho;</li>
              <li>Comunicação sobre o serviço contratado;</li>
              <li>Cumprimento de obrigações legais e regulatórias.</li>
            </ul>
            <p className="mt-2">
              Não utilizamos os dados para fins publicitários próprios nem os vendemos a terceiros.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Integração com plataformas de terceiros</h2>
            <p>
              A plataforma pode se integrar ao <strong>Meta Ads (Facebook/Instagram)</strong> e ao{" "}
              <strong>Google Ads</strong> mediante autorização explícita do usuário via fluxo OAuth.
              Os dados obtidos dessas integrações são usados exclusivamente para exibição de métricas
              dentro da plataforma e nunca compartilhados com terceiros.
            </p>
            <p className="mt-2">
              O usuário pode revogar essas autorizações a qualquer momento nas configurações da sua
              conta Meta ou Google.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Compartilhamento de dados</h2>
            <p>Os dados poderão ser compartilhados apenas com:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Provedores de infraestrutura:</strong> Vercel (hospedagem) e Neon (banco de dados), que operam sob suas próprias políticas de privacidade;</li>
              <li><strong>Autoridades competentes:</strong> quando exigido por lei ou ordem judicial.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Segurança dos dados</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não
              autorizado, perda ou destruição, incluindo:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Transmissão criptografada via HTTPS/TLS;</li>
              <li>Banco de dados com criptografia em repouso;</li>
              <li>Controle de acesso por função (RBAC);</li>
              <li>Tokens de acesso armazenados de forma segura, nunca expostos no código-fonte.</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Retenção de dados</h2>
            <p>
              Os dados são mantidos pelo período em que o contrato de uso da plataforma estiver ativo.
              Após o encerramento, os dados são retidos por até <strong>90 dias</strong> para fins de
              backup e, em seguida, excluídos permanentemente, salvo obrigação legal em contrário.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Direitos do titular (LGPD)</h2>
            <p>Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Confirmar a existência de tratamento dos seus dados;</li>
              <li>Acessar os dados que possuímos sobre você;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Revogar o consentimento a qualquer momento;</li>
              <li>Solicitar a portabilidade dos dados.</li>
            </ul>
            <p className="mt-2">
              Para exercer esses direitos, entre em contato pelo e-mail:{" "}
              <a href="mailto:grupof5consultoria@gmail.com" className="text-violet-600 underline">
                grupof5consultoria@gmail.com
              </a>
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Cookies</h2>
            <p>
              A plataforma utiliza cookies essenciais para autenticação e funcionamento da sessão do
              usuário. Não utilizamos cookies de rastreamento ou publicidade comportamental.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Alterações nesta política</h2>
            <p>
              Esta política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas
              por e-mail ou por aviso na plataforma. O uso continuado após a notificação implica
              aceitação das alterações.
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
