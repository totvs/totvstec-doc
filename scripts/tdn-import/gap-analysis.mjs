#!/usr/bin/env node
/**
 * Compara content-import/draft (TDN parseado) com website/docs/tlpp/rest publicado.
 * Gera content-import/RELATORIO-CORTES.md
 *
 * Usage: node website/scripts/tdn-import/gap-analysis.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {contentImportPath} from '../lib/context-root.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DRAFT_DIR = contentImportPath('draft');
const TDN_FILE = contentImportPath('tlpp-rest-tdn.txt');
const PUBLISHED_DIR = path.join(ROOT, 'docs/tlpp/rest');
const OUT_FILE = contentImportPath('RELATORIO-CORTES.md');

const SECTION_MAP = {
  'index.md': ['index.mdx'],
  'primeiros-passos.md': [
    'primeiros-passos/quickstart.mdx',
    'primeiros-passos/configuracao.mdx',
    'primeiros-passos/composicao-url.mdx',
  ],
  'configuracoes.md': [
    'configuracoes/annotations.mdx',
    'configuracoes/sem-annotation.mdx',
    'configuracoes/referencia-ini.mdx',
  ],
  'user-exits.md': [
    'funcoes-usuario/callbacks.mdx',
    'funcoes-usuario/on-block.mdx',
    'funcoes-usuario/on-error.mdx',
  ],
  'orest.md': [
    'objeto-orest/visao-geral.mdx',
    'objeto-orest/requisicao-resposta.mdx',
    'objeto-orest/referencia-api.mdx',
  ],
  'authorization.md': ['authorization.mdx'],
  'apis.md': ['apis/referencia.mdx'],
  'exemplos.md': ['exemplos-praticos.mdx'],
  'avisos.md': ['avisos-importantes.mdx'],
};

const BOILERPLATE_RE =
  /^(Tempo aproximado|TLPPCORE|tlppCore|Aproveite!|Para entendê-lo|Siga o roterio|Veja mais em:|Documentação completa:)/i;

function stripFrontmatter(text) {
  return text.replace(/^---[\s\S]*?---\n*/, '');
}

function stripMdx(text) {
  return stripFrontmatter(text)
    .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?\n?/g, '')
    .replace(/<[A-Z][^>]*\/>/g, '')
    .replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, '')
    .replace(/:::(\w+)[\s\S]*?:::/g, '')
    .replace(/\{[^}]+\}/g, '');
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHeadings(text) {
  const headings = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^(#{1,4})\s+(.+)$/);
    if (m) headings.push({level: m[1].length, title: m[2].trim()});
  }
  return headings;
}

function extractCodeBlocks(text) {
  const blocks = [];
  const re = /```(\w*)\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text))) {
    const lang = m[1] || 'text';
    const body = m[2].trim();
    if (body.length < 8) continue;
    blocks.push({lang, body, lines: body.split('\n').length, fingerprint: normalize(body).slice(0, 120)});
  }
  return blocks;
}

/** TDN plain text: filename line followed by code */
function extractTdnCodeSamples(text) {
  const samples = [];
  const lines = text.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (/\.(tlpp|ini|th)$/i.test(line) && !line.includes(' ')) {
      const name = line;
      const buf = [];
      i++;
      while (i < lines.length) {
        const next = lines[i];
        if (/^##?\s/.test(next.trim())) break;
        if (/^Tempo aproximado/i.test(next.trim())) break;
        if (/^\d+ - /.test(next.trim())) break;
        if (/^[A-Z][\w.-]+\.(tlpp|ini|th)$/i.test(next.trim()) && buf.length > 3) break;
        buf.push(next);
        i++;
      }
      const body = buf.join('\n').trim();
      if (body.length > 40) {
        samples.push({name, body, lines: body.split('\n').length});
      }
      continue;
    }
    i++;
  }
  return samples;
}

function extractDraftInlineSamples(text) {
  const samples = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/\.(tlpp|ini)$/i.test(line) && !line.includes(' ')) {
      const name = line;
      if (i + 1 < lines.length && lines[i + 1].trim() === '```') {
        const lang = lines[i + 2]?.trim() || 'text';
        i += 2;
        const buf = [];
        while (i < lines.length && lines[i].trim() !== '```') {
          buf.push(lines[i]);
          i++;
        }
        const body = buf.join('\n').trim();
        if (body.length > 20) samples.push({name, lang, body, lines: body.split('\n').length});
      }
    }
  }
  return samples;
}

