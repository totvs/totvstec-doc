#!/usr/bin/env node
/**
 * Checkout genérico dos repositórios satélite no CI (a partir de repos.config.json).
 */
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadReposConfig, syncedRepos} from './lib/load-repos-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function main() {
  const config = loadReposConfig(ROOT);

  for (const repo of syncedRepos(config)) {
    const dest = path.join(ROOT, repo.sync.submodulePath);
    const url = `https://github.com/${repo.owner}/${repo.name}.git`;

    if (fs.existsSync(dest)) {
      fs.rmSync(dest, {recursive: true, force: true});
    }

    console.log(`[ci-checkout] ${repo.owner}/${repo.name}@${repo.branch} → ${repo.sync.submodulePath}`);
    execSync(
      `git clone --depth 1 --branch ${repo.branch} ${url} ${dest}`,
      {stdio: 'inherit', cwd: ROOT},
    );
  }
}

main();
