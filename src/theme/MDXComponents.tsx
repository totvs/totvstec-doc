import MDXComponents from '@theme-original/MDXComponents';

import RepoLink from '@site/src/components/RepoLink';

/**
 * Mapa de componentes do MDX — precisa ser um objeto (tag → componente),
 * não um componente React, senão o mapeamento padrão (CodeBlock,
 * admonitions, links com baseUrl) é descartado silenciosamente.
 */
export default {
  ...MDXComponents,
  RepoLink,
};
