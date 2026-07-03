import {load} from 'js-yaml';

export type OpenAPISchema = {
  type?: string;
  example?: unknown;
  default?: unknown;
  enum?: unknown[];
  properties?: Record<string, OpenAPISchema>;
  $ref?: string;
};

export type OpenAPIParameter = {
  name?: string;
  in?: string;
  description?: string;
  required?: boolean;
  schema?: OpenAPISchema;
};

export type OpenAPIResponse = {
  description?: string;
  content?: Record<string, {schema?: OpenAPISchema}>;
};

export type OpenAPIRequestBody = {
  description?: string;
  required?: boolean;
  content?: Record<string, {schema?: OpenAPISchema}>;
};

export type ParsedEndpoint = {
  path: string;
  method: string;
  summary?: string;
  description?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses?: Record<string, OpenAPIResponse>;
  operationId?: string;
};

export type ParsedSpec = {
  title: string;
  version: string;
  description?: string;
  servers: string[];
  components?: {schemas?: Record<string, OpenAPISchema>};
  endpoints: ParsedEndpoint[];
};

const HTTP_METHODS = new Set([
  'get',
  'put',
  'post',
  'delete',
  'patch',
  'head',
  'options',
  'trace',
]);

type RawOperation = {
  summary?: string;
  description?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses?: Record<string, OpenAPIResponse>;
  operationId?: string;
};

type RawSpec = {
  openapi?: string;
  swagger?: string;
  info?: {title?: string; description?: string; version?: string};
  servers?: Array<{url?: string}>;
  paths?: Record<string, Record<string, RawOperation>>;
  components?: {schemas?: Record<string, OpenAPISchema>};
};

export function parseOpenApiYaml(source: string): ParsedSpec {
  const doc = load(source) as RawSpec;

  if (!doc || typeof doc !== 'object') {
    throw new Error('YAML inválido ou vazio.');
  }

  if (!doc.paths) {
    throw new Error('Nenhum bloco "paths" encontrado — não parece um OpenAPI válido.');
  }

  const endpoints: ParsedEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method.toLowerCase())) continue;
      if (!operation || typeof operation !== 'object') continue;

      endpoints.push({
        path,
        method: method.toUpperCase(),
        summary: operation.summary,
        description: operation.description,
        parameters: operation.parameters,
        requestBody: operation.requestBody,
        responses: operation.responses,
        operationId: operation.operationId,
      });
    }
  }

  endpoints.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

  const servers =
    doc.servers
      ?.map((s) => s.url?.trim())
      .filter((url): url is string => Boolean(url)) ?? [];

  return {
    title: doc.info?.title ?? 'API',
    version: doc.info?.version ?? '—',
    description: doc.info?.description,
    servers,
    components: doc.components,
    endpoints,
  };
}