function extractFunctionRefs(text) {
  const refs = new Set();
  const patterns = [
    /\b([Uu]_\w+)\s*\(/g,
    /\b(rest\.\w+)\s*\(/g,
    /\b(On(?:Block|Allow|Start|Stop|Select|Error|Send|Auth))\b/g,
    /\b(get\w+Request|set\w+Response|updateKeyHeaderResponse)\s*\(/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text))) refs.add(m[1]);
  }
  return refs;
}

function extractIniKeys(text) {
  const keys = new Set();
  for (const m of text.matchAll(/^\[([^\]]+)\]/gm)) keys.add(`[${m[1]}]`);
  for (const m of text.matchAll(/^\s*([A-Za-z][\w]*)\s*=/gm)) keys.add(m[1]);
  return keys;
}

function wordSet(text) {
  const n = normalize(text);
  return new Set(n.split(' ').filter((w) => w.length > 4));
}

function coverageRatio(sourceWords, publishedWords) {
  if (sourceWords.size === 0) return 1;
  let hit = 0;
  for (const w of sourceWords) if (publishedWords.has(w)) hit++;
  return hit / sourceWords.size;
}

function headingInPublished(heading, publishedNorm) {
  const h = normalize(heading);
  if (h.length < 4) return true;
  return publishedNorm.includes(h) || publishedNorm.includes(h.replace(/^[a-e]\s*-\s*/i, ''));
}

function codeInPublished(sample, publishedNorm) {
  const fp = normalize(sample.body).slice(0, 80);
  return publishedNorm.includes(fp.slice(0, 40));
}

function readPublished(paths) {
  let combined = '';
  let rawCombined = '';
  const files = [];
  for (const rel of paths) {
    const full = path.join(PUBLISHED_DIR, rel);
    if (!fs.existsSync(full)) {
      files.push({rel, missing: true});
      continue;
    }
    const raw = fs.readFileSync(full, 'utf8');
    rawCombined += '\n' + raw;
    combined += '\n' + stripMdx(raw);
    files.push({rel, missing: false, lines: raw.split('\n').length});
  }
  return {combined, rawCombined, files};
}

function formatList(items, limit = 30) {
  const arr = [...items].slice(0, limit);
  const lines = arr.map((x) => `- ${x}`);
  if (items.size > limit) lines.push(`- _… e mais ${items.size - limit}_`);
  return lines.join('\n');
}

