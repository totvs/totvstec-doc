#!/usr/bin/env node
/**
 * Extrai amostras nomeadas do export TDN → website/src/snippets/tdn/*.ts
 * Usage: node website/scripts/tdn-import/extract-samples.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {contentImportPath} from '../lib/context-root.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const TDN = contentImportPath('tlpp-rest-tdn.txt');
const OUT_DIR = path.join(ROOT, 'src/snippets/tdn');

const STOP_LINE =
  /^(Tempo aproximado|\d+ - |[A-ZÁÉÍÓÚ][^@\[\{]{40,}$)/;

function extractAfterFilename(text, filename, {minLines = 5, pick = 0, untilLine} = {}) {
  const lines = text.split(/\r?\n/);
  const untilRe = untilLine ? new RegExp(untilLine, 'i') : null;
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== filename) continue;
    const buf = [];
    i++;
    while (i < lines.length) {
      const raw = lines[i];
      const t = raw.trim();
      if (untilRe && untilRe.test(t)) break;
      if (/^[a-z_][\w.-]*\.(tlpp|ini|th)$/i.test(t) && buf.length >= minLines) break;
      if (!untilRe && STOP_LINE.test(t) && buf.length >= minLines) break;
      if (
        !untilRe &&
        buf.length >= minLines &&
        /^[A-ZÁÉÍÓÚ]/.test(t) &&
        !/^(Local|Return|If|Else|EndIf|Endif|Function|function|Static|#include|jo\[|jConfig\[|jEndpoints|@Get|class |method |public |oRest)/.test(
          t,
        ) &&
        t.length > 50 &&
        !t.includes(':=') &&
        !t.startsWith('[')
      ) {
        break;
      }
      buf.push(raw);
      i++;
    }
    const body = buf.join('\n').trimEnd();
    if (body.split('\n').length >= minLines) hits.push(body);
  }
  if (!hits.length) throw new Error(`Sample not found: ${filename}`);
  return hits[pick] ?? hits[0];
}

function extractIniBlock(text, startMarker, untilLine = 'Tempo aproximado|Configuração de Charset') {
  const idx = text.indexOf(startMarker);
  if (idx < 0) throw new Error(`INI block not found: ${startMarker}`);
  const slice = text.slice(idx);
  const lines = slice.split(/\r?\n/);
  const untilRe = new RegExp(untilLine, 'i');
  const buf = [];
  for (const line of lines) {
    const t = line.trim();
    if (buf.length > 0 && untilRe.test(t)) break;
    buf.push(line);
  }
  while (buf.length && !buf[buf.length - 1].trim()) buf.pop();
  return buf.join('\n').trimEnd();
}

function writeSnippet(name, exportName, body, lang = 'advpl') {
  const escaped = body.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  const file = path.join(OUT_DIR, `${name}.ts`);
  fs.writeFileSync(
    file,
    `/** Auto-generated from content-import/tlpp-rest-tdn.txt */\nexport const ${exportName} = \`${escaped}\`;\nexport const ${exportName}_LANG = '${lang}' as const;\n`,
    'utf8',
  );
  return file;
}

function main() {
  const text = fs.readFileSync(TDN, 'utf8');
  fs.mkdirSync(OUT_DIR, {recursive: true});

  const samples = {
    f_init_service: extractAfterFilename(text, 'fInitService.tlpp', {minLines: 40, pick: 0}),
    load_urns_no_annotation: extractAfterFilename(text, 'load_urns_no_annotation.tlpp', {
      minLines: 80,
      untilLine: '^As funções, os endpoints',
    }),
    exemplo_ws_restful_start: extractAfterFilename(text, 'exemplo_wsRestfulStart.tlpp', {
      minLines: 30,
    }),
    exemplo_metadados_globais: extractAfterFilename(text, 'exemplo_metadados_globais.tlpp', {
      minLines: 3,
    }),
  };

  const ppIdx = text.indexOf('Configuração Rest Server TLPP via INI');
  const iniBasico = extractAfterFilename(text.slice(ppIdx), 'appserver.ini', {
    minLines: 10,
    pick: 0,
    untilLine: '^1\\. HTTPSERVER',
  });

  const fullIniIdx = text.search(
    /\[HTTP_SSL_SERVER\]\s*\r?\nHostName=localhost\s*\r?\nPort=443/,
  );
  if (fullIniIdx < 0) throw new Error('Full INI example not found');
  const iniStart = text.lastIndexOf('[HTTPSERVER]', fullIniIdx);
  const iniComplete = extractIniBlock(text.slice(iniStart), '[HTTPSERVER]');

  const authIdx = text.indexOf('5 - Authorization (onAuth)');
  const iniBasicAuth = extractAfterFilename(text.slice(authIdx), 'appserver.ini', {
    minLines: 4,
    pick: 0,
    untilLine: '^IMPORTANTE',
  });

  for (const [name, body] of Object.entries(samples)) {
    const exportName = name.toUpperCase().replace(/-/g, '_');
    writeSnippet(name, exportName, body);
    console.log(`wrote ${name}.ts (${body.split('\n').length} lines)`);
  }

  writeSnippet('ini_basico', 'INI_BASICO', iniBasico, 'ini');
  writeSnippet('ini_completo_ssl_slaves', 'INI_COMPLETO_SSL_SLAVES', iniComplete, 'ini');
  writeSnippet('ini_basic_auth', 'INI_BASIC_AUTH', iniBasicAuth, 'ini');

  const index = Object.keys(samples)
    .concat(['ini_basico', 'ini_completo_ssl_slaves', 'ini_basic_auth'])
    .map((n) => {
      const ex = n.toUpperCase().replace(/-/g, '_');
      return `export {${ex}, ${ex}_LANG} from './${n}';`;
    })
    .join('\n');

  fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), index + '\n', 'utf8');
  console.log('wrote index.ts');
}

main();
