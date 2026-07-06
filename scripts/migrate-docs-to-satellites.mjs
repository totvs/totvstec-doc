#!/usr/bin/env node
/**
 * One-shot: copia MDX conceitual do hub para repositórios satélite.
 * Rode uma vez antes de remover os fontes do hub.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, {recursive: true});
  for (const ent of fs.readdirSync(src, {withFileTypes: true})) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

function copyHubRestConceito() {
  const hubRest = path.join(ROOT, 'docs/tlpp/rest');
  const dest = path.join(ROOT, 'deps/tlpp-sample-rest/docs/conceito');
  const skip = new Set([
    'exemplos-repositorio',
    'exemplos-doc-generate',
    'metadados',
    'doc-generate',
  ]);
  fs.mkdirSync(dest, {recursive: true});
  for (const ent of fs.readdirSync(hubRest, {withFileTypes: true})) {
    if (skip.has(ent.name)) continue;
    if (ent.name === 'exemplos-praticos.mdx') continue;
    const s = path.join(hubRest, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyRecursive(s, d);
    else if (ent.name.endsWith('.mdx')) fs.copyFileSync(s, d);
  }
  console.log('[migrate] REST conceito → deps/tlpp-sample-rest/docs/conceito');
}

function copyHubDocGenerate() {
  const pairs = [
    ['docs/tlpp/rest/metadados', 'deps/tlpp-sample-rest-documentation/docs/metadados'],
    ['docs/tlpp/rest/doc-generate', 'deps/tlpp-sample-rest-documentation/docs/doc-generate'],
  ];
  for (const [from, to] of pairs) {
    const src = path.join(ROOT, from);
    const dest = path.join(ROOT, to);
    if (!fs.existsSync(src)) {
      console.warn(`[migrate] skip missing ${from}`);
      continue;
    }
    fs.rmSync(dest, {recursive: true, force: true});
    copyRecursive(src, dest);
    console.log(`[migrate] ${from} → ${to}`);
  }
}

function copyHubProbatConceito() {
  const hubProbat = path.join(ROOT, 'docs/tlpp/probat');
  const dest = path.join(ROOT, 'deps/tlpp-probat-samples/docs/conceito');
  fs.rmSync(dest, {recursive: true, force: true});
  fs.mkdirSync(dest, {recursive: true});
  for (const ent of fs.readdirSync(hubProbat, {withFileTypes: true})) {
    if (ent.name === 'exemplos-repositorio' || ent.name === '.gitkeep') continue;
    const s = path.join(hubProbat, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyRecursive(s, d);
    else if (ent.name.endsWith('.mdx')) fs.copyFileSync(s, d);
  }
  console.log('[migrate] PROBAT conceito → deps/tlpp-probat-samples/docs/conceito');
}

copyHubRestConceito();
copyHubDocGenerate();
copyHubProbatConceito();
