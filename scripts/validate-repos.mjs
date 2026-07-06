#!/usr/bin/env node
/**
 * Valida que .gitmodules, workflows e repos.config.json estão alinhados.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  loadReposConfig,
  repoSlug,
  siteSlug,
  syncedRepos,
} from './lib/load-repos-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function parseGitmodules(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const entries = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const section = line.match(/^\[submodule "(.+)"\]$/);
    if (section) {
      current = {name: section[1]};
      entries.push(current);
      continue;
    }
    const pathMatch = line.match(/^\s*path\s*=\s*(.+)$/);
    const urlMatch = line.match(/^\s*url\s*=\s*(.+)$/);
    if (current && pathMatch) current.path = pathMatch[1].trim();
    if (current && urlMatch) current.url = urlMatch[1].trim();
  }
  return entries;
}

function fail(message) {
  console.error(`[validate:repos] ${message}`);
  process.exitCode = 1;
}

function main() {
  const config = loadReposConfig(ROOT);
  const gitmodulesPath = path.join(ROOT, '.gitmodules');
  if (!fs.existsSync(gitmodulesPath)) {
    fail('.gitmodules não encontrado');
    return;
  }

  const modules = parseGitmodules(gitmodulesPath);
  const synced = syncedRepos(config);

  for (const repo of synced) {
    const expectedUrl = repo.sync.submoduleUrl;
    const mod = modules.find((entry) => entry.path === repo.sync.submodulePath);
    if (!mod) {
      fail(`Submodule ausente para ${repo.id}: ${repo.sync.submodulePath}`);
      continue;
    }
    if (mod.url !== expectedUrl) {
      fail(
        `${repo.id}: .gitmodules aponta para ${mod.url}, esperado ${expectedUrl}`,
      );
    }
  }

  const deployPath = path.join(ROOT, '.github/workflows/deploy.yml');
  const deploy = fs.readFileSync(deployPath, 'utf8');
  if (!deploy.includes('repos.config.json')) {
    fail('deploy.yml deve referenciar repos.config.json (checkout genérico)');
  }
  if (!deploy.includes('ci-checkout-deps.mjs')) {
    fail('deploy.yml deve usar scripts/ci-checkout-deps.mjs');
  }

  for (const repo of synced) {
    const sidebarRel = repo.sync.sidebarFile ?? 'docs/sidebar.json';
    const sidebarPath = path.join(ROOT, repo.sync.submodulePath, sidebarRel);
    if (!fs.existsSync(sidebarPath)) {
      fail(`sidebar ausente para ${repo.id}: ${sidebarRel}`);
    }

    for (const {from} of repo.sync.mdxSources) {
      const srcPath = path.join(ROOT, repo.sync.submodulePath, from);
      if (!fs.existsSync(srcPath)) {
        fail(`mdxSources ausente para ${repo.id}: ${from}`);
      }
    }
  }

  for (const repo of synced) {
    const ecosystemPath = path.join(ROOT, repo.sync.submodulePath, 'ecosystem.config.json');
    const site = siteSlug(config.site);
    if (!fs.existsSync(ecosystemPath)) {
      fail(`ecosystem.config.json ausente em ${repo.sync.submodulePath} — rode npm run ecosystem:export`);
      continue;
    }
    const ecosystem = JSON.parse(fs.readFileSync(ecosystemPath, 'utf8'));
    if (ecosystem.self.id !== repo.id) {
      fail(`${ecosystemPath}: self.id=${ecosystem.self.id}, esperado ${repo.id}`);
    }
    if (`${ecosystem.site.owner}/${ecosystem.site.name}` !== site) {
      fail(`${ecosystemPath}: site não bate com repos.config.json`);
    }
  }

  if (process.exitCode) {
    console.error('[validate:repos] Falhou — corrija repos.config.json e rode npm run ecosystem:export');
  } else {
    console.log('[validate:repos] OK — catálogo, submodules e ecosystem alinhados');
  }
}

main();
