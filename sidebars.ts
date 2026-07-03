import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/** Último item de cada seção — destaque no menu lateral. */
const avisosDicas = (id: string, key: string) => ({
  type: 'doc' as const,
  id,
  label: 'Avisos e dicas',
  key,
  className: 'sidebar-avisos-dicas',
});

/** Hub TDN — referência REST (totvs/tlpp-sample-rest). */
const restHubItems = [
  {
    type: 'doc',
    id: 'tlpp/rest/index',
    label: 'Visão geral',
  },
  {
    type: 'category',
    label: 'Começando',
    collapsed: true,
    items: [
      'tlpp/rest/primeiros-passos/quickstart',
      'tlpp/rest/primeiros-passos/configuracao',
      'tlpp/rest/primeiros-passos/composicao-url',
      avisosDicas('tlpp/rest/primeiros-passos/avisos-dicas', 'avisos-comecando'),
    ],
  },
  {
    type: 'category',
    label: 'Servidor e rotas',
    collapsed: true,
    items: [
      'tlpp/rest/configuracoes/annotations',
      'tlpp/rest/configuracoes/sem-annotation',
      'tlpp/rest/configuracoes/referencia-ini',
      'tlpp/rest/configuracoes/referencia-json',
      avisosDicas('tlpp/rest/configuracoes/avisos-dicas', 'avisos-servidor'),
    ],
  },
  {
    type: 'category',
    label: 'oREST',
    collapsed: true,
    items: [
      'tlpp/rest/objeto-orest/visao-geral',
      'tlpp/rest/objeto-orest/leitura-requisicao',
      'tlpp/rest/objeto-orest/leitura-resposta',
      'tlpp/rest/objeto-orest/escrita-resposta',
      'tlpp/rest/objeto-orest/cabecalhos-resposta',
      'tlpp/rest/objeto-orest/pool-servidor',
      'tlpp/rest/objeto-orest/utilitarios',
      avisosDicas('tlpp/rest/objeto-orest/avisos-dicas', 'avisos-orest'),
    ],
  },
  {
    type: 'category',
    label: 'Autenticação',
    collapsed: true,
    items: ['tlpp/rest/authorization'],
  },
  {
    type: 'category',
    label: 'Callbacks',
    collapsed: true,
    items: [
      {
        type: 'doc',
        id: 'tlpp/rest/funcoes-usuario/callbacks',
        label: 'Visão geral',
        key: 'callbacks-overview',
      },
      'tlpp/rest/funcoes-usuario/on-block',
      'tlpp/rest/funcoes-usuario/on-allow',
      'tlpp/rest/funcoes-usuario/on-select',
      'tlpp/rest/funcoes-usuario/on-start',
      'tlpp/rest/funcoes-usuario/on-stop',
      'tlpp/rest/funcoes-usuario/on-send',
      'tlpp/rest/funcoes-usuario/on-error',
      avisosDicas('tlpp/rest/funcoes-usuario/avisos-dicas', 'avisos-callbacks'),
    ],
  },
  {
    type: 'category',
    label: 'Referência',
    collapsed: true,
    items: [
      {
        type: 'doc',
        id: 'tlpp/rest/apis/referencia',
        label: 'Operação do servidor',
      },
    ],
  },
  {
    type: 'category',
    label: 'Exemplos REST',
    key: 'rest-exemplos-repo',
    collapsed: true,
    items: [
      'tlpp/rest/exemplos-repositorio/index',
      'tlpp/rest/exemplos-repositorio/primeiros-passos',
      'tlpp/rest/exemplos-repositorio/configuracoes',
      'tlpp/rest/exemplos-repositorio/verbs-get',
      'tlpp/rest/exemplos-repositorio/verbs-post',
      'tlpp/rest/exemplos-repositorio/verbs-put',
      'tlpp/rest/exemplos-repositorio/verbs-patch',
      'tlpp/rest/exemplos-repositorio/verbs-delete',
      'tlpp/rest/exemplos-repositorio/orest-leitura-requisicao',
      'tlpp/rest/exemplos-repositorio/orest-leitura-resposta',
      'tlpp/rest/exemplos-repositorio/orest-escrita-resposta',
      'tlpp/rest/exemplos-repositorio/orest-cabecalhos-resposta',
      'tlpp/rest/exemplos-repositorio/orest-pool-servidor',
      'tlpp/rest/exemplos-repositorio/orest-utilitarios',
      'tlpp/rest/exemplos-repositorio/callbacks',
      'tlpp/rest/exemplos-repositorio/authorization',
      'tlpp/rest/exemplos-repositorio/apis-admin',
    ],
  },
] as SidebarsConfig[string];

/** Par conceito + exemplo(s) — submenu colapsado no Doc Generate. */
const metadadosTopico = (
  label: string,
  keyPrefix: string,
  conceito: string,
  exemplos: Array<{id: string; label: string; key: string}>,
) => ({
  type: 'category' as const,
  label,
  key: `metadados-${keyPrefix}`,
  collapsed: true,
  items: [
    {
      type: 'doc' as const,
      id: conceito,
      label: 'Conceito',
      key: `${keyPrefix}-conceito`,
    },
    ...exemplos.map((ex) => ({
      type: 'doc' as const,
      id: ex.id,
      label: ex.label,
      key: ex.key,
    })),
  ],
});

