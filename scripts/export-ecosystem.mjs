#!/usr/bin/env node
/**
 * Exporta ecosystem.config.json para cada repositório dependente (submodule).
 * Rode após alterar repos.config.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  getRepoById,
  loadReposConfig,
  repoSlug,
  syncedRepos,
} from './lib/load-repos-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function siblingRepos(config, selfId) {
  const siblings = {};
  for (const repo of config.repos) {
    if (repo.id === selfId) continue;
    siblings[repo.id] = {
      owner: repo.owner,
      name: repo.name,
      branch: repo.branch,
      slug: repoSlug(repo),
    };
  }
  return siblings;
}

function main() {
  const config = loadReposConfig(ROOT);

  for (const repo of syncedRepos(config)) {
    const targetDir = path.join(ROOT, repo.sync.submodulePath);
    if (!fs.existsSync(targetDir)) {
      console.warn(`[ecosystem:export] Pulando ${repo.id}: ${targetDir} não existe`);
      continue;
    }

    const payload = {
      self: {
        id: repo.id,
        owner: repo.owner,
        name: repo.name,
        branch: repo.branch,
        slug: repoSlug(repo),
      },
      site: {
        owner: config.site.owner,
        name: config.site.name,
        branch: config.site.branch,
        slug: `${config.site.owner}/${config.site.name}`,
        pagesHost: config.site.pagesHost,
        baseUrl: config.site.baseUrl,
      },
      notifyHub: repo.notifyHub,
      siblings: siblingRepos(config, repo.id),
    };

    const outPath = path.join(targetDir, 'ecosystem.config.json');
    fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.log(`[ecosystem:export] ${repo.id} → ${outPath}`);
  }

  console.log('[ecosystem:export] Concluído. Commite ecosystem.config.json em cada repo dependente.');
}

main();
