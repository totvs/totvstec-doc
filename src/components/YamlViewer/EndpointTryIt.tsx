import {useMemo, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import type {ParsedEndpoint, ParsedSpec} from '@site/src/utils/parseOpenApi';
import {
  buildRequestUrl,
  formatResponseBody,
  getRequestBodyContentTypes,
  emptyKeyValueRow,
  initHeaderRows,
  initPathValues,
  initQueryRows,
  initRequestBody,
  sendOpenApiRequest,
  type KeyValueRow,
  type RequestResult,
} from '@site/src/utils/openApiRequest';

import styles from './styles.module.css';

type ParamTab = 'path' | 'query' | 'headers' | 'body';

type EndpointTryItProps = {
  endpoint: ParsedEndpoint;
  baseUrl: string;
  spec: ParsedSpec;
};

function KeyValueEditor({
  rows,
  onChange,
  onAdd,
  onRemove,
}: {
  rows: KeyValueRow[];
  onChange: (index: number, patch: Partial<KeyValueRow>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  const handleRemove = (index: number) => {
    if (rows.length === 1) {
      onChange(0, emptyKeyValueRow());
      return;
    }
    onRemove(index);
  };

  return (
    <div className={styles.kvEditor}>
      <div className={styles.kvTable}>
        <div className={styles.kvHeaderRow}>
          <span className={styles.kvColCheck} aria-hidden />
          <span className={styles.kvColKey}>Chave</span>
          <span className={styles.kvColVal}>Valor</span>
          <span className={styles.kvColAction} aria-hidden />
        </div>
        {rows.map((row, i) => (
          <div key={i} className={styles.kvRow}>
            <div className={styles.kvColCheck}>
              <input
                type="checkbox"
                className={styles.kvCheck}
                checked={row.enabled}
                onChange={(e) => onChange(i, {enabled: e.target.checked})}
                aria-label="Incluir"
              />
            </div>
            <div className={styles.kvColKey}>
              <input
                type="text"
                className={styles.kvInput}
                placeholder="nome"
                value={row.key}
                onChange={(e) => onChange(i, {key: e.target.value})}
              />
            </div>
            <div className={styles.kvColVal}>
              <input
                type="text"
                className={styles.kvInput}
                placeholder="valor"
                value={row.value}
                onChange={(e) => onChange(i, {value: e.target.value})}
              />
            </div>
            <div className={styles.kvColAction}>
              <button
                type="button"
                className={styles.kvRemove}
                onClick={() => handleRemove(i)}
                aria-label="Remover">
                ×
              </button>
            </div>
          </div>
        ))}
        <button type="button" className={styles.kvAddRow} onClick={onAdd}>
          <span className={styles.kvAddIcon} aria-hidden>+</span>
          <Translate id="yamlViewer.try.addRow">Adicionar linha</Translate>
        </button>
      </div>
    </div>
  );
}

function ResponsePanel({result}: {result: RequestResult}) {
  const formattedBody = useMemo(() => formatResponseBody(result.body), [result.body]);

  if (result.error) {
    return (
      <div className={styles.tryResponseError} role="alert">
        {result.error}
      </div>
    );
  }

  const statusClass =
    result.status >= 200 && result.status < 300
      ? styles.statusSuccess
      : result.status >= 400
        ? styles.statusError
        : styles.statusOther;

  return (
    <div className={styles.tryResponse}>
      <div className={styles.tryResponseMeta}>
        <span className={clsx(styles.statusBadge, statusClass)}>
          {result.status} {result.statusText}
        </span>
        <span className={styles.duration}>{result.durationMs} ms</span>
      </div>
      {formattedBody ? (
        <pre className={styles.responseBody}>{formattedBody}</pre>
      ) : (
        <p className={styles.responseEmpty}>
          <Translate id="yamlViewer.try.emptyResponse">Resposta vazia</Translate>
        </p>
      )}
    </div>
  );
}

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function defaultTab(endpoint: ParsedEndpoint, pathCount: number): ParamTab {
  if (pathCount > 0) return 'path';
  if ((endpoint.parameters ?? []).some((p) => p.in === 'query')) return 'query';
  if (BODY_METHODS.has(endpoint.method) || endpoint.requestBody) return 'body';
  return 'query';
}

export default function EndpointTryIt({endpoint, baseUrl, spec}: EndpointTryItProps): ReactNode {
  const contentTypes = useMemo(() => getRequestBodyContentTypes(endpoint), [endpoint]);
  const [contentType, setContentType] = useState(contentTypes[0] ?? 'application/json');
  const [pathValues, setPathValues] = useState(() => initPathValues(endpoint));
  const [queryRows, setQueryRows] = useState(() => initQueryRows(endpoint));
  const [headerRows, setHeaderRows] = useState(() => initHeaderRows(endpoint));
  const [body, setBody] = useState(() =>
    initRequestBody(endpoint, contentTypes[0] ?? 'application/json', spec.components),
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RequestResult | null>(null);

  const pathParamNames = Object.keys(pathValues);
  const activeQueryCount = queryRows.filter((r) => r.enabled && r.key.trim()).length;
  const activeHeaderCount = headerRows.filter((r) => r.enabled && r.key.trim()).length;
  const [activeTab, setActiveTab] = useState<ParamTab>(() =>
    defaultTab(endpoint, pathParamNames.length),
  );

  const previewUrl = useMemo(
    () => buildRequestUrl(baseUrl, endpoint.path, pathValues, queryRows),
    [baseUrl, endpoint.path, pathValues, queryRows],
  );

  const handleContentTypeChange = (next: string) => {
    setContentType(next);
    setBody(initRequestBody(endpoint, next, spec.components));
  };

  const handleSend = async () => {
    if (!baseUrl.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await sendOpenApiRequest({
      baseUrl: baseUrl.trim(),
      endpoint,
      pathValues,
      queryRows,
      headerRows,
      body,
      contentType,
    });
    setResult(res);
    setLoading(false);
  };

  const tabs: {id: ParamTab; label: string; count?: number}[] = [];
  if (pathParamNames.length > 0) tabs.push({id: 'path', label: 'Path'});
  tabs.push({id: 'query', label: 'Query', count: activeQueryCount || undefined});
  tabs.push({id: 'headers', label: 'Headers', count: activeHeaderCount || undefined});
  tabs.push({id: 'body', label: 'Body'});

  return (
    <div className={styles.tryIt}>
      <div className={styles.tryUrlGroup}>
        <span className={styles.tryRequestUrl}>{previewUrl}</span>
        <button
          type="button"
          className={styles.btnSend}
          onClick={handleSend}
          disabled={loading || !baseUrl.trim()}>
          {loading ? (
            <Translate id="yamlViewer.try.sending">Enviando…</Translate>
          ) : (
            <Translate id="yamlViewer.try.send">Enviar</Translate>
          )}
        </button>
      </div>

      <div className={styles.tryParamsBlock}>
        <div className={styles.tryParamTabs} role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={clsx(styles.tryParamTab, activeTab === tab.id && styles.tryParamTabActive)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className={styles.tryParamCount}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.tryParamPanel} role="tabpanel">
          {activeTab === 'path' && (
            <div className={styles.tryFieldGrid}>
              {pathParamNames.map((name) => (
                <label key={name} className={styles.tryField}>
                  <span className={styles.tryFieldLabel}>{name}</span>
                  <input
                    type="text"
                    className={styles.tryInput}
                    value={pathValues[name] ?? ''}
                    placeholder="valor"
                    onChange={(e) =>
                      setPathValues((v) => ({...v, [name]: e.target.value}))
                    }
                  />
                </label>
              ))}
            </div>
          )}

          {activeTab === 'query' && (
            <KeyValueEditor
              rows={queryRows}
              onChange={(i, patch) =>
                setQueryRows((rows) => rows.map((r, idx) => (idx === i ? {...r, ...patch} : r)))
              }
              onAdd={() => setQueryRows((rows) => [...rows, emptyKeyValueRow()])}
              onRemove={(i) => setQueryRows((rows) => rows.filter((_, idx) => idx !== i))}
            />
          )}

          {activeTab === 'headers' && (
            <KeyValueEditor
              rows={headerRows}
              onChange={(i, patch) =>
                setHeaderRows((rows) => rows.map((r, idx) => (idx === i ? {...r, ...patch} : r)))
              }
              onAdd={() => setHeaderRows((rows) => [...rows, emptyKeyValueRow()])}
              onRemove={(i) => setHeaderRows((rows) => rows.filter((_, idx) => idx !== i))}
            />
          )}

          {activeTab === 'body' && (
            <div className={styles.tryBodyPanel}>
              {contentTypes.length > 1 && (
                <select
                  className={styles.trySelect}
                  value={contentType}
                  onChange={(e) => handleContentTypeChange(e.target.value)}
                  aria-label="Content-Type">
                  {contentTypes.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              )}
              <textarea
                className={styles.tryBody}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                spellCheck={false}
                placeholder={
                  endpoint.method === 'GET' && !endpoint.requestBody
                    ? 'Vazio para GET'
                    : '{}'
                }
              />
            </div>
          )}
        </div>
      </div>

      {result && <ResponsePanel result={result} />}
    </div>
  );
}
