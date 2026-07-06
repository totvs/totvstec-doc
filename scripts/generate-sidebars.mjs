#!/usr/bin/env node
/**
 * Monta sidebars.ts a partir de docs/sidebar.json em cada satélite + repos.config.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadReposConfig, syncedRepos} from './lib/load-repos-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function resolveRepoBase(repo) {
  const envKey = repo.id.toUpperCase().replace(/-/g, '_') + '_PATH';
  if (process.env[envKey]) return path.resolve(process.env[envKey]);
  return path.join(ROOT, repo.sync.submodulePath);
}

function listExemploDocIds(repoBase, sidebarDef) {
  const exemplosDir = path.join(repoBase, 'docs/exemplos');
  if (!fs.existsSync(exemplosDir) || !sidebarDef.exemplos) return [];

  const {docPrefix, exemplos} = sidebarDef;
  const files = fs
    .readdirSync(exemplosDir)
    .filter((f) => f.endsWith('.mdx'))
    .sort((a, b) => {
      if (a === 'index.mdx') return -1;
      if (b === 'index.mdx') return 1;
      return a.localeCompare(b);
    });

  return files.map((f) => {
    const slug = f.replace(/\.mdx$/, '');
    return `${docPrefix}/${exemplos.mountSubpath}/${slug}`;
  });
}

function prefixDocId(docPrefix, id) {
  return id.includes('/') && !id.startsWith(docPrefix) ? `${docPrefix}/${id}` : `${docPrefix}/${id}`;
}

function resolveItems(items, docPrefix) {
  return items.map((item) => {
    if (typeof item === 'string') {
      return prefixDocId(docPrefix, item);
    }
    if (item.type === 'doc') {
      const out = {...item, id: prefixDocId(docPrefix, item.id)};
      return out;
    }
    if (item.type === 'category') {
      return {
        ...item,
        items: resolveItems(item.items, docPrefix),
      };
    }
    return item;
  });
}

function loadModuleSidebar(repo) {
  const base = resolveRepoBase(repo);
  const sidebarPath = path.join(
    base,
    repo.sync.sidebarFile ?? 'docs/sidebar.json',
  );
  if (!fs.existsSync(sidebarPath)) {
    throw new Error(`[generate-sidebars] ${sidebarPath} não encontrado (${repo.id})`);
  }

  const def = JSON.parse(fs.readFileSync(sidebarPath, 'utf8'));
  const items = resolveItems(def.items, def.docPrefix);

  if (def.exemplos) {
    const exemploIds = listExemploDocIds(base, def);
    if (exemploIds.length > 0) {
      items.push({
        type: 'category',
        label: def.exemplos.label,
        key: def.exemplos.key,
        collapsed: true,
        items: exemploIds,
      });
    }
  }

  return {repo, items};
}

function main() {
  const config = loadReposConfig(ROOT);
  const modules = syncedRepos(config)
    .filter((repo) => repo.sidebar)
    .sort((a, b) => (a.sidebar.order ?? 99) - (b.sidebar.order ?? 99))
    .map(loadModuleSidebar);

  const hubGithub = [
    {
      type: 'doc',
      id: 'tlpp/rest/exemplos-praticos',
      label: 'Repositórios GitHub',
      key: 'github-repos-catalog',
    },
  ];

  const restSidebarCategories = modules.map(({repo, items}) => ({
    type: 'category',
    label: repo.sidebar.category,
    collapsed: repo.sidebar.collapsed ?? true,
    key: repo.sidebar.key,
    items,
  }));

  restSidebarCategories.push({
    type: 'category',
    label: 'REPOSITÓRIOS',
    collapsed: true,
    key: 'github-repos',
    items: hubGithub,
  });

  const outPath = path.join(ROOT, 'sidebars.generated.ts');
  const body = `/* eslint-disable */
/* AUTO-GENERATED — npm run generate:sidebars */
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  hubSidebar: ['index', 'ARQUITETURA'],
  restSidebar: ${JSON.stringify(restSidebarCategories, null, 2)},
};

export default sidebars;
`;

  fs.writeFileSync(outPath, body, 'utf8');
  console.log(`[generate-sidebars] ${modules.length} módulos → sidebars.generated.ts`);
}

main();
