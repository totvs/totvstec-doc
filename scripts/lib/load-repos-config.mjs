#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @returns {import('../../repos.config.json')} */
export function loadReposConfig(root = path.resolve(__dirname, '../..')) {
  const configPath = path.join(root, 'repos.config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`repos.config.json não encontrado em ${root}`);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

export function siteSlug(site = loadReposConfig().site) {
  return `${site.owner}/${site.name}`;
}

export function repoSlug(repo) {
  return `${repo.owner}/${repo.name}`;
}

export function getRepoById(config, id) {
  const repo = config.repos.find((entry) => entry.id === id);
  if (!repo) {
    throw new Error(`Repositório desconhecido em repos.config.json: ${id}`);
  }
  return repo;
}

export function syncedRepos(config) {
  return config.repos.filter((repo) => repo.sync);
}

export function githubRepoUrl(repo) {
  return `https://github.com/${repo.owner}/${repo.name}`;
}

export function siteUrl(site) {
  const base = site.baseUrl.endsWith('/') ? site.baseUrl : `${site.baseUrl}/`;
  return `${site.pagesHost}${base}`;
}
