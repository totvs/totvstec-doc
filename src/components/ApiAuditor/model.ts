/**
 * Modelo de dados do Auditor de APIs.
 *
 * - api_doc_report.json: auditoria (status de cada endpoint).
 * - api_doc.json: documentação coletada, usada para medir qualidade.
 */

export const STATUS_ORDER = ['ok', 'no_doc', 'read_error', 'generate_error'] as const;

export const STATUS_LABEL: Record<string, string> = {
  ok: 'Documentado',
  no_doc: 'Sem documentação',
  read_error: 'Erro de leitura',
  generate_error: 'Erro de exportação',
  unknown: 'Fora do report',
};

export const STATUS_COLOR: Record<string, string> = {
  ok: '#22a55b',
  no_doc: '#8a94a6',
  read_error: '#e69a14',
  generate_error: '#dc3c3c',
  unknown: '#6f7bd9',
};

export type FieldState = 'empty' | 'present' | 'invalid';

export interface ReportEntry {
  port?: number;
  endpoint: string;
  method: string;
  status: string;
  reason: string;
}

export interface ReportData {
  legend: Record<string, string>;
  entries: ReportEntry[];
  skipped: number;
}

export interface DocEntry {
  endpoint: string;
  method: string;
  title: string;
  description: string;
  descriptionLines: number;
  params: unknown;
  requestBody: unknown;
  responses: unknown;
  /** Registro cujo JSON não pôde ser interpretado. */
  parseError: boolean;
  /** Objeto original (ou texto bruto quando parseError). */
  raw: unknown;
}

export interface DocData {
  docs: DocEntry[];
  invalid: number;
}

export interface Check {
  id: string;
  label: string;
  weight: number;
  applicable: boolean;
  pass: boolean;
  detail?: string;
}

export interface Quality {
  score: number;
  band: string;
  checks: Check[];
  issues: string[];
}

export interface Row {
  key: string;
  method: string;
  endpoint: string;
  group: string;
  port?: number;
  status: string;
  reason: string;
  inReport: boolean;
  inDoc: boolean;
  doc?: DocEntry;
  quality?: Quality;
  inconsistency?: string;
}

/* ───────────── Leitura de arquivos ───────────── */

/** Decodifica em UTF-8; se houver bytes inválidos (comum em arquivos Protheus), usa windows-1252. */
export function decodeBuffer(buf: ArrayBuffer): string {
  let text: string;
  try {
    text = new TextDecoder('utf-8', {fatal: true}).decode(buf);
  } catch {
    text = new TextDecoder('windows-1252').decode(buf);
  }
  return text.replace(/^\uFEFF/, '');
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : v == null ? '' : String(v);
}

export function parseReport(text: string): ReportData {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`O arquivo não é um JSON válido (${(e as Error).message}).`);
  }
  const list = Array.isArray(json) ? json : isRecord(json) ? json.endpoints : undefined;
  if (!Array.isArray(list)) {
    throw new Error('Formato inesperado: esperava a chave "endpoints" com uma lista de endpoints.');
  }
  const entries: ReportEntry[] = [];
  let skipped = 0;
  for (const item of list) {
    if (!isRecord(item) || !str(item.endpoint)) {
      skipped++;
      continue;
    }
    entries.push({
      port: typeof item.port === 'number' ? item.port : undefined,
      endpoint: str(item.endpoint),
      method: str(item.method).toUpperCase() || '?',
      status: str(item.status) || 'unknown',
      reason: str(item.reason),
    });
  }
  const legend: Record<string, string> = {};
  if (isRecord(json) && isRecord(json.legend)) {
    for (const [k, v] of Object.entries(json.legend)) legend[k] = str(v);
  }
  return {legend, entries, skipped};
}

function toDoc(o: Record<string, unknown>, parseError: boolean, raw: unknown): DocEntry {
  const parts: {n: number; text: string}[] = [];
  for (const [k, v] of Object.entries(o)) {
    const m = /^description(\d*)$/.exec(k);
    if (m && str(v)) parts.push({n: m[1] ? Number(m[1]) : 0, text: str(v)});
  }
  parts.sort((a, b) => a.n - b.n);
  return {
    endpoint: str(o.endpoint),
    method: str(o.method).toUpperCase() || '?',
    title: str(o.title),
    description: parts.map((p) => p.text).join('\n'),
    descriptionLines: parts.length,
    params: o.params,
    requestBody: o.requestBody,
    responses: o.responses,
    parseError,
    raw,
  };
}

/** Extrai o mínimo de um registro quebrado, para ele continuar aparecendo na lista. */
function salvage(chunk: string): DocEntry | undefined {
  const pick = (name: string, next?: string) => {
    const re = next
      ? new RegExp(`"${name}"\\s*:\\s*"([\\s\\S]*?)"\\s*,\\s*"(?:${next})"`)
      : new RegExp(`"${name}"\\s*:\\s*"([^"]*)"`);
    return re.exec(chunk)?.[1] ?? '';
  };
  const endpoint = pick('endpoint');
  if (!endpoint) return undefined;
  return toDoc(
    {
      endpoint,
      method: pick('method'),
      title: pick('title'),
      description: pick('description', 'title|params|requestBody|responses'),
    },
    true,
    chunk,
  );
}

