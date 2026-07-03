import type {ReactNode} from 'react';

import {
  getExternalRepo,
  githubRepoUrl,
  githubTreeUrl,
} from '@site/src/data/external-repos';

type Props = {
  /** ID do repositório em `repos.config.json` / `external-repos.ts`. */
  id: string;
  /** Texto do link. Padrão: `owner/name`. */
  children?: ReactNode;
  /** Caminho dentro do repositório — abre a árvore em vez da raiz. */
  path?: string;
};

/** Link para repositório GitHub resolvido a partir do catálogo central. */
export default function RepoLink({id, children, path}: Props): ReactNode {
  const repo = getExternalRepo(id);
  const href = path ? githubTreeUrl(repo, path) : githubRepoUrl(repo);
  const label = children ?? `${repo.owner}/${repo.name}`;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}
