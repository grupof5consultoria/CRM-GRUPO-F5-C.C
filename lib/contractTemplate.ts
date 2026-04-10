// ─── F5 Contract Template ─────────────────────────────────────────────────────
// Variables: {{PLANO}}, {{NOME_CONTRATANTE}}, {{ENDERECO_CONTRATANTE}},
//            {{CIDADE_ESTADO_CEP}}, {{CPF_CONTRATANTE}}, {{MESES}},
//            {{MESES_EXTENSO}}, {{VALOR_MENSAL}}, {{VALOR_EXTENSO}},
//            {{DIA_VENCIMENTO}}, {{PUBLICO_ALVO}}

const MESES_EXTENSO: Record<number, string> = {
  1: "um", 2: "dois", 3: "três", 4: "quatro", 5: "cinco", 6: "seis",
  7: "sete", 8: "oito", 9: "nove", 10: "dez", 11: "onze", 12: "doze",
};

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

export interface ContractVars {
  plano: string;
  nomeContratante: string;
  enderecoContratante: string;
  cidadeEstadoCep: string;
  cpfContratante: string;
  meses: number;
  valorMensal: number;   // numeric (e.g. 1800)
  valorMensalExtenso: string; // e.g. "Mil e oitocentos reais"
  diaVencimento: number;
  publicoAlvo: string;
}

