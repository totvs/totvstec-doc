import type {ReactNode} from 'react';

import {
  exampleFilePath,
  getExternalRepo,
  githubFileUrl,
  githubRepoUrl,
  type ExternalRepo,
} from '@site/src/data/external-repos';

type Props = {
  file: string;
  path?: string;
  /** ID do repositório em `external-repos.ts`. Padrão: doc-generate */
  repo?: string;
};

export default function ExemploRef({
  file,
  path,
  repo = 'doc-generate',
}: Props): ReactNode {
  const repoDef = getExternalRepo(repo);
  const fullPath = exampleFilePath(repoDef, file, path);
  const fileUrl = githubFileUrl(repoDef, fullPath);
  const repoUrl = githubRepoUrl(repoDef);

  return (
    <div className="exemplo-ref">
      <span className="exemplo-ref__label">Exemplo no GitHub</span>
      <p className="exemplo-ref__body">
        <a href={repoUrl} target="_blank" rel="noopener noreferrer">
          <code>
            {repoDef.owner}/{repoDef.name}
          </code>
        </a>
        {' — '}
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <code>{fullPath}</code>
        </a>
      </p>
    </div>
  );
}

export type {ExternalRepo};
