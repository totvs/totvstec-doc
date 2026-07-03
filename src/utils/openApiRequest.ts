import type {OpenAPISchema, ParsedEndpoint} from './parseOpenApi';

export type KeyValueRow = {
  key: string;
  value: string;
  enabled: boolean;
};

export function emptyKeyValueRow(): KeyValueRow {
  return {key: '', value: '', enabled: false};
}

export type RequestResult = {
  ok: boolean;
  status: number;
  statusText: string;
  durationMs: number;
  headers: Record<string, string>;
  body: string;
  error?: string;
};

export function paramKey(inLocation: string, name: string): string {
  return `${inLocation}:${name}`;
}

export function extractPathParamNames(path: string): string[] {
  const names: string[] = [];
  const re = /\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(path)) !== null) {
    names.push(match[1]);
  }
  return names;
}

export function initPathValues(endpoint: ParsedEndpoint): Record<string, string> {
  const values: Record<string, string> = {};
  const fromPath = extractPathParamNames(endpoint.path);
  for (const name of fromPath) {
    values[name] = '';
  }
  for (const p of endpoint.parameters ?? []) {
    if (p.in === 'path' && p.name) {
      if (p.schema?.default != null) values[p.name] = String(p.schema.default);
      else if (!(p.name in values)) values[p.name] = '';
    }
  }
  return values;
}

export function initQueryRows(endpoint: ParsedEndpoint): KeyValueRow[] {
  const rows: KeyValueRow[] = (endpoint.parameters ?? [])
    .filter((p) => p.in === 'query' && p.name)
    .map((p) => ({
      key: p.name!,
      value:
        p.schema?.default != null
          ? String(p.schema.default)
          : p.schema?.enum?.[0] != null
            ? String(p.schema.enum[0])
            : '',
      enabled: true,
    }));

  return rows.length > 0 ? rows : [emptyKeyValueRow()];
}

export function initHeaderRows(endpoint: ParsedEndpoint): KeyValueRow[] {
  const specRows: KeyValueRow[] = (endpoint.parameters ?? [])
    .filter((p) => p.in === 'header' && p.name)
    .map((p) => ({
      key: p.name!,
      value: p.schema?.default != null ? String(p.schema.default) : '',
      enabled: true,
    }));

  return specRows.length > 0 ? specRows : [emptyKeyValueRow()];
}

export function resolveSchema(
  schema: OpenAPISchema | undefined,
  components?: {schemas?: Record<string, OpenAPISchema>},
): OpenAPISchema | undefined {
  if (!schema) return undefined;
  if (!schema.$ref) return schema;
  const name = schema.$ref.replace(/^#\/components\/schemas\//, '');
  return components?.schemas?.[name] ?? schema;
}

export function schemaToExample(
  schema: OpenAPISchema | undefined,
  components?: {schemas?: Record<string, OpenAPISchema>},
): unknown {
  const resolved = resolveSchema(schema, components);
  if (!resolved) return undefined;
  if (resolved.example !== undefined) return resolved.example;
  if (resolved.default !== undefined) return resolved.default;

  switch (resolved.type) {
    case 'object': {
      if (!resolved.properties) return {};
      const obj: Record<string, unknown> = {};
      for (const [key, prop] of Object.entries(resolved.properties)) {
        obj[key] = schemaToExample(prop, components);
      }
      return obj;
    }
    case 'array':
      return [];
    case 'integer':
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'string':
      return resolved.enum?.[0] != null ? String(resolved.enum[0]) : '';
    default:
      return null;
  }
}

export function getRequestBodyContentTypes(endpoint: ParsedEndpoint): string[] {
  if (!endpoint.requestBody?.content) return [];
  return Object.keys(endpoint.requestBody.content);
}

export function initRequestBody(
  endpoint: ParsedEndpoint,
  contentType: string,
  components?: {schemas?: Record<string, OpenAPISchema>},
): string {
  const schema = endpoint.requestBody?.content?.[contentType]?.schema;
  const example = schemaToExample(schema, components);
  if (example === undefined) return '';
  return JSON.stringify(example, null, 2);
}

export function buildResolvedPath(
  pathTemplate: string,
  pathValues: Record<string, string>,
): string {
  return pathTemplate.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const value = pathValues[name];
    return value !== undefined && value !== ''
      ? encodeURIComponent(value)
      : `{${name}}`;
  });
}

export function buildRequestUrl(
  baseUrl: string,
  pathTemplate: string,
  pathValues: Record<string, string>,
  queryRows: KeyValueRow[],
): string {
  const trimmedBase = baseUrl.replace(/\/+$/, '');
  const query = new URLSearchParams();

  for (const row of queryRows) {
    if (row.enabled && row.key.trim() && row.value) {
      query.set(row.key.trim(), row.value);
    }
  }

  const path = buildResolvedPath(pathTemplate, pathValues);
  const url = `${trimmedBase}${path.startsWith('/') ? path : `/${path}`}`;
  const qs = query.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function sendOpenApiRequest(options: {
  baseUrl: string;
  endpoint: ParsedEndpoint;
  pathValues: Record<string, string>;
  queryRows: KeyValueRow[];
  headerRows: KeyValueRow[];
  body: string;
  contentType: string;
}): Promise<RequestResult> {
  const {baseUrl, endpoint, pathValues, queryRows, headerRows, body, contentType} =
    options;
  const url = buildRequestUrl(baseUrl, endpoint.path, pathValues, queryRows);
  const headers = new Headers();

  for (const row of headerRows) {
    if (row.enabled && row.key.trim()) {
      headers.set(row.key.trim(), row.value);
    }
  }

  let requestBody: string | undefined;
  if (body.trim()) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', contentType || 'application/json');
    }
    requestBody = body;
  }

  const started = performance.now();

  try {
    const response = await fetch(url, {
      method: endpoint.method,
      headers,
      body: requestBody,
    });

    const responseBody = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      durationMs: Math.round(performance.now() - started),
      headers: responseHeaders,
      body: responseBody,
    };
  } catch (e) {
    const message =
      e instanceof TypeError
        ? 'Não foi possível conectar ao AppServer. Confira a URL base, se o serviço está em HTTP e se a porta está correta.'
        : e instanceof Error
          ? e.message
          : 'Erro ao enviar requisição.';

    return {
      ok: false,
      status: 0,
      statusText: 'Erro',
      durationMs: Math.round(performance.now() - started),
      headers: {},
      body: '',
      error: message,
    };
  }
}

export function formatResponseBody(raw: string): string {
  if (!raw) return '';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}
