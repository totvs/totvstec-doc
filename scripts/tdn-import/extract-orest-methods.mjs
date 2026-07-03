#!/usr/bin/env node
/**
 * Extrai métodos oRest da seção D do TDN → website/src/data/orest-methods.json
 * Usage: node website/scripts/tdn-import/extract-orest-methods.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {contentImportPath} from '../lib/context-root.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const TDN = contentImportPath('tlpp-rest-tdn.txt');
const OUT = path.join(ROOT, 'src/data/orest-methods.json');

const GROUPS = {
  'leitura-requisicao': {
    title: 'Leitura da requisição',
    sidebarPosition: 2,
    description: 'Extrair body, headers, path, query e metadados da URL da requisição HTTP.',
    methods: [
      'getBodyRequest',
      'getHeaderRequest',
      'getQueryRequest',
      'getPathParamsRequest',
      'getMethodRequest',
      'getPathRequest',
      'getProtocolRequest',
      'getFullURLRequest',
      'getURLRequest',
      'getConnectionRequest',
      'getClientIP',
      'getThreadIdRequest',
      'getXhrRequest',
    ],
  },
  'leitura-resposta': {
    title: 'Leitura da resposta',
    sidebarPosition: 3,
    description: 'Inspecionar body, status e headers já montados na thread (útil em OnSend e logs).',
    methods: [
      'getBodyResponse',
      'getStatusResponse',
      'getRetCodResponse',
      'getRetMsgResponse',
      'getHeaderResponse',
      'getKeyHeaderResponse',
      'existKeyHeaderResponse',
      'existKeyHeaderRequest',
      'getCloseAfterSend',
    ],
  },
  'escrita-resposta': {
    title: 'Escrita da resposta',
    sidebarPosition: 4,
    description: 'Definir body, status HTTP, chunked e resetar a mensagem de saída.',
    methods: [
      'setResponse',
      'setStatusCode',
      'setFault',
      'setChunkedResponse',
      'setLastChunkedResponse',
      'resetResponse',
      'resetMessageResponse',
      'resetStatusCode',
      'sendZipped',
    ],
  },
  'cabecalhos-resposta': {
    title: 'Cabeçalhos de resposta',
    sidebarPosition: 5,
    description: 'Criar, atualizar, concatenar ou remover headers HTTP da resposta.',
    methods: [
      'setHeaderResponse',
      'setKeyHeaderResponse',
      'updateKeyHeaderResponse',
      'appendKeyHeaderResponse',
      'deleteKeyHeaderResponse',
    ],
  },
  'pool-servidor': {
    title: 'Pool, serviço e entry point',
    sidebarPosition: 6,
    description: 'Ler TlppData, UserData, configuração do thread pool e entry points do AppServer.',
    methods: [
      'getThreadPoolTlppData',
      'getServerTlppData',
      'getThreadPoolUserData',
      'getThreadPoolServerUserData',
      'getThreadPoolEnvironment',
      'getThreadPoolName',
      'getThreadPoolId',
      'getThreadPoolType',
      'getThreadPoolStatus',
      'getThreadPoolMinThreads',
      'getThreadPoolMaxThreads',
      'getThreadPoolMinFreeThreads',
      'getThreadPoolGrowthFactor',
      'getThreadPoolInactiveTimeout',
      'getThreadPoolAcceptTimeout',
      'getThreadPoolSlaves',
      'getThreadPoolServiceId',
      'getThreadPoolServiceName',
      'getThreadPoolServicePort',
      'getThreadPoolServiceSSL',
      'getThreadPoolAuthorizationScheme',
      'getThreadPoolAuthorizationOnAuth',
      'getThreadPoolUserExitName',
      'getThreadPoolUserExitOnStart',
      'getThreadPoolUserExitOnStop',
      'getThreadPoolUserExitOnSelect',
      'getThreadPoolUserExitOnError',
      'getThreadPool_SvcId_TPType',
      'getCentryPointAuthorizationOnAuth',
      'getCentryPointAuthorizationScheme',
      'getCentryPointEnvironment',
      'getCentryPointError',
      'getCEntryPointExit',
      'getCEntryPointGrader',
      'getLentryPointAuthorization',
      'getLentryPointEnvironment',
      'getLEntryPointError',
      'getLEntryPointExit',
      'getLEntryPointGrader',
      'getUserExit',
      'setUserExit',
    ],
  },
  utilitarios: {
    title: 'Utilitários',
    sidebarPosition: 7,
    description: 'Finalizar chamada HTTP, controlar fechamento de conexão e user exits.',
    methods: ['httpCallEnd', 'setHttpEnd', 'setCloseAfterSend'],
  },
};

function norm(name) {
  return name.toLowerCase();
}

function parseMethodFromSyntax(line) {
  const m = line.match(/^(?:oRest:)?([a-zA-Z_]+)\s*\(/i);
  return m ? m[1] : null;
}

const MANUAL_SUPPLEMENTS = {
  getretmsgresponse: {
    signature: 'oRest:getRetMsgResponse()',
    summary:
      'Retorna a mensagem de retorno configurada na resposta HTTP atual — o texto que será (ou foi) enviado no body, antes ou depois de chamadas a setResponse.',
    returnType: 'String',
    returnDescription: 'Conteúdo textual da mensagem de resposta mantida em memória na thread.',
    exampleCode: `#include "tlpp-core.th"
#include "tlpp-rest.th"

@Get("/documentation/getRetMsgResponse")
User Function fGetRetMsgResponse()

Local cMsg := oRest:getRetMsgResponse()

oRest:setResponse('{"getRetMsgResponse": "' + cMsg + '"}')

Return .T.`,
    exampleFile: 'exemplo_conceitual_getRetMsgResponse.tlpp',
  },
  getthreadpooltlppdata: {
    signature: 'oRest:getThreadPoolTlppData()',
    summary:
      'Retorna o objeto JSON com a chave TlppData configurada no thread pool que atende a requisição. Usado pelo framework para recursos nativos (ex.: Authorization).',
    returnType: 'JsonObject',
    returnDescription:
      'Referência ao JSON de TlppData do pool — não manipule o objeto diretamente; leia propriedades sem alterá-las.',
    exampleCode: `#include "tlpp-core.th"
#include "tlpp-rest.th"

@Get("/documentation/getThreadPoolTlppData")
User Function fGetThreadPoolTlppData()

Local jData := oRest:getThreadPoolTlppData()
Local cResp := ""

If (ValType(jData) == "J")
    cResp := '{"TlppData": ' + jData:ToJson() + "}"
Else
    cResp := '{"TlppData": null}'
EndIf

oRest:setResponse(cResp)

Return .T.`,
    exampleFile: 'exemplo_conceitual_getThreadPoolTlppData.tlpp',
  },
  getservertlppdata: {
    signature: 'oRest:getServerTlppData()',
    summary:
      'Retorna o objeto JSON com a chave TlppData definida no nível do servidor REST (seção [general] do INI ou JSON de configuração).',
    returnType: 'JsonObject',
    returnDescription:
      'Referência ao JSON de TlppData do servidor — compartilhado entre pools; trate como somente leitura.',
    exampleCode: `#include "tlpp-core.th"
#include "tlpp-rest.th"

@Get("/documentation/getServerTlppData")
User Function fGetServerTlppData()

Local jData := oRest:getServerTlppData()
Local cResp := ""

If (ValType(jData) == "J")
    cResp := '{"ServerTlppData": ' + jData:ToJson() + "}"
Else
    cResp := '{"ServerTlppData": null}'
EndIf

oRest:setResponse(cResp)

Return .T.`,
    exampleFile: 'exemplo_conceitual_getServerTlppData.tlpp',
  },
  setlastchunkedresponse: {
    signature: 'oRest:setLastChunkedResponse( < cMessage > )',
    summary:
      'Encerra o envio chunked da resposta: envia o último pedaço do body e define Content-Length: 0 no header, sinalizando o fim da transmissão.',
    returnType: 'Logical',
    returnDescription: '.T. se o chunk final foi enviado com sucesso; .F. em caso de falha.',
    exampleFile: 'exemplo_chunked.tlpp',
    exampleCode: `#include "tlpp-core.th"
#include "tlpp-rest.th"

@Get("/chunked/ctry/:ctry")
Function u_Chunked()
Local jParams  := oRest:getPathParamsRequest() As Object
Local cContent := ""                           As Character
Local nTry     := 0                            As Numeric
Local nA       := 0                            As Numeric

If (ValType(jParams) == "J")
    nTry := Val(jParams["ctry"])
    If (nTry > 0)
        For nA := 1 To nTry
            cContent := "Chunk " + cValToChar(nA)
            If (nA == nTry)
                oRest:setLastChunkedResponse(cContent)
            Else
                oRest:setChunkedResponse(cContent)
            EndIf
        Next
    EndIf
EndIf

Return .T.`,
    note: 'Use junto com oRest:setChunkedResponse() — veja também esse método.',
  },
};

function trimExampleCode(code) {
  const lines = code.split('\n');
  const out = [];
  const stop = [
    /^OBSERVAÇÃO/i,
    /^Atenção:/i,
    /^Métodos:/i,
    /^Veja também/i,
    /^DICA DE TESTE/i,
    /^Static Function/i,
  ];
  for (const line of lines) {
    const t = line.trim();
    if (stop.some((re) => re.test(t))) break;
    out.push(line);
  }
  return out.join('\n').trim();
}

function parseMethodFromTitle(line) {
  const m = line.trim().match(/^oRest:([a-zA-Z_]+)\(\)\s*$/i);
  return m ? m[1] : null;
}

function normalizeText(text) {
  return text.replace(/\r\n/g, '\n');
}

function extractSectionD(text) {
  const normalized = normalizeText(text);
  const start = normalized.indexOf('oRest:appendKeyHeaderResponse()\nEste método');
  const end = normalized.lastIndexOf('\nE - Todas as funções\n');
  if (start < 0 || end < 0) return '';
  return normalized.slice(start, end);
}

function splitChunks(section) {
  const parts = section.split(/\nTempo aproximado para leitura: \d+ minutos?\n/);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function extractExample(chunk) {
  const lines = chunk.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (/^exemplo_[\w.-]+\.tlpp$/i.test(t)) {
      const file = t;
      const buf = [];
      i++;
      while (i < lines.length) {
        const line = lines[i];
        const lt = line.trim();
        if (/^DICA DE TESTE/i.test(lt)) break;
        if (/^Tempo aproximado/i.test(lt)) break;
        if (/^Veja também/i.test(lt)) break;
        if (/^OBSERVAÇÃO/i.test(lt)) break;
        if (/^Atenção:/i.test(lt)) break;
        if (/^Métodos:/i.test(lt)) break;
        if (/^,$/.test(lt)) break;
        if (/^oRest:[a-zA-Z]+\(\)/i.test(lt) && buf.length > 8) break;
        buf.push(line);
        i++;
      }
      return {file, code: trimExampleCode(buf.join('\n'))};
    }
  }
  return null;
}

function extractSummary(chunk, methodName) {
  const este = chunk.match(/Este método[\s\S]*?(?=\n\nSintaxe|\nSintaxe)/i);
  if (este) {
    return este[0].replace(/\s+/g, ' ').trim();
  }

  const lines = chunk.split(/\r?\n/);
  const parts = [];
  let started = false;

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      if (started && parts.length) break;
      continue;
    }
    if (/^ABRANGÊNCIA$/i.test(t)) continue;
    if (/^Disponível a partir de/i.test(t)) continue;
    if (/^oRest:[a-zA-Z_]+\(\)\s*$/i.test(t)) {
      started = true;
      continue;
    }
    if (t === 'Sintaxe') break;
    if (/^(Parâmetros|Retorno|Exemplo|ATENÇÃO|OBSERVAÇÃO|DICA)/i.test(t)) break;
    if (t.includes(`oRest:${methodName}`) && parts.length === 0) continue;
    if (/^Este método/i.test(t) || parts.length > 0) {
      parts.push(t);
      started = true;
    }
  }

  const summary = parts.join(' ').replace(/\s+/g, ' ').trim();
  return /^ABRANGÊNCIA$/i.test(summary) ? '' : summary;
}

function extractSyntax(chunk) {
  const lines = chunk.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'Sintaxe') {
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const t = lines[j].trim();
        if (/^(?:oRest:)?[a-zA-Z_]+\s*\(/i.test(t)) {
          const method = parseMethodFromSyntax(t);
          if (method && !/^oRest:/i.test(t)) {
            return `oRest:${t}`.replace(/\s+/g, ' ');
          }
          return t.replace(/\s+/g, ' ');
        }
      }
    }
  }
  return null;
}

function extractReturn(chunk) {
  const lines = chunk.split(/\r?\n/);
  let type = '';
  let desc = '';

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === 'Retorno (Output)' || t === 'Retorno') {
      const tail = lines.slice(i + 1, i + 25);
      for (const cell of tail.map((l) => l.trim()).filter(Boolean)) {
        if (/^(String|Integer|Logical|JsonObject|Json|Character|Numeric|Array)/i.test(cell)) {
          type = cell.replace(/\(.*\)/, '').trim();
          continue;
        }
        if (/^\.T\. ou \.F\./i.test(cell)) continue;
        if (/^(cKey|cValue|cBody|cMethod|jParams|lRet|cReturn|cResponse)$/i.test(cell)) {
          continue;
        }
        if (cell.length > 12 && !desc) {
          desc = cell;
          break;
        }
      }
      break;
    }
  }

  return {type: type || undefined, desc: desc || undefined};
}

function parseChunk(chunk) {
  const lines = chunk.split(/\r?\n/).map((l) => l.trim());
  let method = null;

  for (const line of lines.slice(0, 4)) {
    method = parseMethodFromTitle(line);
    if (method) break;
  }

  const syntax = extractSyntax(chunk);
  if (!method && syntax) {
    method = parseMethodFromSyntax(syntax);
  }

  if (!method) return null;

  const summary = extractSummary(chunk, method);
  const ret = extractReturn(chunk);
  const example = extractExample(chunk);

  if (!summary && !syntax) return null;

  return {
    id: method,
    name: method,
    signature: syntax || `oRest:${method}()`,
    summary: summary || `Método \`oRest:${method}()\` do namespace tlpp.rest.`,
    returnType: ret.type,
    returnDescription: ret.desc,
    exampleFile: example?.file,
    exampleCode: example?.code,
  };
}

function buildMethodIndex(section) {
  const index = new Map();
  for (const chunk of splitChunks(section)) {
    const doc = parseChunk(chunk);
    if (!doc) continue;
    const key = norm(doc.name);
    if (!index.has(key)) {
      index.set(key, doc);
    }
  }
  return index;
}

function main() {
  const text = normalizeText(fs.readFileSync(TDN, 'utf8'));
  const section = extractSectionD(text);
  const index = buildMethodIndex(section);

  const output = {
    generatedAt: new Date().toISOString().slice(0, 10),
    groups: Object.entries(GROUPS).map(([id, group]) => ({
      id,
      title: group.title,
      sidebarPosition: group.sidebarPosition,
      description: group.description,
      methods: group.methods.map((m) => {
        const doc = index.get(norm(m));
        const manual = MANUAL_SUPPLEMENTS[norm(m)];
        if (doc) {
          if (!doc.exampleCode && manual?.exampleCode) {
            return {
              ...doc,
              exampleCode: manual.exampleCode,
              exampleFile: manual.exampleFile ?? doc.exampleFile,
              note: manual.note ?? doc.note,
              summary:
                doc.summary.includes('namespace tlpp.rest') && manual?.summary
                  ? manual.summary
                  : doc.summary,
              returnType: doc.returnType ?? manual.returnType,
              returnDescription: doc.returnDescription ?? manual.returnDescription,
            };
          }
          return doc;
        }
        if (manual) return {id: m, name: m, ...manual};
        return {
          id: m,
          name: m,
          signature: `oRest:${m}()`,
          summary: 'Documentação em expansão — consulte o TDN.',
          missing: true,
        };
      }),
    })),
  };

  fs.mkdirSync(path.dirname(OUT), {recursive: true});
  fs.writeFileSync(OUT, JSON.stringify(output, null, 2), 'utf8');

  const total = output.groups.reduce((n, g) => n + g.methods.length, 0);
  const withExample = output.groups.reduce(
    (n, g) => n + g.methods.filter((m) => m.exampleCode).length,
    0,
  );
  const missing = output.groups.reduce(
    (n, g) => n + g.methods.filter((m) => m.missing).length,
    0,
  );
  console.log(
    `Wrote ${OUT} — ${total} methods, ${withExample} with examples, ${missing} missing`,
  );
}

main();
