import {useId, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import CodeBlock from '@theme/CodeBlock';

import {detectCodeLanguage} from '@site/src/prism/detect-language';
import {resolveCodeLanguage} from '@site/src/prism/resolve-code-language';
import {normalizeTlppCode} from '@site/src/prism/normalize-tlpp-code';

import styles from './styles.module.css';

type Props = {
  title: string;
  path: string;
  code: string;
  language?: string;
  defaultOpen?: boolean;
};

export default function SourceFile({
  title,
  path,
  code,
  language,
  defaultOpen = false,
}: Props): ReactNode {
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const resolvedLanguage = resolveCodeLanguage(
    detectCodeLanguage(path, language),
  );
  const displayCode =
    resolveCodeLanguage(resolvedLanguage) === 'tlpp'
      ? normalizeTlppCode(code)
      : code.trim();
  const lineCount = displayCode ? displayCode.split('\n').length : 0;

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={clsx(styles.header, open && styles.headerOpen)}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}>
        <span className={styles.headerMain}>
          <span className={styles.title}>{title}</span>
          <span className={styles.path}>{path}</span>
        </span>
        <span className={styles.meta}>
          {lineCount} linhas
          <span className={styles.chevron} aria-hidden="true">
            {open ? '▾' : '▸'}
          </span>
        </span>
      </button>
      {open ? (
        <div id={panelId} className={styles.panel}>
          <CodeBlock
            language={resolvedLanguage}
            showLineNumbers
            title={path}
            className={styles.codeBlock}>
            {displayCode}
          </CodeBlock>
        </div>
      ) : null}
    </div>
  );
}