/** totvs/tlpp-sample-rest-documentation — metadados + OpenAPI. */
const docGenerateItems = [
  {
    type: 'doc',
    id: 'tlpp/rest/metadados/visao-geral',
    label: 'Introdução',
    key: 'metadados-intro',
  },
  metadadosTopico('Description', 'description', 'tlpp/rest/metadados/description', [
    {
      id: 'tlpp/rest/metadados/exemplos/basic/description-only',
      label: 'Exemplo',
      key: 'description-exemplo',
    },
  ]),
  metadadosTopico(
    'Annotation REST',
    'annotation',
    'tlpp/rest/metadados/rest-annotation',
    [
      {
        id: 'tlpp/rest/metadados/exemplos/basic/annotation',
        label: 'Exemplo',
        key: 'annotation-exemplo',
      },
    ],
  ),
  metadadosTopico('JSON DOC', 'json-doc', 'tlpp/rest/metadados/json-documentacao', [
    {
      id: 'tlpp/rest/metadados/exemplos/basic/function',
      label: 'Exemplo · função',
      key: 'json-doc-funcao',
    },
    {
      id: 'tlpp/rest/metadados/exemplos/basic/multiline',
      label: 'Exemplo · multiline',
      key: 'json-doc-multiline',
    },
  ]),
  metadadosTopico('I18n', 'i18n', 'tlpp/rest/metadados/i18n', [
    {
      id: 'tlpp/rest/metadados/exemplos/basic/i18n-id',
      label: 'Exemplo',
      key: 'i18n-exemplo',
    },
  ]),
  metadadosTopico('Componentes', 'componentes', 'tlpp/rest/metadados/componentes', [
    {
      id: 'tlpp/rest/metadados/exemplos/completo',
      label: 'Exemplo completo',
      key: 'componentes-completo',
    },
  ]),
  avisosDicas('tlpp/rest/metadados/avisos-dicas', 'avisos-metadados'),
  {
    type: 'category',
    label: 'Geração OpenAPI',
    collapsed: true,
    key: 'doc-generate-openapi',
    items: [
      {
        type: 'doc',
        id: 'tlpp/rest/doc-generate/index',
        label: 'Visão geral',
        key: 'doc-generate-intro',
      },
      metadadosTopico('List dinâmico', 'list-dinamico', 'tlpp/rest/doc-generate/list-dinamico', [
        {
          id: 'tlpp/rest/metadados/exemplos/endpoints-dinamicos',
          label: 'Exemplo · endpoints',
          key: 'list-dinamico-endpoints',
        },
      ]),
      'tlpp/rest/doc-generate/openapi',
      'tlpp/rest/doc-generate/mapa-arquivos',
    ],
  },
] as SidebarsConfig[string];

/** totvs/tlpp-probat-samples — engine de testes PROBAT. */
const probatItems = [
  {
    type: 'doc',
    id: 'tlpp/probat/index',
    label: 'Visão geral',
    key: 'probat-intro',
  },
  {
    type: 'category',
    label: 'Fundamentos',
    collapsed: true,
    key: 'probat-fundamentos',
    items: [
      'tlpp/probat/configuracao',
      'tlpp/probat/annotations',
      'tlpp/probat/testes-funcao-classe',
      'tlpp/probat/asserts',
    ],
  },
  {
    type: 'category',
    label: 'Controle de execução',
    collapsed: true,
    key: 'probat-execucao',
    items: [
      'tlpp/probat/pulando-testes',
      'tlpp/probat/error-log',
      'tlpp/probat/suites-execucao',
      'tlpp/probat/cobertura',
      'tlpp/probat/execucao-resultados',
    ],
  },
  {
    type: 'category',
    label: 'Cenários práticos',
    collapsed: true,
    key: 'probat-cenarios',
    items: [
      'tlpp/probat/testes-api-rest',
      'tlpp/probat/integracao-bd',
      'tlpp/probat/tdd',
    ],
  },
  {
    type: 'doc',
    id: 'tlpp/probat/automacao-scripts',
    label: 'Automação (CI/CD)',
    key: 'probat-automacao',
  },
] as SidebarsConfig[string];

/** Catálogo de repositórios GitHub (página RepoCatalog). */
const githubReposItems = [
  {
    type: 'doc',
    id: 'tlpp/rest/exemplos-praticos',
    label: 'Repositórios GitHub',
    key: 'github-repos-catalog',
  },
] as SidebarsConfig[string];

const sidebars: SidebarsConfig = {
  hubSidebar: ['index'],

  restSidebar: [
    {
      type: 'category',
      label: 'REST',
      collapsed: false,
      items: restHubItems,
    },
    {
      type: 'category',
      label: 'DOC GENERATE',
      collapsed: true,
      items: docGenerateItems,
    },
    {
      type: 'category',
      label: 'PROBAT',
      collapsed: true,
      items: probatItems,
    },
    {
      type: 'category',
      label: 'REPOSITÓRIOS',
      collapsed: true,
      key: 'github-repos',
      items: githubReposItems,
    },
  ],
};

export default sidebars;
