import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import {
  getExternalRepo,
  githubRawUrl,
} from '@site/src/data/external-repos';
import {parseOpenApiYaml} from '@site/src/utils/parseOpenApi';

import EndpointCard from './EndpointCard';
import styles from './styles.module.css';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
const DEFAULT_BASE_URL = 'http://localhost:8080';

const METHOD_CLASS: Record<string, string> = {
  GET: styles.methodGet,
  PUT: styles.methodPut,
  POST: styles.methodPost,
  DELETE: styles.methodDelete,
  PATCH: styles.methodPatch,
};

const SAMPLE_REPO = getExternalRepo('doc-generate');
const SAMPLE_YAML_URL = githubRawUrl(SAMPLE_REPO, SAMPLE_REPO.openApiPath!);

type InputMode = 'paste' | 'upload';

export default function YamlViewer(): ReactNode {
  const [yamlText, setYamlText] = useState('');
  const [spec, setSpec] = useState<ReturnType<typeof parseOpenApiYaml> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('paste');
  const [loadingSample, setLoadingSample] = useState(false);
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);

  const parse = useCallback((source: string) => {
    try {
      const parsed = parseOpenApiYaml(source);
      setSpec(parsed);
      setError(null);
      setMethodFilter(null);
      if (parsed.servers[0]) {
        setBaseUrl(parsed.servers[0]);
      }
    } catch (e) {
      setSpec(null);
      setError(e instanceof Error ? e.message : 'Erro ao interpretar o YAML.');
    }
  }, []);

  const handleVisualize = () => parse(yamlText);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? '');
        setYamlText(text);
        parse(text);
      };
      reader.readAsText(file);
    },
    [parse],
  );

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const loadSample = async () => {
    setLoadingSample(true);
    setError(null);
    try {
      const res = await fetch(SAMPLE_YAML_URL);
      if (!res.ok) throw new Error('Não foi possível carregar o exemplo do repositório.');
      const text = await res.text();
      setYamlText(text);
      parse(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar exemplo.');
    } finally {
      setLoadingSample(false);
    }
  };

  const methodCounts = useMemo(() => {
    if (!spec) return new Map<string, number>();
    const counts = new Map<string, number>();
    for (const ep of spec.endpoints) {
      counts.set(ep.method, (counts.get(ep.method) ?? 0) + 1);
    }
    return counts;
  }, [spec]);

  const filtered = useMemo(() => {
    if (!spec) return [];
    const q = filter.trim().toLowerCase();
    return spec.endpoints.filter((ep) => {
      if (methodFilter && ep.method !== methodFilter) return false;
      if (!q) return true;
      return (
        ep.path.toLowerCase().includes(q) ||
        ep.method.toLowerCase().includes(q) ||
        ep.summary?.toLowerCase().includes(q) ||
        ep.description?.toLowerCase().includes(q)
      );
    });
  }, [spec, filter, methodFilter]);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/tools" className={styles.backLink}>
          <Translate id="yamlViewer.back">← Tools</Translate>
        </Link>
      </div>

      <header className={styles.hero}>
        <span className={styles.heroBadge}>OpenAPI 3.x</span>
        <h1>
          <Translate id="yamlViewer.title">Explorador OpenAPI</Translate>
        </h1>
        <p>
          <Translate id="yamlViewer.subtitle">
            Cole ou envie o YAML gerado pelo tlpp.doc.generate(), navegue pelos endpoints e
            dispare requisições reais contra o seu AppServer.
          </Translate>
        </p>
      </header>

      <section className={styles.workspace} aria-label="Entrada de YAML">
        <div className={styles.inputTabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'paste'}
            className={clsx(styles.inputTab, inputMode === 'paste' && styles.inputTabActive)}
            onClick={() => setInputMode('paste')}>
            <Translate id="yamlViewer.paste">Colar YAML</Translate>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'upload'}
            className={clsx(styles.inputTab, inputMode === 'upload' && styles.inputTabActive)}
            onClick={() => setInputMode('upload')}>
            <Translate id="yamlViewer.upload">Upload de arquivo</Translate>
          </button>
        </div>

        <div className={styles.inputPanel}>
          {inputMode === 'paste' ? (
            <textarea
              id="yaml-input"
              className={styles.textarea}
              value={yamlText}
              onChange={(e) => setYamlText(e.target.value)}
              placeholder="openapi: 3.0.3&#10;info:&#10;  title: Minha API&#10;  version: 1.0.0&#10;paths:&#10;  /rest/..."
              spellCheck={false}
              aria-label="YAML OpenAPI"
            />
          ) : (
            <label
              className={clsx(styles.dropzone, dragActive && styles.dropzoneActive)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}>
              <input type="file" accept=".yaml,.yml,text/yaml" onChange={onFileInput} />
              <span className={styles.dropzoneIcon} aria-hidden>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 16V4m0 0L8 8m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.dropzoneTitle}>
                <Translate id="yamlViewer.dropHint">
                  Arraste um .yaml aqui ou clique para selecionar
                </Translate>
              </span>
              <span className={styles.dropzoneHint}>.yaml, .yml</span>
            </label>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnPrimary} onClick={handleVisualize}>
            <Translate id="yamlViewer.visualize">Visualizar</Translate>
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={loadSample}
            disabled={loadingSample}>
            {loadingSample ? (
              <Translate id="yamlViewer.sampleLoading">Carregando…</Translate>
            ) : (
              <Translate id="yamlViewer.sample">Carregar exemplo do repositório</Translate>
            )}
          </button>
        </div>
      </section>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {spec && (
        <section className={styles.results} aria-label="Endpoints">
          <div className={styles.specMeta}>
            <div className={styles.specInfo}>
              <h2>{spec.title}</h2>
              <p className={styles.specVersion}>v{spec.version}</p>
            </div>
            <div className={styles.specStats}>
              <span className={styles.statChip}>
                <strong>{spec.endpoints.length}</strong>
                <Translate id="yamlViewer.endpointCount">endpoints</Translate>
              </span>
            </div>
          </div>

          <div className={styles.baseUrlPanel}>
            <label htmlFor="base-url" className={styles.baseUrlLabel}>
              <Translate id="yamlViewer.baseUrl">URL base do AppServer</Translate>
            </label>
            <input
              id="base-url"
              type="url"
              className={styles.baseUrlInput}
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:8080"
            />
            <p className={styles.baseUrlHint}>
              <Translate id="yamlViewer.baseUrlHint">
                Use HTTP. Na mesma máquina: localhost. De outro PC na rede: IP do servidor (ex.:
                http://192.168.3.12:8080).
              </Translate>
            </p>
          </div>

          <div className={styles.filters}>
            <input
              type="search"
              className={styles.search}
              placeholder="Filtrar por path, método ou descrição…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filtrar endpoints"
            />
            <div className={styles.methodFilters} role="group" aria-label="Filtrar por método HTTP">
              <button
                type="button"
                className={clsx(styles.methodChip, !methodFilter && styles.methodChipActive)}
                onClick={() => setMethodFilter(null)}>
                Todos
              </button>
              {HTTP_METHODS.filter((m) => methodCounts.has(m)).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={clsx(
                    styles.methodChip,
                    methodFilter === m && styles.methodChipActive,
                    METHOD_CLASS[m],
                  )}
                  onClick={() => setMethodFilter(methodFilter === m ? null : m)}>
                  {m}
                  <span className={styles.methodChipCount}>{methodCounts.get(m)}</span>
                </button>
              ))}
            </div>
          </div>

          <p className={styles.resultCount}>
            {filtered.length} de {spec.endpoints.length} endpoints
          </p>

          <div className={styles.endpointList}>
            {filtered.length === 0 ? (
              <p className={styles.empty}>
                <Translate id="yamlViewer.noMatch">Nenhum endpoint corresponde ao filtro.</Translate>
              </p>
            ) : (
              filtered.map((ep) => (
                <EndpointCard
                  key={`${ep.method}-${ep.path}`}
                  endpoint={ep}
                  baseUrl={baseUrl}
                  spec={spec}
                />
              ))
            )}
          </div>
        </section>
      )}

      {!spec && !error && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden>
            <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="8" y="12" width="48" height="40" rx="6" />
              <path d="M18 24h12M18 32h20M18 40h8" strokeLinecap="round" />
              <circle cx="46" cy="32" r="8" />
            </svg>
          </div>
          <p>
            <Translate id="yamlViewer.empty">
              Cole seu YAML, faça upload ou carregue o exemplo do repositório para começar.
            </Translate>
          </p>
        </div>
      )}
    </div>
  );
}
