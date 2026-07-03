#!/usr/bin/env node
/**
 * Parse TDN REST plain-text export → draft MDX + condensed publish.
 * Usage:
 *   node parse-tdn-rest.mjs --input ../../content-import/tlpp-rest-tdn.txt --output ../../content-import/draft
 *   node parse-tdn-rest.mjs --publish --input ../../content-import/tlpp-rest-tdn.txt --output ../docs/tlpp/rest
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {contentImportPath} from '../lib/context-root.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SECTIONS = [
  {id: 'index', title: 'REST', start: /^REST$/m, end: /^1 - Primeiros Passos/m},
  {
    id: 'primeiros-passos',
    title: 'Primeiros Passos',
    start: /^1 - Primeiros Passos/m,
    end: /^Tempo aproximado para leitura: 1 minuto\nNo item anterior/m,
  },
  {
    id: 'configuracoes',
    title: 'Configurações Avançadas',
    start: /^Tempo aproximado para leitura: 1 minuto\nNo item anterior/m,
    end: /^Callbacks e Funcionalidades Nativas/m,
  },
  {
    id: 'user-exits',
    title: 'Funções de Usuário',
    start: /^Callbacks e Funcionalidades Nativas/m,
    end: /^4 - Entendendo o objeto oREST/m,
  },
  {
    id: 'orest',
    title: 'Objeto oREST',
    start: /^4 - Entendendo o objeto oREST/m,
    end: /^5 - Authorization \(onAuth\)/m,
  },
  {
    id: 'authorization',
    title: 'Authorization',
    start: /^5 - Authorization \(onAuth\)/m,
    end: /^6 - APIs/m,
  },
  {id: 'apis', title: 'APIs', start: /^6 - APIs/m, end: /^7 - Exemplos práticos/m},
  {
    id: 'exemplos',
    title: 'Exemplos práticos',
    start: /^7 - Exemplos práticos/m,
    end: /^Avisos Importantes/m,
  },
  {id: 'avisos', title: 'Avisos Importantes', start: /^Avisos Importantes/m, end: null},
];

const BOILERPLATE = [
  /^Tempo aproximado para leitura:/,
  /^TLPPCORE$/,
  /^tlppCore$/,
  /^Aproveite!$/,
  /^Para entendê-lo melhor, leia toda essa documentação!/,
  /^Siga o roterio abaixo/,
  /^Veja mais em:$/,
];

const CODE_FILE = /\.(tlpp|ini|th)$/i;

function parseArgs(argv) {
  const args = {publish: false, input: '', output: ''};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--publish') args.publish = true;
    else if (argv[i] === '--input') args.input = argv[++i];
    else if (argv[i] === '--output') args.output = argv[++i];
  }
  return args;
}

function splitSections(text) {
  const lines = text.split(/\r?\n/);
  const full = lines.join('\n');
  const result = {};

  for (const sec of SECTIONS) {
    const startMatch = sec.start.exec(full);
    if (!startMatch) continue;
    const startIdx = startMatch.index;
    let endIdx = full.length;
    if (sec.end) {
      const endMatch = sec.end.exec(full.slice(startIdx + 1));
      if (endMatch) endIdx = startIdx + 1 + endMatch.index;
    }
    result[sec.id] = {
      title: sec.title,
      content: full.slice(startIdx, endIdx).trim(),
    };
  }
  return result;
}

function isBoilerplate(line) {
  const t = line.trim();
  if (!t) return false;
  return BOILERPLATE.some((re) => re.test(t));
}

function detectLang(filename) {
  if (/\.ini$/i.test(filename)) return 'ini';
  if (/\.tlpp$/i.test(filename)) return 'advpl';
  return 'text';
}

function toMarkdown(raw, {condense = false} = {}) {
  const lines = raw.split(/\r?\n/);
  const out = [];
  let inCode = false;
  let codeLang = 'text';
  let codeBuffer = [];

  const flushCode = () => {
    if (codeBuffer.length) {
      out.push('```' + codeLang);
      out.push(...codeBuffer);
      out.push('```');
      out.push('');
      codeBuffer = [];
    }
    inCode = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (condense && isBoilerplate(line)) continue;

    if (!inCode && CODE_FILE.test(trimmed) && lines[i + 1]?.trim()) {
      flushCode();
      inCode = true;
      codeLang = detectLang(trimmed);
      continue;
    }

    if (inCode) {
      const nextIsFile = CODE_FILE.test(trimmed);
      const nextIsSection =
        /^\d+ - /.test(trimmed) ||
        /^[A-E] - /.test(trimmed) ||
        /^Avisos Importantes/.test(trimmed);
      if (
        (trimmed === '' && lines[i + 1] === '') ||
        nextIsFile ||
        (nextIsSection && codeBuffer.length > 3)
      ) {
        flushCode();
        if (nextIsFile || nextIsSection) i--;
        continue;
      }
      codeBuffer.push(line);
      continue;
    }

    if (/^#{0,2}[A-ZÁÉÍÓÚÃÕÇ]/.test(trimmed) && trimmed.length < 80 && !trimmed.includes('.')) {
      if (/^\d+ - /.test(trimmed) || /^[A-E] - /.test(trimmed)) {
        out.push(`## ${trimmed}`);
        out.push('');
        continue;
      }
      if (
        [
          'Charset',
          'OnBlock',
          'OnAllow',
          'OnStart',
          'OnStop',
          'OnSelect',
          'OnError',
          'OnSend',
        ].includes(trimmed)
      ) {
        out.push(`### ${trimmed}`);
        out.push('');
        continue;
      }
    }

    if (trimmed.startsWith('    ') || /^\t/.test(line)) {
      out.push('- ' + trimmed.replace(/^[\t ]+/, ''));
      continue;
    }

    if (trimmed) out.push(line);
    else if (out[out.length - 1] !== '') out.push('');
  }
  flushCode();
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function writeDraft(sections, outDir) {
  fs.mkdirSync(outDir, {recursive: true});
  const manifest = [];
  for (const [id, sec] of Object.entries(sections)) {
    const md = toMarkdown(sec.content);
    const file = path.join(outDir, `${id}.md`);
    fs.writeFileSync(file, `# ${sec.title}\n\n${md}\n`, 'utf8');
    manifest.push({id, title: sec.title, file, lines: sec.content.split('\n').length});
  }
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  return manifest;
}

function mdxFrontmatter({title, description, sidebarPosition, sidebar = 'restSidebar'}) {
  return `---
title: ${title}
description: ${description}
sidebar_position: ${sidebarPosition}
displayed_sidebar: ${sidebar}
---

`;
}

function fm(title, description, sidebarPosition, sidebar) {
  return mdxFrontmatter({title, description, sidebarPosition, sidebar});
}

function extractCodeBlock(text, filename) {
  const re = new RegExp(`${filename.replace('.', '\\.')}\\s*\\n([\\s\\S]*?)(?=\\n\\w+\\.(tlpp|ini)|\\n## |$)`, 'i');
  const m = text.match(re);
  if (!m) return null;
  return m[1].trim();
}

function publishCondensed(sections, outDir) {
  fs.mkdirSync(outDir, {recursive: true});

  const pp = sections['primeiros-passos']?.content ?? '';
  const cfg = sections['configuracoes']?.content ?? '';
  const ue = sections['user-exits']?.content ?? '';
  const orest = sections['orest']?.content ?? '';
  const auth = sections['authorization']?.content ?? '';
  const apis = sections['apis']?.content ?? '';
  const ex = sections['exemplos']?.content ?? '';
  const av = sections['avisos']?.content ?? '';
  const idx = sections['index']?.content ?? '';

  const tdnLink =
    '\n\nDocumentação completa: [TDN — REST](https://tdn.totvs.com/display/tec/REST).\n';

  const pages = [];

  // index
  pages.push({
    path: 'index.mdx',
    body:
      fm('REST TLPP', 'Servidor REST nativo no AppServer — visão geral.', 1, 'restSidebar') +
      `O REST TLPP roda **nativamente no AppServer**, com annotations, configuração dinâmica via JSON e documentação OpenAPI gerada pelo servidor.

## Por que usar

- **Performance** — sem camada HTTP externa
- **Annotations** — rotas declaradas no código-fonte
- **Dinâmico** — suba serviços em runtime com \`tlpp.rest\`
- **Monitoramento** — logs, métricas e callbacks de ciclo de vida

## Nesta seção

| Guia | Conteúdo |
|------|----------|
| [Primeiros passos](/docs/tlpp/rest/primeiros-passos/quickstart) | Ambiente, Hello World, URL |
| [Configurações](/docs/tlpp/rest/configuracoes/annotations) | Annotations, INI, referência |
| [User Exits](/docs/tlpp/rest/funcoes-usuario/callbacks) | OnBlock, OnStart, OnError… |
| [oREST](/docs/tlpp/rest/objeto-orest/visao-geral) | Objeto de requisição/resposta |
| [Authorization](/docs/tlpp/rest/authorization) | Basic Auth e OAuth2 |
| [APIs admin](/docs/tlpp/rest/apis/referencia) | Config e métricas em runtime |
| [Exemplos](/docs/tlpp/rest/exemplos-praticos) | Repositórios GitHub TOTVS |
| [Avisos](/docs/tlpp/rest/avisos-importantes) | Armadilhas comuns |

**Próximo passo:** [Quickstart](/docs/tlpp/rest/primeiros-passos/quickstart)` +
      tdnLink,
  });

  const dirs = [
    'primeiros-passos',
    'configuracoes',
    'funcoes-usuario',
    'objeto-orest',
    'apis',
  ];
  for (const d of dirs) {
    fs.mkdirSync(path.join(outDir, d), {recursive: true});
  }

  pages.push({
    path: 'primeiros-passos/quickstart.mdx',
    body:
      mdxFrontmatter({
        title: 'Quickstart',
        description: 'Suba seu primeiro serviço REST TLPP.',
        sidebarPosition: 1,
      }) +
      `Configure o ambiente, inicie o servidor e publique um endpoint Hello World.

## Pré-requisitos

1. \`tlpp.rpo\` na pasta do \`appserver.exe\`
2. Includes TLPP no projeto (\`tlpp-core.th\`, \`tlpp-rest.th\`)

## Configuração mínima (INI)

\`\`\`ini
[HTTPSERVER]
Enable=1
Servers=HTTP_REST

[HTTP_REST]
hostname=localhost
port=9995
locations=HTTP_ROOT

[HTTP_ROOT]
Path=/
RootPath=root/web
ThreadPool=THREAD_POOL

[THREAD_POOL]
Environment=ENV
MinThreads=1
\`\`\`

## Hello World com annotation

\`\`\`advpl
#include "tlpp-core.th"
#include "tlpp-rest.th"

@Get("hello")
User Function hello()
    oRest:setResponse('{"message":"Hello World"}')
    Return .T.
\`\`\`

Teste: \`GET http://localhost:9995/hello\`

## Configuração via JSON (runtime)

Use \`tlpp.rest\` com objeto JSON **case-sensitive** — mesma estrutura do INI. Agende com \`[OnStart]\` + Job para subir no boot.

\`\`\`ini
[OnStart]
Jobs=JOB1

[JOB1]
Main=rest.u_start
Environment=SEU_ENV
\`\`\`

**Próximo passo:** [Composição da URL](/docs/tlpp/rest/primeiros-passos/composicao-url) | [Configuração detalhada](/docs/tlpp/rest/primeiros-passos/configuracao)` +
      tdnLink,
  });

  pages.push({
    path: 'primeiros-passos/configuracao.mdx',
    body:
      mdxFrontmatter({
        title: 'Configuração INI e JSON',
        description: 'Duas formas de configurar o REST Server.',
        sidebarPosition: 2,      }) +
      `O REST Server aceita **appserver.ini** ou **objeto JSON** em TLPP — mesma hierarquia de seções.

## Hierarquia

\`\`\`
HTTPSERVER → Servers → Locations → ThreadPool → Environment
\`\`\`

| Seção | Função |
|-------|--------|
| \`[HTTPSERVER]\` | Liga o servidor HTTP |
| \`[HTTP_REST]\` | Porta, hostname, locations |
| \`[HTTP_ROOT]\` | Path virtual, RootPath, ThreadPool |
| \`[THREAD_POOL]\` | Environment Protheus, MinThreads |

## JSON dinâmico

Chaves do JSON devem coincidir **exatamente** com os nomes das seções INI (case-sensitive). Inicialize após o boot do AppServer com \`tlpp.rest\`.

:::caution
JSON mal formatado ou chaves incorretas impedem o start do serviço.
:::

**Próximo passo:** [Referência INI](/docs/tlpp/rest/configuracoes/referencia-ini)` +
      tdnLink,
  });

  pages.push({
    path: 'primeiros-passos/composicao-url.mdx',
    body:
      mdxFrontmatter({
        title: 'Composição da URL',
        description: 'Host, path virtual, endpoint e query string.',
        sidebarPosition: 3,      }) +
      `Uma URL REST TLPP combina componentes fixos (config) e dinâmicos (código).

## Estrutura

\`\`\`
https://host:porta/pathVirtual/endpoint?query=valor
\`\`\`

| Componente | Origem | Exemplo |
|------------|--------|---------|
| Protocolo | INI (HTTP/HTTPS) | \`https\` |
| Host:Porta | INI + infra | \`127.0.0.1:8080\` |
| Path virtual | \`Path\` em Location | \`/totvs\` |
| Endpoint | \`@Get("api/sample")\` | \`/api/sample\` |
| Query string | Cliente | \`?id=1\` |

## HTTP vs HTTPS

**HTTP:** \`[HTTPSERVER] Enable=1\` sem certificados.

**HTTPS:** informe \`SslCertificate\` e \`SslCertificateKey\` na seção do servidor.

**Próximo passo:** [Annotations](/docs/tlpp/rest/configuracoes/annotations)` +
      tdnLink,
  });

  pages.push({
    path: 'configuracoes/annotations.mdx',
    body:
      mdxFrontmatter({
        title: 'Annotations',
        description: 'Rotas REST com @Get, @Post e demais verbos.',
        sidebarPosition: 1,      }) +
      `Use annotations para mapear verbos HTTP sem arquivo externo de rotas.

## Verbos

| Annotation | Uso |
|------------|-----|
| \`@Get\` | Ler recurso |
| \`@Post\` | Criar recurso |
| \`@Put\` | Substituir recurso |
| \`@Patch\` | Atualizar parcialmente |
| \`@Delete\` | Remover recurso |

## Propriedades

- \`endpoint\` (obrigatório) — URN da rota
- \`description\` (opcional) — texto para documentação OpenAPI

\`\`\`advpl
@Get(endpoint = "users/:id", description = "Busca usuário")
User Function getUser()
    Local jParams := oRest:getPathParamsRequest()
    // ...
    Return .T.
\`\`\`

Path params usam \`:nome\` no endpoint.

**Próximo passo:** [Sem annotation](/docs/tlpp/rest/configuracoes/sem-annotation)` +
      tdnLink,
  });

  pages.push({
    path: 'configuracoes/sem-annotation.mdx',
    body:
      mdxFrontmatter({
        title: 'Sem annotation',
        description: 'LoadURNs e mapeamento JSON de endpoints.',
        sidebarPosition: 2,      }) +
      `Para rotas dinâmicas ou legado, mapeie endpoints via JSON com \`LoadURNs\` ou estrutura \`jEndpoints\`.

## Quando usar

- URLs geradas em runtime
- Migração de WsRESTful
- Controle fino de ProgramType, ClassName e Function por verbo

O mapeamento associa path + verbo HTTP à função ou método compilado no RPO.

**Próximo passo:** [Referência INI](/docs/tlpp/rest/configuracoes/referencia-ini)` +
      tdnLink,
  });

  pages.push({
    path: 'configuracoes/referencia-ini.mdx',
    body:
      mdxFrontmatter({
        title: 'Referência INI',
        description: 'Chaves principais do appserver.ini para REST.',
        sidebarPosition: 3,      }) +
      `Tabela condensada das chaves mais usadas. Detalhes adicionais no TDN.

## Servidor e rede

| Chave | Seção | Tipo | Descrição |
|-------|-------|------|-----------|
| Enable | HTTPSERVER | int | 1 = ativo |
| Servers | HTTPSERVER | string | Nomes dos servidores |
| Port | Server | int | Porta HTTP(S) |
| Hostname | Server | string | Host virtual |
| Locations | Server | string | Seções de rota |
| Path | Location | string | Prefixo URL |
| RootPath | Location | string | Arquivos estáticos |
| ThreadPool | Location | string | Pool de threads |
| Environment | ThreadPool | string | Ambiente RPO |
| MinThreads | ThreadPool | int | Mínimo de threads (>0) |

## Logs

| Chave | Default | Descrição |
|-------|---------|-----------|
| rest_log_level | 3–6 | Verbosidade |
| rest_error_full | 0/1 | Stack no log de erro |
| rest_log_stringsize | 200 MB | Tamanho máximo do log |
| rest_reload_time | 60s | Releitura de config |
| rest_trace_time | 1/2 | Timer de trace |

## Dados injetados

| Chave | Uso |
|-------|-----|
| TlppData | Config nativa (auth, callbacks) |
| UserData | JSON customizado do desenvolvedor |
| UserExits | Seção de callbacks On* |
| ContentTypes | Mapeamento de MIME types |
| Charset | UTF-8, CP1252, etc. |

## SSL

| Chave | Descrição |
|-------|-----------|
| SslCertificate | Certificado |
| SslCertificateKey | Chave privada |

**Próximo passo:** [User Exits](/docs/tlpp/rest/funcoes-usuario/callbacks)` +
      tdnLink,
  });

  pages.push({
    path: 'funcoes-usuario/callbacks.mdx',
    body:
      mdxFrontmatter({
        title: 'Callbacks (User Exits)',
        description: 'Hooks do ciclo de vida das threads REST.',
        sidebarPosition: 1,      }) +
      `User Exits interceptam o fluxo da requisição em pontos definidos.

## Os 7 callbacks

| Callback | Momento |
|----------|---------|
| OnBlock | Bloqueia URNs globalmente |
| OnAllow | Permite URNs (exclusivo com OnBlock) |
| OnStart | Thread iniciada |
| OnStop | Thread encerrada |
| OnSelect | Escolha de pool/thread |
| OnError | Exceção no serviço |
| OnSend | Antes de enviar resposta |

:::warning
**OnBlock** e **OnAllow** são mutuamente exclusivos no mesmo ambiente.
:::

Configure em \`[UserExits]\` apontando para funções compiladas no RPO.

**Próximo passo:** [oREST](/docs/tlpp/rest/objeto-orest/visao-geral)` +
      tdnLink,
  });

  for (const cb of ['on-block', 'on-error']) {
    const name = cb === 'on-block' ? 'OnBlock' : 'OnError';
    pages.push({
      path: `funcoes-usuario/${cb}.mdx`,
      body:
        mdxFrontmatter({
          title: name,
          description: `Callback ${name} — detalhes.`,
          sidebarPosition: cb === 'on-block' ? 2 : 3,        }) +
        (cb === 'on-block'
          ? `Bloqueia URNs antes do roteamento. Retorno lógico indica se a URN pode prosseguir.

Use para manutenção, feature flags ou bloqueio global temporário.`
          : `Captura erros não tratados na thread. Ideal para log estruturado e resposta HTTP padronizada.

Invoque \`httpCallEnd()\` manualmente apenas em cenários de tratamento de exceção.`) +
        tdnLink,
    });
  }

  pages.push({
    path: 'objeto-orest/visao-geral.mdx',
    body:
      mdxFrontmatter({
        title: 'Visão geral do oRest',
        description: 'Objeto injetado automaticamente em cada thread.',
        sidebarPosition: 1,      }) +
      `\`oRest\` é instanciado **automaticamente** por thread — não construa manualmente.

Cada requisição recebe um objeto isolado para leitura de entrada e montagem da resposta.

## Responsabilidades

- Extrair body, headers, path e query
- Definir status, headers e body da resposta
- Acessar TlppData/UserData do pool e servidor

**Próximo passo:** [Requisição e resposta](/docs/tlpp/rest/objeto-orest/requisicao-resposta)` +
      tdnLink,
  });

  pages.push({
    path: 'objeto-orest/requisicao-resposta.mdx',
    body:
      mdxFrontmatter({
        title: 'Requisição e resposta',
        description: 'Getters e setters do oRest.',
        sidebarPosition: 2,      }) +
      `## Entrada

| Método | Retorno | Notas |
|--------|---------|-------|
| \`getBodyRequest()\` | string bruta | Parse manual (JSON, XML…) |
| \`getHeaderRequest()\` | JsonObject | Referência — não mutar |
| \`getQueryRequest()\` | JsonObject | Query string |
| \`getPathParamsRequest()\` | JsonObject | Parâmetros \`:id\` |

## Saída

| Método | Uso |
|--------|-----|
| \`setResponse(cBody)\` | Body da resposta |
| \`setStatusResponse(n, cBody)\` | Status HTTP + body |
| \`updateKeyHeaderResponse(cKey, cVal)\` | Header de resposta |

:::caution
Objetos JSON retornados por getters são **referências** compartilhadas. Não altere propriedades — isso afeta requisições seguintes.
:::

**Próximo passo:** [Referência API](/docs/tlpp/rest/objeto-orest/referencia-api)` +
      tdnLink,
  });

  pages.push({
    path: 'objeto-orest/referencia-api.mdx',
    body:
      mdxFrontmatter({
        title: 'Referência oRest',
        description: 'Métodos e funções do objeto oRest.',
        sidebarPosition: 3,      }) +
      `Lista condensada — consulte o TDN para assinaturas completas.

## Leitura

- \`getBodyRequest()\`
- \`getHeaderRequest()\`
- \`getQueryRequest()\`
- \`getPathParamsRequest()\`
- \`getThreadPoolTlppData()\`
- \`getServerTlppData()\`
- \`getThreadPoolUserData()\`
- \`getThreadPoolServerUserData()\`
- \`getHeaderResponse()\`

## Escrita

- \`setResponse()\`
- \`setStatusResponse()\`
- \`updateKeyHeaderResponse()\`
- \`setKeyHeaderResponse()\`

**Próximo passo:** [Authorization](/docs/tlpp/rest/authorization)` +
      tdnLink,
  });

  pages.push({
    path: 'authorization.mdx',
    body:
      mdxFrontmatter({
        title: 'Authorization',
        description: 'Basic Auth e OAuth2 com onAuth.',
        sidebarPosition: 5,      }) +
      `Ative autenticação por servidor via \`TlppData\`.

## Basic Auth

\`\`\`ini
TlppData='{"Authorization":{"scheme":"basic","OnAuth":"U_onAuthorization"}}'
\`\`\`

Fluxo:

1. Server valida header \`Authorization: Basic …\`
2. Se válido, chama \`OnAuth(cUser, cPass)\` — retorno **obrigatório** \`.T.\` / \`.F.\`

| Retorno | HTTP |
|---------|------|
| \`.T.\` | Prossegue para o endpoint |
| \`.F.\` | 403 Forbidden |
| Outro tipo | Tratado como \`.F.\` |

## OAuth2

Disponível a partir de 19.3.1+. Endpoints \`/tlpp/oauth2/token\` para access e refresh token. Configure scheme \`oauth2\` em TlppData.

**Próximo passo:** [APIs admin](/docs/tlpp/rest/apis/referencia)` +
      tdnLink,
  });

  pages.push({
    path: 'apis/referencia.mdx',
    body:
      mdxFrontmatter({
        title: 'APIs administrativas',
        description: 'Config, métricas e monitoramento em runtime.',
        sidebarPosition: 1,      }) +
      `APIs HTTP para operação sem reiniciar o AppServer.

## Endpoints comuns

| API | URL típica | Função |
|-----|------------|--------|
| Config logs | \`/rest/tlpp/rest/config\` | Altera níveis de log em runtime |
| Lista serviços | endpoints de discovery | Serviços ativos |
| Métricas | endpoints de timing | Tempos por camada |
| Versão | endpoint de version | AppServer + TLPP |

Substitua host/porta pelos valores do seu \`appserver.ini\`.

**Próximo passo:** [Exemplos práticos](/docs/tlpp/rest/exemplos-praticos)` +
      tdnLink,
  });

  pages.push({
    path: 'exemplos-praticos.mdx',
    body:
      mdxFrontmatter({
        title: 'Exemplos práticos',
        description: 'Repositórios oficiais TOTVS.',
        sidebarPosition: 7,      }) +
      `Exemplos mantidos pela TOTVS no GitHub:

- [CRUD](https://github.com/totvs/tlpp-sample-rest/tree/master/server/CRUD)
- [Migração WsRESTful → REST tlppCore](https://github.com/totvs/tlpp-sample-rest)

**Próximo passo:** [Avisos importantes](/docs/tlpp/rest/avisos-importantes)` +
      tdnLink,
  });

  pages.push({
    path: 'avisos-importantes.mdx',
    body:
      mdxFrontmatter({
        title: 'Avisos importantes',
        description: 'Armadilhas comuns no REST TLPP.',
        sidebarPosition: 8,      }) +
      `## Path parameters

O nome da variável em \`:param\` é fixado pela **primeira rota registrada** no mesmo path base. Rotas subsequentes devem reutilizar o mesmo nome.

## Objetos por referência

\`getHeaderRequest()\`, \`getQueryRequest()\` e similares retornam referências internas. **Não modifique** o JsonObject retornado.

## OnBlock vs OnAllow

Configure apenas um dos dois por ambiente — ambos controlam acesso global a URNs.

**Próximo passo:** [Metadados OpenAPI](/docs/tlpp/rest/metadados/visao-geral)` +
      tdnLink,
  });

  for (const p of pages) {
    const full = path.join(outDir, p.path);
    fs.mkdirSync(path.dirname(full), {recursive: true});
    fs.writeFileSync(full, p.body, 'utf8');
  }

  console.log(`Published ${pages.length} condensed MDX pages to ${outDir}`);
}

function main() {
  const args = parseArgs(process.argv);
  const inputPath = path.resolve(args.input || contentImportPath('tlpp-rest-tdn.txt'));
  const outputPath = path.resolve(
    args.output ||
      (args.publish
        ? path.join(__dirname, '../../docs/tlpp/rest')
        : contentImportPath('draft')),
  );

  if (!fs.existsSync(inputPath)) {
    console.error('Input not found:', inputPath);
    process.exit(1);
  }

  const text = fs.readFileSync(inputPath, 'utf8');
  const sections = splitSections(text);

  if (args.publish) {
    publishCondensed(sections, outputPath);
    const draftDir = path.join(path.dirname(inputPath), 'draft');
    writeDraft(sections, draftDir);
    console.log(`Draft written to ${draftDir}`);
  } else {
    const manifest = writeDraft(sections, outputPath);
    console.log(`Draft: ${manifest.length} sections → ${outputPath}`);
  }
}

main();
