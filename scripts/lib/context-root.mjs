#!/usr/bin/env node
/**
 * Raiz do repositório local de contexto (IA, migração, TDN bruto).
 * Override: TOTVSTEC_CONTEXT_ROOT=/caminho/absoluto
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

export const CONTEXT_ROOT = path.resolve(
  process.env.TOTVSTEC_CONTEXT_ROOT ??
    path.join(PROJECT_ROOT, '../../Github/totvstec-doc-context'),
);

export function contextPath(...segments) {
  return path.join(CONTEXT_ROOT, ...segments);
}

export function contentImportPath(...segments) {
  return contextPath('content-import', ...segments);
}

export function assertContextRoot() {
  if (!fs.existsSync(CONTEXT_ROOT)) {
    throw new Error(
      `Repositório de contexto não encontrado: ${CONTEXT_ROOT}\n` +
        'Crie ou clone totvstec-doc-context em Documentos/Github/.',
    );
  }
}
