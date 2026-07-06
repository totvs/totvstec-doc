import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

import reposConfig from './repos.config.json';
import {totvsDark, totvsLight} from './src/prism/totvs-themes';

/** Site e repos — `repos.config.json` (sobrescrevível por env no CI). */
const SITE = reposConfig.site;
const ORG = process.env.DOCUSAURUS_SITE_REPO?.split('/')[0] ?? SITE.owner;
const PROJECT = process.env.DOCUSAURUS_PROJECT_NAME ?? SITE.name;
const BASE_URL = process.env.DOCUSAURUS_BASE_URL ?? SITE.baseUrl;
const PAGES_HOST = process.env.DOCUSAURUS_PAGES_HOST ?? SITE.pagesHost;

const config: Config = {
  title: 'TOTVSTec',
  tagline: 'Documentação, Exemplos e ferramentas',
  favicon: 'img/totvs/totvs-logo.svg',

  future: {
    v4: false,
  },

  url: PAGES_HOST,
  baseUrl: BASE_URL,
  trailingSlash: false,

  organizationName: ORG,
  projectName: PROJECT,

  onBrokenLinks: 'throw',

  // Apenas pt-BR ativo. Traduções futuras: reative en-US em locales e o localeDropdown na navbar.
  // Arquivos em i18n/en-US/ permanecem no repo como base para quando iniciarmos a tradução.
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
    localeConfigs: {
      'pt-BR': {
        label: 'Português',
        direction: 'ltr',
        htmlLang: 'pt-BR',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      require.resolve('@docusaurus/plugin-client-redirects'),
      {
        redirects: [
          {from: '/docs/intro', to: '/docs'},
          {from: '/docs/tlpp/rest-doc', to: '/docs/tlpp/rest/doc-generate'},
          {from: '/docs/tlpp/rest-doc/metadados/visao-geral', to: '/docs/tlpp/rest/metadados/visao-geral'},
          {from: '/docs/tlpp/rest-doc/metadados/description', to: '/docs/tlpp/rest/metadados/description'},
          {from: '/docs/tlpp/rest-doc/metadados/rest-annotation', to: '/docs/tlpp/rest/metadados/rest-annotation'},
          {from: '/docs/tlpp/rest-doc/metadados/json-documentacao', to: '/docs/tlpp/rest/metadados/json-documentacao'},
          {from: '/docs/tlpp/rest-doc/metadados/i18n', to: '/docs/tlpp/rest/metadados/i18n'},
          {from: '/docs/tlpp/rest-doc/metadados/componentes', to: '/docs/tlpp/rest/metadados/componentes'},
          {from: '/docs/tlpp/rest-doc/metadados/list-dinamico', to: '/docs/tlpp/rest/doc-generate/list-dinamico'},
          {from: '/docs/tlpp/rest-doc/metadados/generate', to: '/docs/tlpp/rest/doc-generate'},
          {from: '/docs/tlpp/rest-doc/exemplos/completo', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-03_dedicated_function_doc-advanced'},
          {from: '/docs/tlpp/rest-doc/exemplos/endpoints-dinamicos', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-04_dynamic_mapping'},
          {from: '/docs/tlpp/rest-doc/exemplos/basic/description-only', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-01_traditional_annotation'},
          {from: '/docs/tlpp/rest-doc/exemplos/basic/annotation', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-01_traditional_annotation'},
          {from: '/docs/tlpp/rest-doc/exemplos/basic/i18n-id', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-02_dictionary_i18n'},
          {from: '/docs/tlpp/rest-doc/exemplos/basic/function', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-03_dedicated_function_doc-basic'},
          {from: '/docs/tlpp/rest-doc/exemplos/basic/multiline', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-03_dedicated_function_doc-basic'},
          {from: '/docs/tlpp/rest-doc/referencia/mapa-arquivos', to: '/docs/tlpp/rest/doc-generate/mapa-arquivos'},
          {from: '/docs/tlpp/rest-doc/referencia/openapi', to: '/docs/tlpp/rest/doc-generate/openapi'},
          {from: '/docs/metadados/visao-geral', to: '/docs/tlpp/rest/metadados/visao-geral'},
          {from: '/docs/metadados/description', to: '/docs/tlpp/rest/metadados/description'},
          {from: '/docs/metadados/rest-annotation', to: '/docs/tlpp/rest/metadados/rest-annotation'},
          {from: '/docs/metadados/json-documentacao', to: '/docs/tlpp/rest/metadados/json-documentacao'},
          {from: '/docs/metadados/i18n', to: '/docs/tlpp/rest/metadados/i18n'},
          {from: '/docs/metadados/componentes', to: '/docs/tlpp/rest/metadados/componentes'},
          {from: '/docs/metadados/list-dinamico', to: '/docs/tlpp/rest/doc-generate/list-dinamico'},
          {from: '/docs/metadados/generate', to: '/docs/tlpp/rest/doc-generate'},
          {from: '/docs/exemplos/completo', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-03_dedicated_function_doc-advanced'},
          {from: '/docs/exemplos/endpoints-dinamicos', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-04_dynamic_mapping'},
          {from: '/docs/exemplos/basic/description-only', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-01_traditional_annotation'},
          {from: '/docs/exemplos/basic/annotation', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-01_traditional_annotation'},
          {from: '/docs/exemplos/basic/i18n-id', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-02_dictionary_i18n'},
          {from: '/docs/exemplos/basic/function', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-03_dedicated_function_doc-basic'},
          {from: '/docs/exemplos/basic/multiline', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-03_dedicated_function_doc-basic'},
          {from: '/docs/tlpp/rest/metadados/exemplos/completo', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-03_dedicated_function_doc-advanced'},
          {from: '/docs/tlpp/rest/metadados/exemplos/endpoints-dinamicos', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-04_dynamic_mapping'},
          {from: '/docs/tlpp/rest/metadados/exemplos/basic/description-only', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-01_traditional_annotation'},
          {from: '/docs/tlpp/rest/metadados/exemplos/basic/annotation', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-01_traditional_annotation'},
          {from: '/docs/tlpp/rest/metadados/exemplos/basic/i18n-id', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-02_dictionary_i18n'},
          {from: '/docs/tlpp/rest/metadados/exemplos/basic/function', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-03_dedicated_function_doc-basic'},
          {from: '/docs/tlpp/rest/metadados/exemplos/basic/multiline', to: '/docs/tlpp/rest/exemplos-doc-generate/rest-03_dedicated_function_doc-basic'},
          {from: '/docs/referencia/mapa-arquivos', to: '/docs/tlpp/rest/doc-generate/mapa-arquivos'},
          {from: '/docs/referencia/openapi', to: '/docs/tlpp/rest/doc-generate/openapi'},
          {from: '/docs/tlpp/rest/metadados/generate', to: '/docs/tlpp/rest/doc-generate'},
          {from: '/docs/tlpp/rest/metadados/list-dinamico', to: '/docs/tlpp/rest/doc-generate/list-dinamico'},
          {from: '/docs/tlpp/rest/metadados/referencia/mapa-arquivos', to: '/docs/tlpp/rest/doc-generate/mapa-arquivos'},
          {from: '/docs/tlpp/rest/metadados/referencia/openapi', to: '/docs/tlpp/rest/doc-generate/openapi'},
          {from: '/visualizador', to: '/tools/explorador-openapi'},
          {from: '/docs/tlpp/rest/avisos-importantes', to: '/docs/tlpp/rest/configuracoes/avisos-dicas'},
          {from: '/docs/tlpp/rest/objeto-orest/requisicao-resposta', to: '/docs/tlpp/rest/objeto-orest/leitura-requisicao'},
          {from: '/docs/tlpp/rest/objeto-orest/referencia-api', to: '/docs/tlpp/rest/objeto-orest/visao-geral'},
        ],
      },
    ],
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['pt'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/totvs/tlpp-logo.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      title: undefined,
      style: 'dark',
      logo: {
        alt: 'TOTVS',
        src: 'img/totvs/totvs-logo-white.svg',
        srcDark: 'img/totvs/totvs-logo-white.svg',
        href: '/',
        target: '_self',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'restSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/tools',
          label: 'Tools',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'TOTVS',
          items: [
            {
              label: 'TOTVS',
              href: 'https://www.totvs.com/',
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            {
              label: 'TOTVS Developers',
              href: 'https://developers.totvs.com/',
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} TOTVS S.A. Todos os direitos reservados.`,
    },
    prism: {
      theme: totvsLight,
      darkTheme: totvsDark,
      additionalLanguages: ['bash', 'ini', 'java', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
