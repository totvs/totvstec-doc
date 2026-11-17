import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import styles from '../OpenApiExplorerPromo/styles.module.css';

function AuditIcon(): ReactNode {
  return (
    <svg
      className={styles.iconSvg}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden>
      <rect x="6" y="6" width="36" height="36" rx="6" stroke="currentColor" strokeWidth="2" />
      <path d="M14 34V26M22 34V18M30 34V22M38 34V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const FEATURES = ['Cobertura e erros', 'Score de qualidade', 'Filtros e cruzamento', 'Exportar CSV'];

export default function ApiAuditorPromo(): ReactNode {
  return (
    <Link to="/tools/auditoria-api" className={styles.card}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.iconWrap}>
            <AuditIcon />
          </div>
          <span className={styles.badge}>Ferramenta interativa</span>
        </div>

        <h2 className={styles.title}>Auditor de documentação de APIs</h2>
        <p className={styles.description}>
          Carregue o api_doc_report.json e o api_doc.json para ver a cobertura de documentação, os endpoints com erro
          e a qualidade do que está documentado. Tudo roda no navegador.
        </p>

        <ul className={styles.features}>
          {FEATURES.map((f) => (
            <li key={f}>
              <span className={styles.featureDot} aria-hidden />
              {f}
            </li>
          ))}
        </ul>

        <span className={styles.cta}>
          Abrir auditor
          <span className={styles.ctaArrow} aria-hidden>
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
