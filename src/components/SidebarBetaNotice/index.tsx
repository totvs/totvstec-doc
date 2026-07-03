import type {ReactNode} from 'react';
import Translate from '@docusaurus/Translate';

import styles from './styles.module.css';

const TDN_LINGUAGEM = 'https://tdn.totvs.com/display/tec/Linguagem';

export default function SidebarBetaNotice(): ReactNode {
  return (
    <aside className={styles.notice} aria-label="Aviso de versão beta">
      <p className={styles.label}>
        <Translate id="sidebar.betaNotice.label">Versão beta</Translate>
      </p>
      <p className={styles.text}>
        <Translate id="sidebar.betaNotice.body">
          A referência oficial continua sendo a documentação do TDN.
        </Translate>
      </p>
      <a
        className={styles.link}
        href={TDN_LINGUAGEM}
        target="_blank"
        rel="noopener noreferrer">
        <Translate id="sidebar.betaNotice.link">Abrir no TDN</Translate>
        <svg
          className={styles.linkIcon}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden>
          <path
            d="M4.5 2.5H2.75A1.25 1.25 0 0 0 1.5 3.75v5.5c0 .69.56 1.25 1.25 1.25h5.5c.69 0 1.25-.56 1.25-1.25V7.5M7 1.5h3.5V5M5.5 6.5 10.5 1.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </aside>
  );
}
