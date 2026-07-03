import {useId, useState, type ReactNode} from 'react';
import clsx from 'clsx';

import SourceFile from '@site/src/components/SourceFile';

import styles from './styles.module.css';

export type OrestMethodData = {
  id: string;
  name: string;
  signature: string;
  summary: string;
  returnType?: string;
  returnDescription?: string;
  exampleFile?: string;
  exampleCode?: string;
  note?: string;
  missing?: boolean;
};

type Props = {
  method: OrestMethodData;
  defaultOpen?: boolean;
};

export default function OrestMethodCard({
  method,
  defaultOpen = false,
}: Props): ReactNode {
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className={styles.card} id={method.id}>
      <button
        type="button"
        className={clsx(styles.header, open && styles.headerOpen)}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}>
        <span className={styles.headerMain}>
          <span className={styles.name}>{method.name}</span>
          <span className={styles.signature}>{method.signature}</span>
        </span>
        <span className={styles.meta}>
          {method.exampleCode ? 'com exemplo' : 'referência'}
          <span className={styles.chevron} aria-hidden="true">
            {open ? '▾' : '▸'}
          </span>
        </span>
      </button>
      {open ? (
        <div id={panelId} className={styles.body}>
          <p className={styles.summary}>{method.summary}</p>
          {method.returnType || method.returnDescription ? (
            <table className={styles.returnTable}>
              <tbody>
                {method.returnType ? (
                  <tr>
                    <th>Retorno</th>
                    <td>
                      <code>{method.returnType}</code>
                    </td>
                  </tr>
                ) : null}
                {method.returnDescription ? (
                  <tr>
                    <th>Descrição</th>
                    <td>{method.returnDescription}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          ) : null}
          {method.note ? <p className={styles.note}>{method.note}</p> : null}
          {method.exampleCode ? (
            <SourceFile
              title="Exemplo"
              path={method.exampleFile ?? `${method.name}.tlpp`}
              code={method.exampleCode}
            />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