/**
 * Lê o api_doc.json. O arquivo gerado pelo AppServer pode conter JSON inválido
 * (valores vazios como `"params":,` ou strings com aspas sem escape). Primeiro tenta
 * o parse normal; se falhar, interpreta registro a registro e isola os quebrados.
 */
export function parseDocs(text: string): DocData {
  const trimmed = text.trim();
  try {
    const json: unknown = JSON.parse(trimmed);
    if (Array.isArray(json)) {
      const docs = json.filter(isRecord).map((o) => toDoc(o, false, o));
      return {docs, invalid: 0};
    }
  } catch {
    /* segue para o modo tolerante */
  }
  if (!/^\s*\[/.test(trimmed)) {
    throw new Error('Formato inesperado: esperava uma lista JSON de endpoints.');
  }
  const body = trimmed.replace(/^\[/, '').replace(/\]\s*$/, '');
  const chunks = body.split(/,\s*(?=\{\s*"endpoint"\s*:)/);
  const docs: DocEntry[] = [];
  let invalid = 0;
  for (const chunk of chunks) {
    const fixed = chunk.replace(/("\w+"\s*:)\s*(?=[,}\]])/g, '$1null');
    try {
      const o: unknown = JSON.parse(fixed);
      if (isRecord(o) && str(o.endpoint)) {
        docs.push(toDoc(o, false, o));
        continue;
      }
    } catch {
      /* registro quebrado */
    }
    invalid++;
    const rescued = salvage(chunk);
    if (rescued) docs.push(rescued);
  }
  if (!docs.length) throw new Error('Nenhum endpoint encontrado no arquivo.');
  return {docs, invalid};
}

/* ───────────── Qualidade ───────────── */

interface FieldInfo {
  state: FieldState;
  value: unknown;
}

export function analyzeField(v: unknown): FieldInfo {
  if (v === undefined || v === null) return {state: 'empty', value: null};
  let val: unknown = v;
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s) return {state: 'empty', value: null};
    if (!/^[[{]/.test(s)) return {state: 'invalid', value: s};
    try {
      val = JSON.parse(s);
    } catch {
      return {state: 'invalid', value: s};
    }
  }
  if (Array.isArray(val)) return {state: val.length ? 'present' : 'empty', value: val};
  if (isRecord(val)) return {state: Object.keys(val).length ? 'present' : 'empty', value: val};
  return {state: 'invalid', value: val};
}

export function pathParams(endpoint: string): string[] {
  const out: string[] = [];
  const re = /[:{]([A-Za-z_]\w*)\}?/g;
  let m: RegExpExecArray | null;
  const path = endpoint.split('?')[0];
  while ((m = re.exec(path))) out.push(m[1]);
  return out;
}

export const BANDS = ['Excelente', 'Boa', 'Regular', 'Crítica'] as const;

export const BAND_COLOR: Record<string, string> = {
  Excelente: '#22a55b',
  Boa: '#7fb82c',
  Regular: '#e69a14',
  Crítica: '#dc3c3c',
};

export function bandOf(score: number): string {
  if (score >= 85) return 'Excelente';
  if (score >= 60) return 'Boa';
  if (score >= 35) return 'Regular';
  return 'Crítica';
}

export const CRITERIA: {id: string; label: string; weight: number}[] = [
  {id: 'title', label: 'Título', weight: 10},
  {id: 'description', label: 'Descrição', weight: 20},
  {id: 'detail', label: 'Descrição detalhada', weight: 10},
  {id: 'params', label: 'Parâmetros', weight: 20},
  {id: 'body', label: 'Corpo da requisição', weight: 20},
  {id: 'responses', label: 'Respostas', weight: 20},
];

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);

function missingKeys(items: unknown[], keys: string[]): number {
  let n = 0;
  for (const it of items) {
    if (!isRecord(it) || keys.some((k) => !str(it[k]))) n++;
  }
  return n;
}

