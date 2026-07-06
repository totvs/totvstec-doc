/* eslint-disable */
/* AUTO-GENERATED — npm run generate:sidebars */
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  hubSidebar: ['index', 'ARQUITETURA'],
  restSidebar: [
  {
    "type": "category",
    "label": "REST",
    "collapsed": false,
    "key": "rest-module",
    "items": [
      {
        "type": "doc",
        "id": "tlpp/rest/index",
        "label": "Visão geral"
      },
      {
        "type": "category",
        "label": "Começando",
        "collapsed": true,
        "items": [
          "tlpp/rest/primeiros-passos/quickstart",
          "tlpp/rest/primeiros-passos/configuracao",
          "tlpp/rest/primeiros-passos/composicao-url",
          {
            "type": "doc",
            "id": "tlpp/rest/primeiros-passos/avisos-dicas",
            "label": "Avisos e dicas",
            "key": "avisos-comecando",
            "className": "sidebar-avisos-dicas"
          }
        ]
      },
      {
        "type": "category",
        "label": "Servidor e rotas",
        "collapsed": true,
        "items": [
          "tlpp/rest/configuracoes/annotations",
          "tlpp/rest/configuracoes/sem-annotation",
          "tlpp/rest/configuracoes/referencia-ini",
          "tlpp/rest/configuracoes/referencia-json",
          {
            "type": "doc",
            "id": "tlpp/rest/configuracoes/avisos-dicas",
            "label": "Avisos e dicas",
            "key": "avisos-servidor",
            "className": "sidebar-avisos-dicas"
          }
        ]
      },
      {
        "type": "category",
        "label": "oREST",
        "collapsed": true,
        "items": [
          "tlpp/rest/objeto-orest/visao-geral",
          "tlpp/rest/objeto-orest/leitura-requisicao",
          "tlpp/rest/objeto-orest/leitura-resposta",
          "tlpp/rest/objeto-orest/escrita-resposta",
          "tlpp/rest/objeto-orest/cabecalhos-resposta",
          "tlpp/rest/objeto-orest/pool-servidor",
          "tlpp/rest/objeto-orest/utilitarios",
          {
            "type": "doc",
            "id": "tlpp/rest/objeto-orest/avisos-dicas",
            "label": "Avisos e dicas",
            "key": "avisos-orest",
            "className": "sidebar-avisos-dicas"
          }
        ]
      },
      {
        "type": "category",
        "label": "Autenticação",
        "collapsed": true,
        "items": [
          "tlpp/rest/authorization"
        ]
      },
      {
        "type": "category",
        "label": "Callbacks",
        "collapsed": true,
        "items": [
          {
            "type": "doc",
            "id": "tlpp/rest/funcoes-usuario/callbacks",
            "label": "Visão geral",
            "key": "callbacks-overview"
          },
          "tlpp/rest/funcoes-usuario/on-block",
          "tlpp/rest/funcoes-usuario/on-allow",
          "tlpp/rest/funcoes-usuario/on-select",
          "tlpp/rest/funcoes-usuario/on-start",
          "tlpp/rest/funcoes-usuario/on-stop",
          "tlpp/rest/funcoes-usuario/on-send",
          "tlpp/rest/funcoes-usuario/on-error",
          {
            "type": "doc",
            "id": "tlpp/rest/funcoes-usuario/avisos-dicas",
            "label": "Avisos e dicas",
            "key": "avisos-callbacks",
            "className": "sidebar-avisos-dicas"
          }
        ]
      },
      {
        "type": "category",
        "label": "Referência",
        "collapsed": true,
        "items": [
          {
            "type": "doc",
            "id": "tlpp/rest/apis/referencia",
            "label": "Operação do servidor"
          }
        ]
      },
      {
        "type": "category",
        "label": "Exemplos REST",
        "key": "rest-exemplos-repo",
        "collapsed": true,
        "items": [
          "tlpp/rest/exemplos-repositorio/index",
          "tlpp/rest/exemplos-repositorio/apis-admin",
          "tlpp/rest/exemplos-repositorio/authorization",
          "tlpp/rest/exemplos-repositorio/callbacks",
          "tlpp/rest/exemplos-repositorio/configuracoes",
          "tlpp/rest/exemplos-repositorio/orest-cabecalhos-resposta",
          "tlpp/rest/exemplos-repositorio/orest-escrita-resposta",
          "tlpp/rest/exemplos-repositorio/orest-leitura-requisicao",
          "tlpp/rest/exemplos-repositorio/orest-leitura-resposta",
          "tlpp/rest/exemplos-repositorio/orest-pool-servidor",
          "tlpp/rest/exemplos-repositorio/orest-utilitarios",
          "tlpp/rest/exemplos-repositorio/primeiros-passos",
          "tlpp/rest/exemplos-repositorio/verbs-delete",
          "tlpp/rest/exemplos-repositorio/verbs-get",
          "tlpp/rest/exemplos-repositorio/verbs-patch",
          "tlpp/rest/exemplos-repositorio/verbs-post",
          "tlpp/rest/exemplos-repositorio/verbs-put"
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "DOC GENERATE",
    "collapsed": true,
    "key": "doc-generate-module",
    "items": [
      {
        "type": "doc",
        "id": "tlpp/rest/metadados/visao-geral",
        "label": "Introdução",
        "key": "metadados-intro"
      },
      {
        "type": "category",
        "label": "Metadados",
        "collapsed": true,
        "key": "metadados-conceitos",
        "items": [
          "tlpp/rest/metadados/description",
          "tlpp/rest/metadados/rest-annotation",
          "tlpp/rest/metadados/json-documentacao",
          "tlpp/rest/metadados/i18n",
          "tlpp/rest/metadados/componentes",
          {
            "type": "doc",
            "id": "tlpp/rest/metadados/avisos-dicas",
            "label": "Avisos e dicas",
            "key": "avisos-metadados",
            "className": "sidebar-avisos-dicas"
          }
        ]
      },
      {
        "type": "category",
        "label": "Geração OpenAPI",
        "collapsed": true,
        "key": "doc-generate-openapi",
        "items": [
          {
            "type": "doc",
            "id": "tlpp/rest/doc-generate/index",
            "label": "Visão geral",
            "key": "doc-generate-intro"
          },
          "tlpp/rest/doc-generate/list-dinamico",
          "tlpp/rest/doc-generate/openapi",
          "tlpp/rest/doc-generate/mapa-arquivos"
        ]
      },
      {
        "type": "category",
        "label": "Exemplos Doc Generate",
        "key": "doc-generate-exemplos-repo",
        "collapsed": true,
        "items": [
          "tlpp/rest/exemplos-doc-generate/index",
          "tlpp/rest/exemplos-doc-generate/components",
          "tlpp/rest/exemplos-doc-generate/orquestracao",
          "tlpp/rest/exemplos-doc-generate/rest-00_metadados_snippets",
          "tlpp/rest/exemplos-doc-generate/rest-01_traditional_annotation",
          "tlpp/rest/exemplos-doc-generate/rest-02_dictionary_i18n",
          "tlpp/rest/exemplos-doc-generate/rest-03_dedicated_function_doc-advanced",
          "tlpp/rest/exemplos-doc-generate/rest-03_dedicated_function_doc-basic",
          "tlpp/rest/exemplos-doc-generate/rest-04_dynamic_mapping",
          "tlpp/rest/exemplos-doc-generate/rest-generator"
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "PROBAT",
    "collapsed": true,
    "key": "probat-module",
    "items": [
      {
        "type": "doc",
        "id": "tlpp/probat/index",
        "label": "Visão geral",
        "key": "probat-intro"
      },
      {
        "type": "category",
        "label": "Fundamentos",
        "collapsed": true,
        "key": "probat-fundamentos",
        "items": [
          "tlpp/probat/configuracao",
          "tlpp/probat/annotations",
          "tlpp/probat/testes-funcao-classe",
          "tlpp/probat/asserts"
        ]
      },
      {
        "type": "category",
        "label": "Controle de execução",
        "collapsed": true,
        "key": "probat-execucao",
        "items": [
          "tlpp/probat/pulando-testes",
          "tlpp/probat/error-log",
          "tlpp/probat/suites-execucao",
          "tlpp/probat/cobertura",
          "tlpp/probat/execucao-resultados"
        ]
      },
      {
        "type": "category",
        "label": "Cenários práticos",
        "collapsed": true,
        "key": "probat-cenarios",
        "items": [
          "tlpp/probat/testes-api-rest",
          "tlpp/probat/integracao-bd",
          "tlpp/probat/tdd"
        ]
      },
      {
        "type": "doc",
        "id": "tlpp/probat/automacao-scripts",
        "label": "Automação (CI/CD)",
        "key": "probat-automacao"
      },
      {
        "type": "category",
        "label": "Exemplos PROBAT",
        "key": "probat-exemplos-repo",
        "collapsed": true,
        "items": [
          "tlpp/probat/exemplos-repositorio/index",
          "tlpp/probat/exemplos-repositorio/src-api",
          "tlpp/probat/exemplos-repositorio/src-coverage",
          "tlpp/probat/exemplos-repositorio/src-math",
          "tlpp/probat/exemplos-repositorio/src-tdd",
          "tlpp/probat/exemplos-repositorio/src-tlpp",
          "tlpp/probat/exemplos-repositorio/src-utils",
          "tlpp/probat/exemplos-repositorio/test-apartness",
          "tlpp/probat/exemplos-repositorio/test-api",
          "tlpp/probat/exemplos-repositorio/test-config",
          "tlpp/probat/exemplos-repositorio/test-coverage",
          "tlpp/probat/exemplos-repositorio/test-integration",
          "tlpp/probat/exemplos-repositorio/test-probat_resources",
          "tlpp/probat/exemplos-repositorio/test-tdd",
          "tlpp/probat/exemplos-repositorio/test-unit-math",
          "tlpp/probat/exemplos-repositorio/test-unit-prw",
          "tlpp/probat/exemplos-repositorio/test-unit-utils"
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "REPOSITÓRIOS",
    "collapsed": true,
    "key": "github-repos",
    "items": [
      {
        "type": "doc",
        "id": "tlpp/rest/exemplos-praticos",
        "label": "Repositórios GitHub",
        "key": "github-repos-catalog"
      }
    ]
  }
],
};

export default sidebars;
