import type {ReactNode} from 'react';

import {
  EXTERNAL_REPOS,
  githubRepoUrl,
  githubTreeUrl,
  type ExternalRepo,
} from '@site/src/data/external-repos';

import styles from './styles.module.css';

type Props = {
  repos?: ExternalRepo[];
  intro?: string;
};

export default function RepoCatalog({
  repos = EXTERNAL_REPOS,
  intro,
}: Props): ReactNode {
  return (
    <section aria-label="Repositórios referenciados">
      {intro ? <p className={styles.intro}>{intro}</p> : null}
      <div className={styles.repoGrid}>
        {repos.map((repo) => (
          <article key={repo.id} className={styles.card}>
            <header className={styles.header}>
              <h3 className={styles.title}>
                <a href={githubRepoUrl(repo)} target="_blank" rel="noopener noreferrer">
                  {repo.label}
                </a>
              </h3>
              <span className={styles.slug}>
                {repo.owner}/{repo.name}
              </span>
            </header>
            <p className={styles.description}>{repo.description}</p>
            <div className={styles.tags}>
              {repo.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
            {repo.highlights && repo.highlights.length > 0 ? (
              <ul className={styles.highlights}>
                {repo.highlights.map((item) => (
                  <li key={item.path || item.label}>
                    <a
                      href={githubTreeUrl(repo, item.path)}
                      target="_blank"
                      rel="noopener noreferrer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className={styles.actions}>
              <a
                className={styles.button}
                href={githubRepoUrl(repo)}
                target="_blank"
                rel="noopener noreferrer">
                Abrir no GitHub →
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
