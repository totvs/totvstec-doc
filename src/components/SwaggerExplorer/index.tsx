import {useCallback, useState, type ChangeEvent, type DragEvent, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {load as yamlLoad} from 'js-yaml';

import styles from './styles.module.css';

type InputMode = 'paste' | 'upload';

function SwaggerUIRenderer({spec}: {spec: Record<string, unknown>}) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SwaggerUI = require('swagger-ui-react').default;
  require('swagger-ui-react/swagger-ui.css');

  return (
    <div className={styles.swaggerWrapper}>
      <SwaggerUI spec={spec} />
    </div>
  );
}

export default function SwaggerExplorer(): ReactNode {
  const [yamlText, setYamlText] = useState('');
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('paste');

  const parse = useCallback((source: string) => {
    try {
      if (!source.trim()) {
        setError('Cole um YAML ou JSON OpenAPI para visualizar.');
        setSpec(null);
        return;
      }
      const parsed = yamlLoad(source) as Record<string, unknown>;
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('O conteúdo não é um objeto OpenAPI válido.');
      }
      setSpec(parsed);
      setError(null);
    } catch (e) {
      setSpec(null);
      setError(e instanceof Error ? e.message : 'Erro ao interpretar o YAML/JSON.');
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

  const handleClear = () => {
    setYamlText('');
    setSpec(null);
    setError(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/tools" className={styles.backLink}>
          ? Tools
        </Link>
      </div>

      <header className={styles.hero}>
        <span className={styles.heroBadge}>Swagger UI</span>
        <h1>Explorador OpenAPI</h1>
        <p>
          Cole ou envie o YAML/JSON da sua API e visualize a documentação interativa
          com Swagger UI — diretamente no navegador, sem backend.
        </p>
      </header>

      {/* Input area */}
      <section className={styles.workspace}>
        <div className={styles.inputTabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'paste'}
            className={clsx(styles.inputTab, inputMode === 'paste' && styles.inputTabActive)}
            onClick={() => setInputMode('paste')}>
            Colar YAML / JSON
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'upload'}
            className={clsx(styles.inputTab, inputMode === 'upload' && styles.inputTabActive)}
            onClick={() => setInputMode('upload')}>
            Upload de arquivo
          </button>
        </div>

        <div className={styles.inputPanel}>
          {inputMode === 'paste' ? (
            <textarea
              id="yaml-input"
              className={styles.textarea}
              value={yamlText}
              onChange={(e) => setYamlText(e.target.value)}
              placeholder={'openapi: 3.0.3\ninfo:\n  title: Minha API\n  version: 1.0.0\npaths:\n  /rest/...'}
              spellCheck={false}
              aria-label="YAML ou JSON OpenAPI"
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
              <input
                type="file"
                accept=".yaml,.yml,.json,application/json,text/yaml"
                onChange={onFileInput}
              />
              <span className={styles.dropzoneIcon} aria-hidden>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 16V4m0 0L8 8m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.dropzoneTitle}>
                Arraste um .yaml ou .json aqui, ou clique para selecionar
              </span>
              <span className={styles.dropzoneHint}>.yaml, .yml, .json</span>
            </label>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnPrimary} onClick={handleVisualize}>
            Visualizar
          </button>
          {spec && (
            <button type="button" className={styles.btnSecondary} onClick={handleClear}>
              Limpar
            </button>
          )}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {/* Swagger UI Output */}
      {spec && (
        <section className={styles.swaggerSection}>
          <BrowserOnly fallback={<div className={styles.loading}>Carregando Swagger UI...</div>}>
            {() => <SwaggerUIRenderer spec={spec} />}
          </BrowserOnly>
        </section>
      )}

      {/* Empty state */}
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
            Cole seu YAML/JSON ou faça upload de um arquivo para visualizar a documentação
            interativa da sua API.
          </p>
        </div>
      )}
    </div>
  );
}
