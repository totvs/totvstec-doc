import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';

import styles from './styles.module.css';

function OpenApiIcon(): ReactNode {
  return (
    <svg
      className={styles.iconSvg}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden>
      <rect x="4" y="8" width="40" height="32" rx="6" stroke="currentColor" strokeWidth="2" />
      <path d="M14 20h8M14 26h12M14 32h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="34" cy="26" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M32 26l1.5 1.5L36 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FEATURES = [
  {id: 'paste', label: 'Colar YAML'},
  {id: 'upload', label: 'Upload de arquivo'},
  {id: 'browse', label: 'Navegar endpoints'},
  {id: 'try', label: 'Disparar requisições'},
] as const;

export default function OpenApiExplorerPromo(): ReactNode {
  return (
    <Link to="/tools/explorador-openapi" className={styles.card}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.iconWrap}>
            <OpenApiIcon />
          </div>
          <span className={styles.badge}>
            <Translate id="tools.openapi.badge">Ferramenta interativa</Translate>
          </span>
        </div>

        <h2 className={styles.title}>
          <Translate id="tools.openapi.title">Explorador OpenAPI</Translate>
        </h2>
        <p className={styles.description}>
          <Translate id="tools.openapi.description">
            Cole ou envie o YAML gerado pelo tlpp.doc.generate() e navegue pelos endpoints,
            parâmetros e respostas da sua API — sem precisar subir o AppServer.
          </Translate>
        </p>

        <ul className={styles.features}>
          {FEATURES.map((f) => (
            <li key={f.id}>
              <span className={styles.featureDot} aria-hidden />
              <Translate id={`tools.openapi.feature.${f.id}`}>{f.label}</Translate>
            </li>
          ))}
        </ul>

        <span className={styles.cta}>
          <Translate id="tools.openapi.cta">Abrir explorador</Translate>
          <span className={styles.ctaArrow} aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