export function evaluate(doc: DocEntry): Quality {
  const issues: string[] = [];
  const checks: Check[] = [];
  const add = (id: string, applicable: boolean, pass: boolean, detail?: string) => {
    const c = CRITERIA.find((x) => x.id === id)!;
    checks.push({id, label: c.label, weight: c.weight, applicable, pass: applicable && pass, detail});
  };

  if (doc.parseError) {
    issues.push('O JSON deste endpoint no api_doc.json é inválido e não pôde ser interpretado.');
    for (const c of CRITERIA) {
      checks.push({...c, applicable: true, pass: false, detail: 'JSON inválido'});
    }
    return {score: 0, band: bandOf(0), checks, issues};
  }

  add('title', true, !!doc.title, doc.title ? undefined : 'Sem título');
  add('description', true, !!doc.description, doc.description ? undefined : 'Sem descrição');
  const detailed = doc.description.length >= 40 || doc.descriptionLines > 1;
  add(
    'detail',
    true,
    detailed,
    doc.description && !detailed ? `Descrição curta (${doc.description.length} caracteres)` : undefined,
  );

  // Parâmetros
  const params = analyzeField(doc.params);
  const needed = pathParams(doc.endpoint);
  let paramsOk = params.state === 'present';
  let paramsDetail: string | undefined;
  if (params.state === 'invalid') {
    paramsDetail = 'Formato inválido';
    issues.push('Campo "params" com formato inválido.');
  } else if (params.state === 'empty') {
    paramsDetail = needed.length ? `Path params sem documentação: ${needed.join(', ')}` : 'Não documentado';
  } else if (Array.isArray(params.value)) {
    const names = new Set(
      params.value.filter(isRecord).map((p) => str(p.name).toLowerCase()),
    );
    const lacking = needed.filter((n) => !names.has(n.toLowerCase()));
    if (lacking.length) {
      paramsOk = false;
      paramsDetail = `Path params sem documentação: ${lacking.join(', ')}`;
    }
    const bad = missingKeys(params.value, ['name', 'in', 'type', 'description']);
    if (bad) issues.push(`${bad} parâmetro(s) sem name, in, type ou description.`);
  }
  add('params', true, paramsOk, paramsDetail);

  // Corpo
  const bodyApplicable = BODY_METHODS.has(doc.method);
  const body = analyzeField(doc.requestBody);
  if (body.state === 'invalid') issues.push('Campo "requestBody" com formato inválido.');
  add(
    'body',
    bodyApplicable,
    body.state === 'present',
    bodyApplicable ? (body.state === 'empty' ? 'Não documentado' : body.state === 'invalid' ? 'Formato inválido' : undefined) : 'Não se aplica ao método',
  );

  // Respostas
  const resp = analyzeField(doc.responses);
  if (resp.state === 'invalid') issues.push('Campo "responses" com formato inválido.');
  if (resp.state === 'present' && Array.isArray(resp.value)) {
    const bad = missingKeys(resp.value, ['statusCode', 'description']);
    if (bad) issues.push(`${bad} resposta(s) sem statusCode ou description.`);
    const has2xx = resp.value.some((r) => isRecord(r) && /^2\d\d$/.test(str(r.statusCode)));
    if (!has2xx) issues.push('Nenhuma resposta de sucesso (2xx) documentada.');
  }
  add(
    'responses',
    true,
    resp.state === 'present',
    resp.state === 'empty' ? 'Não documentado' : resp.state === 'invalid' ? 'Formato inválido' : undefined,
  );

  const total = checks.filter((c) => c.applicable).reduce((s, c) => s + c.weight, 0);
  const got = checks.filter((c) => c.pass).reduce((s, c) => s + c.weight, 0);
  const score = total ? Math.round((got / total) * 100) : 0;
  return {score, band: bandOf(score), checks, issues};
}

/* ───────────── Cruzamento ───────────── */

export function groupOf(endpoint: string): string {
  const seg = endpoint.split('?')[0].split('/').filter(Boolean);
  if (!seg.length) return '/';
  const depth = seg.length > 1 && ['api', 'rest', 'tlpp'].includes(seg[0].toLowerCase()) ? 2 : 1;
  return '/' + seg.slice(0, depth).join('/');
}

function keyOf(method: string, endpoint: string): string {
  return `${method.toUpperCase()} ${endpoint.toLowerCase().replace(/\/+$/, '')}`;
}

export function buildRows(report?: ReportData, docs?: DocData): Row[] {
  const map = new Map<string, Row>();

  for (const e of report?.entries ?? []) {
    const key = keyOf(e.method, e.endpoint);
    map.set(key, {
      key,
      method: e.method,
      endpoint: e.endpoint,
      group: groupOf(e.endpoint),
      port: e.port,
      status: e.status,
      reason: e.reason,
      inReport: true,
      inDoc: false,
    });
  }

  for (const d of docs?.docs ?? []) {
    const key = keyOf(d.method, d.endpoint);
    let row = map.get(key);
    if (!row) {
      row = {
        key,
        method: d.method,
        endpoint: d.endpoint,
        group: groupOf(d.endpoint),
        status: 'unknown',
        reason: '',
        inReport: false,
        inDoc: false,
      };
      map.set(key, row);
    }
    row.inDoc = true;
    row.doc = d;
    row.quality = evaluate(d);
  }

  if (report && docs) {
    for (const r of map.values()) {
      if (r.inReport && !r.inDoc && r.status === 'ok') {
        r.inconsistency = 'O report indica "ok", mas o endpoint não está no api_doc.json.';
      } else if (r.inDoc && !r.inReport) {
        r.inconsistency = 'Está no api_doc.json, mas não aparece no report.';
      } else if (r.inDoc && r.inReport && r.status !== 'ok' && !r.doc?.parseError) {
        r.inconsistency = `Está no api_doc.json, mas o report indica "${r.status}".`;
      }
    }
  }

  return [...map.values()];
}

/* ───────────── Exportação ───────────── */

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '\uFEFF' + [headers, ...rows].map((r) => r.map(esc).join(';')).join('\r\n');
}

export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], {type: 'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
