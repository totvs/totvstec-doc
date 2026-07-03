import reposConfig from '../../repos.config.json';

export type RepoHighlight = {
  label: string;
  /** Caminho dentro do repositório (sem barra inicial). */
  path: string;
};

export type ExternalRepo = {
  id: string;
  owner: string;
  name: string;
  branch: string;
  label: string;
  description: string;
  tags: string[];
  /** Prefixo dos exemplos TLPP (ex.: `src`). */
  srcRoot?: string;
  highlights?: RepoHighlight[];
  /** Artefato OpenAPI de demonstração no repositório, se houver. */
  openApiPath?: string;
};

export type SiteConfig = {
  owner: string;
  name: string;
  branch: string;
  pagesHost: string;
  baseUrl: string;
};

/** Repositório dedicado ao site (meta). Derivado de `repos.config.json`. */
export const SITE_GITHUB = {
  owner: reposConfig.site.owner,
  repo: reposConfig.site.name,
  branch: reposConfig.site.branch,
} as const;

export const SITE_CONFIG: SiteConfig = reposConfig.site;

export const EXTERNAL_REPOS: ExternalRepo[] = reposConfig.repos.map(
  ({sync: _sync, notifyHub: _notifyHub, ...repo}) => repo,
);

const repoById = new Map(EXTERNAL_REPOS.map((repo) => [repo.id, repo]));

export function getExternalRepo(id: string): ExternalRepo {
  const repo = repoById.get(id);
  if (!repo) {
    throw new Error(`Repositório externo desconhecido: ${id}`);
  }
  return repo;
}

export function githubRepoUrl(repo: ExternalRepo | string): string {
  const r = typeof repo === 'string' ? getExternalRepo(repo) : repo;
  return `https://github.com/${r.owner}/${r.name}`;
}

export function githubTreeUrl(repo: ExternalRepo | string, subPath = ''): string {
  const r = typeof repo === 'string' ? getExternalRepo(repo) : repo;
  const suffix = subPath ? `/${subPath.replace(/^\//, '')}` : '';
  return `${githubRepoUrl(r)}/tree/${r.branch}${suffix}`;
}

export function githubFileUrl(
  repo: ExternalRepo | string,
  filePath: string,
): string {
  const r = typeof repo === 'string' ? getExternalRepo(repo) : repo;
  const clean = filePath.replace(/^\//, '');
  return `${githubRepoUrl(r)}/blob/${r.branch}/${clean}`;
}

export function githubRawUrl(
  repo: ExternalRepo | string,
  filePath: string,
): string {
  const r = typeof repo === 'string' ? getExternalRepo(repo) : repo;
  const clean = filePath.replace(/^\//, '');
  return `https://raw.githubusercontent.com/${r.owner}/${r.name}/${r.branch}/${clean}`;
}

export function exampleFilePath(
  repo: ExternalRepo | string,
  file: string,
  folder?: string,
): string {
  const r = typeof repo === 'string' ? getExternalRepo(repo) : repo;
  const relative = folder ? `${folder}/${file}` : file;
  return r.srcRoot ? `${r.srcRoot}/${relative}` : relative;
}

export function siteGithubUrl(): string {
  return `https://github.com/${SITE_GITHUB.owner}/${SITE_GITHUB.repo}`;
}

export function siteDeployUrl(): string {
  const base = SITE_CONFIG.baseUrl.endsWith('/')
    ? SITE_CONFIG.baseUrl
    : `${SITE_CONFIG.baseUrl}/`;
  return `${SITE_CONFIG.pagesHost}${base}`;
}
