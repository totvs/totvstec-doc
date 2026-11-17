import type {ReactNode} from 'react';

import {STATUS_INTRO} from './errorCatalog';
import type {ErrorInfo} from './errorCatalog';
import {STATUS_COLOR, STATUS_LABEL} from './model';
import styles from './styles.module.css';

/** Renderiza trechos entre crases como código. */
function Rich({text}: {text: string}): ReactNode {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part,
      )}
    </>
  );
}

interface Props {
  info: ErrorInfo;
  /** Texto original do report. */
  reason: string;
  /** Quantos endpoints têm esse motivo (só no quadro do filtro). */
  count?: number;
  /** Mostra a explicação geral do tipo de erro. */
  showIntro?: boolean;
}

export default function ErrorHelp({info, reason, count, showIntro}: Props): ReactNode {
  const color = STATUS_COLOR[info.status];
  return (
    <div className={styles.errHelp} style={{borderLeftColor: color}}>
      <div className={styles.errHead}>
        <span className={styles.badge} style={{background: color}}>
          {STATUS_LABEL[info.status]}
        </span>
        <code className={styles.errReason}>{reason}</code>
        {count !== undefined && (
          <span className={styles.muted}>
            {count.toLocaleString('pt-BR')} endpoint{count === 1 ? '' : 's'}
          </span>
        )}
      </div>
      {showIntro && <p className={styles.errIntro}>{STATUS_INTRO[info.status]}</p>}
      <dl className={styles.errBody}>
        <dt>Por que acontece</dt>
        <dd>
          <Rich text={info.why} />
        </dd>
        <dt>Como corrigir</dt>
        <dd>
          <Rich text={info.fix} />
        </dd>
      </dl>
    </div>
  );
}
