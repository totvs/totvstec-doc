#!/usr/bin/env node
/**
 * Falha se arquivos de contexto/IA pessoal estiverem rastreados ou presentes sem .gitignore.
 */
import fs from 'node:fs';
import path from 'node:path';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/** Paths relativos que nunca devem ir ao remoto TOTVS. */
const FORBIDDEN_RELATIVE = [
  '.cursor',
  '.cursorignore',
  '.cursorrules',
  'AGENTS.md',
  'CLAUDE.md',
  'MIGRATION.md',
  'repos.config.totvs.example.json',
  'content-import',
  'scripts/prepare-standalone-repo.mjs',
  '.tmp-fonte-totvs',
  '.tmp-Fonte-TOTVS.zip',
];

const FORBIDDEN_GLOBS = ['**/.cursor/**', '**/*.mdc'];

const FORBIDDEN_CONTENT = [
  {label: 'conta pessoal GitHub', pattern: /Victor23HD/gi},
  {label: 'repo pessoal hub', pattern: /totvstec-hub/gi},
  {label: 'referência a rules Cursor', pattern: /\.cursor\/rules/gi},
];

function fail(message) {
  console.error(`[audit:remote] ${message}`);
  process.exitCode = 1;
}

function gitTrackedFiles() {
  try {
    const out = execSync('git ls-files -z', {cwd: ROOT, encoding: 'utf8'});
    return out.split('\0').filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeRel(filePath) {
  return filePath.replace(/\\/g, '/');
}

function isForbiddenPath(rel) {
  const normalized = normalizeRel(rel);
  for (const forbidden of FORBIDDEN_RELATIVE) {
    const f = normalizeRel(forbidden);
    if (normalized === f || normalized.startsWith(`${f}/`)) {
      return true;
    }
  }
  if (normalized.endsWith('.mdc')) return true;
  if (normalized.includes('/.cursor/')) return true;
  return false;
}

function readGitignore() {
  const gitignorePath = path.join(ROOT, '.gitignore');
  if (!fs.existsSync(gitignorePath)) return '';
  return fs.readFileSync(gitignorePath, 'utf8');
}

function gitignoreCovers(rel, gitignoreText) {
  const normalized = normalizeRel(rel);
  const lines = gitignoreText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  for (const line of lines) {
    const pattern = line.replace(/^\//, '');
    if (pattern.endsWith('/')) {
      if (normalized.startsWith(pattern) || normalized === pattern.slice(0, -1)) {
        return true;
      }
    } else if (pattern.includes('*')) {
      const regex = new RegExp(
        `^${pattern.replace(/\./g, '\\.').replace(/\*\*/g, '§§').replace(/\*/g, '[^/]*').replace(/§§/g, '.*')}$`,
      );
      if (regex.test(normalized)) return true;
    } else if (normalized === pattern || normalized.startsWith(`${pattern}/`)) {
      return true;
    }
  }
  return false;
}

function scanTrackedContent(tracked) {
  const skipSelf = new Set(['scripts/audit-remote-safe.mjs']);

  for (const rel of tracked) {
    if (isForbiddenPath(rel)) continue;
    if (skipSelf.has(normalizeRel(rel))) continue;
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) continue;
    if (!/\.(md|mdx|json|ts|tsx|mjs|yml|yaml|gitkeep)$/i.test(rel)) continue;

    const text = fs.readFileSync(abs, 'utf8');
    for (const {label, pattern} of FORBIDDEN_CONTENT) {
      if (pattern.test(text)) {
        fail(`Conteúdo proibido (${label}) em arquivo rastreado: ${rel}`);
        pattern.lastIndex = 0;
      }
    }
  }
}

function main() {
  const tracked = gitTrackedFiles();
  const gitignoreText = readGitignore();
  let ok = true;

  for (const rel of tracked) {
    if (isForbiddenPath(rel)) {
      fail(`Arquivo rastreado pelo Git que não pode ir ao remoto: ${rel}`);
      ok = false;
    }
  }

  for (const forbidden of FORBIDDEN_RELATIVE) {
    const abs = path.join(ROOT, forbidden);
    if (!fs.existsSync(abs)) continue;
    if (!gitignoreCovers(forbidden, gitignoreText)) {
      fail(`Existe localmente mas não está no .gitignore: ${forbidden}`);
      ok = false;
    }
  }

  if (tracked.length) {
    scanTrackedContent(tracked);
  }

  if (process.exitCode) {
    console.error('[audit:remote] Corrija antes de push. Contexto local: Documentos/Github/totvstec-doc-context');
  } else if (ok) {
    console.log('[audit:remote] OK — nada de contexto/IA pessoal rastreado pelo Git');
  }
}

main();