export function renderContract(v: ContractVars): string {
  return `TERMOS DE CONTRATO DE PRESTAÇÃO DE SERVIÇOS

As partes a seguir identificadas, têm, entre si, justas e contratadas a prestação de serviços de assessoria de marketing digital, denominada de TRÁFEGO PAGO - ${v.plano}, que se regerá pelas cláusulas e condições constantes do presente instrumento.

De um lado, GRUPO F5 - CONSULTORIA DE MARKETING EMPRESARIAL, domiciliada neste Município e Comarca de São Paulo, onde mantém sua sede Rua Maria Luísa Reis Monteiro dos Santos, nº 174, inscrita sob o CNPJ nº 44.106.618/0001-06, doravante designada simplesmente CONTRATADA.

De outro, ${v.nomeContratante}, domiciliado(a) neste Município e Comarca de São Paulo, onde mantém sua sede ${v.enderecoContratante}, ${v.cidadeEstadoCep}, inscrito(a) no CPF sob o nº ${v.cpfContratante}, doravante designado(a) simplesmente CONTRATANTE.


1 — OBJETO DO CONTRATO

1.1 O serviço será executado de acordo com o material informativo colocado à disposição da CONTRATADA pela CONTRATANTE, incluindo a orientação sobre as funções básicas e os relacionamentos operacionais requeridos, bem como as fotos/imagens e conteúdo editorial, exceto no(s) caso(s) em que a GRUPO F5 - CONSULTORIA DE MARKETING EMPRESARIAL tenha sido contratada para estes serviços também. Sendo vedada a interferência de terceiros.

1.2 A CONTRATADA se compromete a prestar serviços de assessoria em marketing digital conforme descritos a seguir, com base no método denominado "MÉTODO F5 - ${v.plano}", compreendendo:

• Elaboração de campanhas;
• Gestão de tráfego pago (META ADS);
• Criação de copywriting (textos persuasivos);
• Elaboração de relatórios e análises de desempenho;
• Implementação de CRM (De acordo com o orçamento do cliente);
• Análise de atendimento;
• Rastreamento e rastreamento de dados;
• Landing page.


2 — VIGÊNCIA E RENOVAÇÃO DO CONTRATO

2.1 O presente contrato terá duração de ${v.meses} (${MESES_EXTENSO[v.meses] ?? v.meses}) meses, iniciando-se na data de sua assinatura, sendo o primeiro mês feito e exclusivo para posicionamento.

2.2 O contrato poderá ser renovado por acordo entre as partes, mediante proposta da CONTRATADA, com base nos resultados alcançados.

2.3 O atraso no pagamento implica em multa de 2,00% sobre o valor da mensalidade vencida.

2.4 Ferramentas como SITE e CRM são de responsabilidade da CONTRATADA, tendo como objetivo melhorar a performance do CONTRATANTE, não havendo qualquer pagamento pelo uso do site durante a vigência do contrato.

2.5 Em caso de distrato, e tendo o CONTRATANTE interesse em permanecer com o site, o CONTRATANTE se obriga a transferi-lo para a CONTRATADA, mediante o pagamento da importância de R$ 1.500,00 (mil e quinhentos reais), ficando a CONTRATADA obrigada a fornecer ao CONTRATANTE todos os arquivos para a importação futura.

2.6 Após o período de ${v.meses} meses, a CONTRATANTE receberá uma proposta, de acordo com o resultado gerado pelo método, visando a longevidade do processo.


3 — INFORMAÇÕES DO CLIENTE

3.1 Garantimos que nenhuma informação como senhas e dados do cliente serão divulgados.

3.2 Todo material será enviado para aprovação antes da divulgação do mesmo.


4 — CANCELAMENTO E RESCISÃO

4.1 O contrato poderá ser rescindido por qualquer das partes, mediante notificação com antecedência de 15 (quinze) dias.

4.2 Caso o CONTRATANTE deseje rescindir o contrato antes do prazo final, incidirá multa de 50% sobre o valor restante do contrato.

4.3 Em caso de inadimplência superior a 30 dias, os serviços serão automaticamente suspensos.

4.4 Não haverá aplicação de multa caso a rescisão seja motivada por não entrega de resultados ou descumprimento contratual pela CONTRATADA.


5 — DAS RESPONSABILIDADES DAS PARTES

5.1 Cabe à parte CONTRATADA:

5.2 Realizar e cumprir o(s) serviço(s) solicitado(s) pelo CONTRATANTE.

5.3 Garantir a realização integral do(s) serviço(s) contratado(s) pelo CONTRATANTE.

5.4 Efetuar a qualquer tempo a correção de qualquer conteúdo ou material DE ANÚNCIO criado pela CONTRATADA à CONTRATANTE.

5.5 Reserva-se à parte CONTRATADA o direito de apagar da conta da CONTRATANTE qualquer arquivo, como os citados no item, sem nenhum aviso prévio.

5.6 Engendrar todos os esforços na captação de LEADS qualificados e de acordo com o perfil traçado pelo CONTRATANTE para o público alvo: ${v.publicoAlvo}.

5.7 A responsabilidade por anúncios e estratégias, especialmente no caso de sanções éticas ou judiciais.

5.8 Zelar pela imagem da clínica CONTRATANTE, responsabilizando-se por danos causados à imagem da clínica.

5.9 Não se utilizar da base de clientes da CONTRATANTE para campanhas futuras próprias ou de concorrentes.

5.10 Prestar contas ao CONTRATANTE dos resultados obtidos.

5.11 Cabe à parte CONTRATANTE:

5.11.1 A total responsabilização pela má utilização do serviço.

5.11.2 Manter, se assim desejar, cópia dos arquivos do material DE ANÚNCIO desenvolvido pela CONTRATADA.

5.11.3 Responsabilizar-se pelo uso e distribuição da senha de acesso à(s) sua(s) conta(s).

5.11.4 Não incluir imagens, vídeos e demais conteúdos pornográficos ou para finalidades ilegais no Brasil e em qualquer outro país.

5.11.5 Colocar à disposição da CONTRATADA material informativo que possibilita a execução do(s) serviço(s) contratado(s).


6 — DO PRAZO DE ENTREGA DOS SERVIÇOS

O(s) serviço(s) será(ão) realizado(s) após o envio do CONTRATO (assinado), e o aceite dos termos deste instrumento, bem como do material informativo necessário para a realização do(s) serviço(s) contratado(s).

6.1 Os serviços serão realizados de forma permanente enquanto durar o tempo de vigência do contrato, conforme cláusula segunda.


7 — DA PROPRIEDADE INTELECTUAL E TRANSFERÊNCIA

O(s) serviço(s) desenvolvido(s) pela CONTRATADA ao CONTRATANTE são de exclusiva propriedade desta última.


8 — DOS VALORES DOS SERVIÇOS

A CONTRATANTE pagará à CONTRATADA pelos serviços objeto do presente contrato, a importância de ${fmtBRL(v.valorMensal)} (${v.valorMensalExtenso}), todo dia ${v.diaVencimento} de cada mês, mediante transferência eletrônica via chave PIX nº 502.786.368-37 (CPF), após o primeiro pagamento, a cobrança será feita automaticamente via ASAAS em nome de Bruno Alves Nascimento.


9 — CONFIDENCIALIDADE

A CONTRATADA compromete-se a manter absoluto sigilo sobre todas as informações, materiais, senhas, dados de pacientes ou estratégias fornecidas pelo CONTRATANTE, mesmo após o término do contrato.


10 — DO FORO

Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer dúvidas ou controvérsias oriundas do presente contrato.


___________________________________          ___________________________________
CONTRATADA                                   CONTRATANTE
GRUPO F5 - CONSULTORIA DE                   ${v.nomeContratante}
MARKETING EMPRESARIAL                        CPF: ${v.cpfContratante}
CNPJ: 44.106.618/0001-06`;
}