function main() {
  const tdnRaw = fs.readFileSync(TDN_FILE, 'utf8');
  const tdnLines = tdnRaw.split(/\r?\n/).length;
  const tdnSamples = extractTdnCodeSamples(tdnRaw);

  const report = [];
  const allMissingHeadings = [];
  const allMissingSamples = [];
  const allMissingFunctions = [];
  const allMissingIniKeys = [];
  const sectionStats = [];

  let totalDraftLines = 0;
  let totalPublishedLines = 0;

  for (const [draftFile, publishedPaths] of Object.entries(SECTION_MAP)) {
    const draftPath = path.join(DRAFT_DIR, draftFile);
    if (!fs.existsSync(draftPath)) continue;

    const draftRaw = fs.readFileSync(draftPath, 'utf8');
    const draftBody = draftRaw.replace(/^#\s+.+\n+/, '');
    totalDraftLines += draftBody.split('\n').length;

    const {combined: published, rawCombined, files: pubFiles} = readPublished(publishedPaths);
    totalPublishedLines += rawCombined.split('\n').length;

    const pubNorm = normalize(published);
    const draftWords = wordSet(draftBody);
    const pubWords = wordSet(published);
    const coverage = coverageRatio(draftWords, pubWords);

    const headings = extractHeadings(draftBody).filter((h) => h.level <= 3);
    const missingHeadings = headings
      .filter((h) => !BOILERPLATE_RE.test(h.title))
      .filter((h) => !headingInPublished(h.title, pubNorm))
      .map((h) => `${draftFile} → ${h.title}`);

    const draftSamples = [
      ...extractDraftInlineSamples(draftBody),
      ...extractCodeBlocks(draftBody).map((b, i) => ({
        name: `(bloco ${i + 1})`,
        body: b.body,
        lines: b.lines,
      })),
    ];

    const missingSamples = draftSamples
      .filter((s) => !codeInPublished(s, pubNorm))
      .map((s) => ({
        section: draftFile,
        name: s.name,
        lines: s.lines,
        preview: s.body.split('\n').slice(0, 2).join(' / ').slice(0, 100),
      }));

    const fnDraft = extractFunctionRefs(draftBody);
    const fnPub = extractFunctionRefs(published);
    const missingFns = [...fnDraft].filter((f) => !fnPub.has(f));

    const iniDraft = extractIniKeys(draftBody);
    const iniPub = extractIniKeys(published);
    const missingIni = [...iniDraft].filter((k) => k.length > 2 && !iniPub.has(k));

    sectionStats.push({
      draftFile,
      draftLines: draftBody.split('\n').length,
      publishedLines: published.split('\n').length,
      publishedFiles: pubFiles.map((f) => f.rel + (f.missing ? ' (ausente)' : '')).join(', '),
      coveragePct: Math.round(coverage * 100),
      missingHeadings: missingHeadings.length,
      missingSamples: missingSamples.length,
      missingFns: missingFns.length,
    });

    allMissingHeadings.push(...missingHeadings);
    allMissingSamples.push(...missingSamples);
    allMissingFunctions.push(...missingFns.map((f) => `${draftFile}: ${f}`));
    allMissingIniKeys.push(...missingIni.map((k) => `${draftFile}: ${k}`));
  }

  const pubAll = readPublished(Object.values(SECTION_MAP).flat());
  const snippetsDir = path.join(ROOT, 'src/snippets');
  let snippetText = '';
  if (fs.existsSync(snippetsDir)) {
    for (const f of fs.readdirSync(snippetsDir)) {
      if (f.endsWith('.ts')) snippetText += fs.readFileSync(path.join(snippetsDir, f), 'utf8');
    }
  }
  const pubAllNorm = normalize(pubAll.combined + '\n' + snippetText);
  const tdnMissingSamples = tdnSamples
    .filter((s) => !codeInPublished(s, pubAllNorm))
    .sort((a, b) => b.lines - a.lines);

  const pubBlocks = extractCodeBlocks(pubAll.combined + '\n' + snippetText);
  const draftAll = Object.keys(SECTION_MAP)
    .map((f) => fs.readFileSync(path.join(DRAFT_DIR, f), 'utf8'))
    .join('\n');
  const draftBlocks = extractCodeBlocks(draftAll);

  report.push('# Relatório de cortes — TDN REST → TLPP Docs');
  report.push('');
  report.push(`Gerado em: ${new Date().toISOString().slice(0, 10)}`);
  report.push('');
  report.push('## Resumo executivo');
  report.push('');
  report.push(`| Métrica | Valor |`);
  report.push(`|---------|-------|`);
  report.push(`| Linhas no export TDN (\`tlpp-rest-tdn.txt\`) | ${tdnLines.toLocaleString('pt-BR')} |`);
  report.push(`| Linhas nos rascunhos parseados (\`content-import/draft/\`) | ${totalDraftLines.toLocaleString('pt-BR')} |`);
  report.push(`| Linhas na doc publicada REST (\`website/docs/tlpp/rest/\`, sem Metadados) | ~${totalPublishedLines.toLocaleString('pt-BR')} |`);
  report.push(`| Amostras de código no TDN (arquivo .tlpp/.ini) | ${tdnSamples.length} |`);
  report.push(`| Amostras do TDN **não encontradas** na doc publicada | **${tdnMissingSamples.length}** |`);
  report.push(`| Blocos \`\`\` no rascunho | ${draftBlocks.length} |`);
  report.push(`| Blocos \`\`\` na doc publicada | ${pubBlocks.length} |`);
  report.push(`| Títulos/seções do rascunho ausentes na doc | ${allMissingHeadings.length} |`);
  report.push('');
  report.push(
    'A doc publicada foi gerada de forma **condensada** (`parse-tdn-rest.mjs --publish`): mantém visão geral e tabelas, mas corta a maior parte do texto narrativo, exemplos longos e referência API completa do oREST. Desde então, alguns exemplos voltaram via `SourceFile` + `website/src/snippets/` (ex.: `rest_start.tlpp`).',
  );
  report.push('');

  report.push('## Cobertura por seção TDN');
  report.push('');
  report.push('| Seção rascunho | Linhas rascunho | Linhas publicadas | Cobertura lexical* | Títulos faltando | Exemplos faltando |');
  report.push('|----------------|-----------------|-------------------|--------------------|------------------|-------------------|');
  for (const s of sectionStats) {
    report.push(
      `| \`${s.draftFile}\` | ${s.draftLines} | ${s.publishedLines} | ${s.coveragePct}% | ${s.missingHeadings} | ${s.missingSamples} |`,
    );
  }
  report.push('');
  report.push('*Cobertura lexical = % de palavras (>4 chars) do rascunho que aparecem em algum lugar da doc publicada da seção. Não mede exemplos completos.*');
  report.push('');
  report.push('### Páginas publicadas por seção');
  report.push('');
  for (const s of sectionStats) {
    report.push(`- **${s.draftFile}** → ${s.publishedFiles}`);
  }
  report.push('');

  report.push('## 1. Exemplos de código do TDN não publicados (prioridade alta)');
  report.push('');
  report.push(
    'Estes arquivos/trechos existem no texto original e **não foram encontrados** (nem parcialmente) nas páginas REST publicadas. Muitos são grandes — candidatos a `SourceFile` colapsável.',
  );
  report.push('');

  if (tdnMissingSamples.length === 0) {
    report.push('_Nenhum — todos os samples detectados constam na doc._');
  } else {
    report.push('| Arquivo / amostra | Linhas | Prévia |');
    report.push('|-------------------|--------|--------|');
    for (const s of tdnMissingSamples.slice(0, 60)) {
      const preview = s.body.split('\n')[0].replace(/\|/g, '\\|').slice(0, 60);
      report.push(`| \`${s.name}\` | ${s.lines} | ${preview}… |`);
    }
    if (tdnMissingSamples.length > 60) {
      report.push(`| _… e mais ${tdnMissingSamples.length - 60} amostras_ | | |`);
    }
  }
  report.push('');

  const recovered = tdnSamples.filter((s) => codeInPublished(s, pubAllNorm));
  report.push('### Já recuperados na doc (snippets / SourceFile)');
  report.push('');
  if (recovered.length === 0) {
    report.push('_Nenhum detectado além dos blocos inline nos MDX._');
  } else {
    for (const s of recovered) {
      report.push(`- \`${s.name}\` (${s.lines} linhas)`);
    }
  }
  report.push('');

  report.push('## 2. Títulos e seções do rascunho ausentes na doc');
  report.push('');
  if (allMissingHeadings.length === 0) {
    report.push('_Nenhum título órfão detectado._');
  } else {
    report.push(formatList(new Set(allMissingHeadings), 80));
  }
  report.push('');

  report.push('## 3. Funções / callbacks mencionados no TDN e não na doc');
  report.push('');
  const uniqueFns = [...new Set(allMissingFunctions)].sort();
  if (uniqueFns.length === 0) {
    report.push('_Nenhuma._');
  } else {
    report.push(formatList(new Set(uniqueFns), 100));
  }
  report.push('');

  report.push('## 4. Chaves INI / config citadas no TDN e não na doc');
  report.push('');
  const uniqueIni = [...new Set(allMissingIniKeys)].sort();
  if (uniqueIni.length === 0) {
    report.push('_Nenhuma significativa._');
  } else {
    report.push(formatList(new Set(uniqueIni), 80));
  }
  report.push('');

  report.push('## 5. Cortes estruturais conhecidos (editorial)');
  report.push('');
  report.push('Além do diff automático acima, estes blocos inteiros do TDN foram **resumidos ou omitidos de propósito** na publicação:');
  report.push('');
  report.push('### Primeiros passos');
  report.push('- Ambiente de compilação TLPP (VS Code, includes, `tlpp.rpo`) — só pré-requisitos curtos');
  report.push('- `rest_start.tlpp` completo — **recuperado** no Quickstart/Configuração via `SourceFile` + `src/snippets/rest_start.ts`');
  report.push('- Detalhes de SSL, slaves, CORS, ContentTypes — só menção em JSON dinâmico');
  report.push('- Ambiente de desenvolvimento / jobs / troubleshooting de boot');
  report.push('');
  report.push('### Configurações');
  report.push('- Tabela completa de todas as chaves INI (centenas de linhas) — só tabela condensada em `referencia-ini`');
  report.push('- Exemplos `LoadURNs` / `jEndpoints` completos');
  report.push('- Path params, wildcards (`*`, `:param`) com exemplos advpl');
  report.push('- Configuração de `ContentTypes`, `Charset`, `CORS` com JSON de exemplo');
  report.push('');
  report.push('### User Exits');
  report.push('- Páginas dedicadas só para **OnBlock** e **OnError** — faltam OnStart, OnStop, OnSelect, OnSend, OnAllow com exemplos');
  report.push('- Assinaturas, retornos e exemplos `rest_start` (callbacks main/slave)');
  report.push('');
  report.push('### oREST (~3.900 linhas no rascunho)');
  report.push('- **Maior corte:** seção "D - Todos os métodos" e "E - Todas as funções" — API reference completa');
  report.push('- Exemplos por método (`getBodyRequest`, headers, multipart, etc.)');
  report.push('- Funções utilitárias (`httpCallEnd`, `jsonObject`, helpers)');
  report.push('- Notas de thread-safety e mutação de JsonObject');
  report.push('');
  report.push('### Authorization');
  report.push('- Fluxo OAuth2 detalhado (token, refresh, scopes)');
  report.push('- Exemplos `U_onAuthorization` completos');
  report.push('- Cenários Basic vs Bearer');
  report.push('');
  report.push('### APIs administrativas');
  report.push('- Payloads JSON de config/métricas em runtime');
  report.push('- Lista completa de endpoints `/tlpp/...`');
  report.push('');
  report.push('### Exemplos práticos');
  report.push('- Links GitHub mantidos; exemplos inline do TDN (curl, Postman) cortados');
  report.push('');
  report.push('### Metadados (fora deste diff)');
  report.push('- A pasta `website/docs/tlpp/rest/metadados/` vem do **repositório de exemplos**, não do TDN de 8K linhas');
  report.push('- Conteúdo REST-DOC / OpenAPI generator não está no `tlpp-rest-tdn.txt`');
  report.push('');

  report.push('## 6. Próximos passos sugeridos');
  report.push('');
  report.push('1. Incorporar exemplos grandes com `SourceFile` (padrão `rest_start.tlpp`)');
  report.push('2. Expandir **oREST** — publicar referência API método a método (pode ser página única colapsável)');
  report.push('3. Completar **User Exits** — uma página por callback com exemplo do TDN');
  report.push('4. `referencia-ini` — importar tabela completa ou link âncora para TDN');
  report.push('5. Re-rodar este script após cada rodada: `node website/scripts/tdn-import/gap-analysis.mjs`');
  report.push('');

  fs.writeFileSync(OUT_FILE, report.join('\n'), 'utf8');
  console.log(`Wrote ${OUT_FILE}`);
  console.log(`TDN missing code samples: ${tdnMissingSamples.length}`);
}

main();
