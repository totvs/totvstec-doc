#!/usr/bin/env node
/**
 * Remove MDX conceitual do hub — conteúdo agora vive nos satélites.
 * Mantém: .gitkeep, exemplos-praticos.mdx (página do motor).
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function rmMdxTree(dir, keep = new Set()) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (keep.has(ent.name)) continue;
      rmMdxTree(p, keep);
      if (fs.readdirSync(p).length === 0) fs.rmdirSync(p);
    } else if (ent.name.endsWith('.mdx') && !keep.has(ent.name)) {
      fs.unlinkSync(p);
    }
  }
}

const hubRest = path.join(ROOT, 'docs/tlpp/rest');
for (const ent of fs.readdirSync(hubRest, {withFileTypes: true})) {
  const p = path.join(hubRest, ent.name);
  if (ent.isDirectory()) {
    if (['exemplos-repositorio', 'exemplos-doc-generate', 'metadados', 'doc-generate'].includes(ent.name)) {
      rmMdxTree(p, new Set(['.gitkeep']));
      continue;
    }
    fs.rmSync(p, {recursive: true, force: true});
  } else if (ent.name.endsWith('.mdx') && ent.name !== 'exemplos-praticos.mdx') {
    fs.unlinkSync(p);
  }
}

rmMdxTree(path.join(ROOT, 'docs/tlpp/probat'), new Set(['exemplos-repositorio', '.gitkeep']));

console.log('[purge-hub-docs] MDX conceitual removido do hub (mantidos placeholders + exemplos-praticos)');
