export type HomeCardAccent = 'rest' | 'docGenerate' | 'github' | 'tools';

export type HomeCardHighlight = {
  id: string;
  defaultMessage: string;
};

export type HomeCard = {
  id: string;
  to: string;
  accent: HomeCardAccent;
  titleId: string;
  titleDefault: string;
  descId: string;
  descDefault: string;
  backDescId: string;
  backDescDefault: string;
  highlights: HomeCardHighlight[];
};

/** Uma entrada por seção principal do hub. */
export const homeCards: HomeCard[] = [
  {
    id: 'rest',
    to: '/docs/tlpp/rest',
    accent: 'rest',
    titleId: 'home.card.rest.title',
    titleDefault: 'REST',
    descId: 'home.card.rest.desc',
    descDefault:
      'Servidor, rotas, oREST, autenticação, callbacks e exemplos no AppServer.',
    backDescId: 'home.card.rest.backDesc',
    backDescDefault:
      'Documentação completa da API REST nativa do tlppCore — da configuração do servidor até exemplos prontos para produção.',
    highlights: [
      {
        id: 'home.card.rest.highlight1',
        defaultMessage: 'Trilha guiada do básico ao avançado',
      },
      {
        id: 'home.card.rest.highlight2',
        defaultMessage: 'oREST, rotas, callbacks e autenticação',
      },
      {
        id: 'home.card.rest.highlight3',
        defaultMessage: 'Exemplos reais no AppServer',
      },
    ],
  },
  {
    id: 'doc-generate',
    to: '/docs/tlpp/rest/metadados/visao-geral',
    accent: 'docGenerate',
    titleId: 'home.card.docGenerate.title',
    titleDefault: 'DOC GENERATE',
    descId: 'home.card.docGenerate.desc',
    descDefault:
      'Metadados no código, tlpp.doc.generate() e geração do OpenAPI.',
    backDescId: 'home.card.docGenerate.backDesc',
    backDescDefault:
      'Aprenda a documentar APIs direto no código TLPP e gerar especificações OpenAPI automaticamente.',
    highlights: [
      {
        id: 'home.card.docGenerate.highlight1',
        defaultMessage: 'Annotations e descrições no código',
      },
      {
        id: 'home.card.docGenerate.highlight2',
        defaultMessage: 'tlpp.doc.generate() e pipeline OpenAPI',
      },
      {
        id: 'home.card.docGenerate.highlight3',
        defaultMessage: 'Metadados, i18n e componentes',
      },
    ],
  },
  {
    id: 'github',
    to: '/docs/tlpp/rest/exemplos-praticos',
    accent: 'github',
    titleId: 'home.card.github.title',
    titleDefault: 'GITHUB',
    descId: 'home.card.github.desc',
    descDefault:
      'Repositórios com código TLPP de REST, metadados e projetos relacionados.',
    backDescId: 'home.card.github.backDesc',
    backDescDefault:
      'Código-fonte aberto para estudar, clonar e adaptar nos seus projetos TLPP.',
    highlights: [
      {
        id: 'home.card.github.highlight1',
        defaultMessage: 'Samples oficiais de REST e metadados',
      },
      {
        id: 'home.card.github.highlight2',
        defaultMessage: 'Projetos do ecossistema TOTVS',
      },
      {
        id: 'home.card.github.highlight3',
        defaultMessage: 'Pronto para fork e customização',
      },
    ],
  },
  {
    id: 'tools',
    to: '/tools',
    accent: 'tools',
    titleId: 'home.card.tools.title',
    titleDefault: 'TOOLS',
    descId: 'home.card.tools.desc',
    descDefault:
      'Ferramentas no navegador — explorador OpenAPI e utilitários para TLPP.',
    backDescId: 'home.card.tools.backDesc',
    backDescDefault:
      'Utilitários interativos para acelerar o desenvolvimento e validar suas APIs sem sair do navegador.',
    highlights: [
      {
        id: 'home.card.tools.highlight1',
        defaultMessage: 'Explorador OpenAPI interativo',
      },
      {
        id: 'home.card.tools.highlight2',
        defaultMessage: 'Utilitários para desenvolvimento TLPP',
      },
      {
        id: 'home.card.tools.highlight3',
        defaultMessage: 'Sem instalação — direto no browser',
      },
    ],
  },
];
