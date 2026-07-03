import {useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import type {OpenAPIParameter, ParsedEndpoint, ParsedSpec} from '@site/src/utils/parseOpenApi';

import EndpointTryIt from './EndpointTryIt';
import styles from './styles.module.css';

const METHOD_CLASS: Record<string, string> = {
  GET: styles.methodGet,
  PUT: styles.methodPut,
  POST: styles.methodPost,
  DELETE: styles.methodDelete,
  PATCH: styles.methodPatch,
};

function MethodBadge({method}: {method: string}) {
  return (
    <span className={clsx(styles.method, METHOD_CLASS[method] ?? styles.methodDefault)}>
      {method}
    </span>
  );
}

function ParamsTable({parameters}: {parameters: OpenAPIParameter[]}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Em</th>
            <th>Tipo</th>
            <th>Obrig.</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((p, i) => (
            <tr key={`${p.name}-${p.in}-${i}`}>
              <td><code>{p.name}</code></td>
              <td>{p.in}</td>
              <td>{p.schema?.type ?? '—'}</td>
              <td>{p.required ? 'sim' : '—'}</td>
              <td>{p.description ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type EndpointTab = 'try' | 'docs';

type EndpointCardProps = {
  endpoint: ParsedEndpoint;
  baseUrl: string;
  spec: ParsedSpec;
};

export default function EndpointCard({endpoint, baseUrl, spec}: EndpointCardProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<EndpointTab>('try');
  const params = endpoint.parameters?.filter((p) => p.name) ?? [];
  const responses = endpoint.responses ?? {};
  const hasDocs =
    Boolean(endpoint.description) ||
    params.length > 0 ||
    Object.keys(responses).length > 0;

  return (
    <article className={clsx(styles.endpointCard, open && styles.endpointCardOpen)}>
      <button
        type="button"
        className={styles.endpointHeader}
        onClick={() => {
          setOpen((v) => !v);
          if (open) setTab('try');
        }}
        aria-expanded={open}>
        <MethodBadge method={endpoint.method} />
        <span className={styles.path}>{endpoint.path}</span>
        {!open && endpoint.summary && (
          <span className={styles.summary}>{endpoint.summary}</span>
        )}
        <span className={clsx(styles.chevron, open && styles.chevronOpen)} aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className={styles.endpointBody}>
          {hasDocs && (
            <div className={styles.endpointTabs} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'try'}
                className={clsx(styles.endpointTab, tab === 'try' && styles.endpointTabActive)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setTab('try')}>
                <Translate id="yamlViewer.tab.try">Testar</Translate>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'docs'}
                className={clsx(styles.endpointTab, tab === 'docs' && styles.endpointTabActive)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setTab('docs')}>
                <Translate id="yamlViewer.tab.docs">Documentação</Translate>
              </button>
            </div>
          )}

          {tab === 'try' || !hasDocs ? (
            <EndpointTryIt endpoint={endpoint} baseUrl={baseUrl} spec={spec} />
          ) : (
            <div className={styles.docsPanel}>
              {endpoint.description && (
                <p className={styles.description}>{endpoint.description}</p>
              )}
              {params.length > 0 && (
                <section className={styles.endpointSection}>
                  <h4 className={styles.sectionTitle}>Parâmetros</h4>
                  <ParamsTable parameters={params} />
                </section>
              )}
              {Object.keys(responses).length > 0 && (
                <section className={styles.endpointSection}>
                  <h4 className={styles.sectionTitle}>Respostas</h4>
                  <ul className={styles.responseList}>
                    {Object.entries(responses).map(([code, res]) => (
                      <li key={code} className={styles.responseBadge}>
                        <span className={styles.responseCode}>{code}</span>
                        <span className={styles.responseDesc}>{res.description ?? '—'}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
