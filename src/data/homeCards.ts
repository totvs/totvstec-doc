export type HomeCardAccent = 'tlpp' | 'tools' | 'github' | 'rest';

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
};

/**
 * Três seções fixas do hub: Docs | Tools | Github.
 * Textos curtos e estáveis — não listam features (evitam poluição
 * e não precisam mudar quando a documentação cresce).
 */
export const homeCards: HomeCard[] = [
  {
    id: 'tlpp',
    to: '/docs/tlpp/rest',
    accent: 'tlpp',
    titleId: 'home.card.tlpp.title',
    titleDefault: 'DOCS',
    descId: 'home.card.tlpp.desc',
    descDefault: 'REST, Doc Generate e PROBAT.',
    backDescId: 'home.card.tlpp.backDesc',
    backDescDefault:
      'Documentação do REST TLPP, geração OpenAPI e testes com PROBAT.',
  },
  {
    id: 'tools',
    to: '/tools',
    accent: 'tools',
    titleId: 'home.card.tools.title',
    titleDefault: 'TOOLS',
    descId: 'home.card.tools.desc',
    descDefault: 'Ferramentas no navegador.',
    backDescId: 'home.card.tools.backDesc',
    backDescDefault:
      'Utilitários interativos para validar e explorar APIs sem sair do browser.',
  },
  {
    id: 'github',
    to: '/docs/tlpp/rest/exemplos-praticos',
    accent: 'github',
    titleId: 'home.card.github.title',
    titleDefault: 'GITHUB',
    descId: 'home.card.github.desc',
    descDefault: 'Código-fonte e samples.',
    backDescId: 'home.card.github.backDesc',
    backDescDefault:
      'Repositórios oficiais para estudar, clonar e adaptar nos seus projetos.',
  },
];
