#!/usr/bin/env node
/**
 * Sincroniza conteúdo dos repositórios dependentes para o hub Docusaurus.
 * Mapeamentos definidos em repos.config.json → repos[].sync.mdxSources
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {getRepoById, loadReposConfig, syncedRepos} from './lib/load-repos-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/** Arquivos do motor que não devem ser apagados ao sincronizar um destino. */
const PRESERVE_IN_DEST = {
  'docs/tlpp/rest': ['exemplos-praticos.mdx'],
};

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, {recursive: true});
  for (const entry of fs.readdirSync(src, {withFileTypes: true})) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function syncDirectory(src, dest, preserveNames = []) {
  const preserved = [];
  if (fs.existsSync(dest)) {
    for (const name of ['.gitkeep', 'README.md', ...preserveNames]) {
      const p = path.join(dest, name);
      if (fs.existsSync(p)) {
        preserved.push({name, content: fs.readFileSync(p)});
      }
    }
  }
  fs.rmSync(dest, {recursive: true, force: true});
  copyRecursive(src, dest);
  for (const {name, content} of preserved) {
    fs.writeFileSync(path.join(dest, name), content);
  }
}

function resolveRepoBase(repo) {
  const envKey = repo.id.toUpperCase().replace(/-/g, '_') + '_PATH';
  const envOverride = process.env[envKey];
  if (envOverride) {
    return path.resolve(envOverride);
  }
  return path.join(ROOT, repo.sync.submodulePath);
}

function main() {
  const config = loadReposConfig(ROOT);

  for (const repo of syncedRepos(config)) {
    const base = resolveRepoBase(repo);
    if (!fs.existsSync(base)) {
      console.error(`[sync-deps] Repositório ${repo.id} não encontrado: ${base}`);
      console.error('  git submodule update --init --recursive');
      process.exit(1);
    }

    for (const {from, to} of repo.sync.mdxSources) {
      const src = path.join(base, from);
      const dest = path.join(ROOT, to);
      if (!fs.existsSync(src)) {
        console.error(`[sync-deps] Ausente em ${repo.id}: ${src}`);
        process.exit(1);
      }
      syncDirectory(src, dest, PRESERVE_IN_DEST[to] ?? []);
      console.log(`[sync-deps] ${repo.id}: ${from} → ${to}`);
    }
  }
}

main();
