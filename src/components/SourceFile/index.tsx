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
  const langLabel = (resolvedLanguage ?? 'text').toUpperCase();

  return (
    <div className={clsx(styles.wrap, open && styles.wrapOpen)}>
      <button
        type="button"
        className={clsx(styles.header, open && styles.headerOpen)}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}>
        <span className={styles.headerMain}>
          <span className={styles.titleRow}>
            <span className={styles.title}>{title}</span>
            <span className={styles.lang}>{langLabel}</span>
          </span>
          <span className={styles.path}>{path}</span>
        </span>
        <span className={styles.meta}>
          <span className={styles.lines}>{lineCount} linhas</span>
          <span className={styles.chevron} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round">
              {open ? (
                <path d="M6 9l6 6 6-6" />
              ) : (
                <path d="M9 6l6 6-6 6" />
              )}
            </svg>
          </span>
        </span>
      </button>
      {open ? (
        <div id={panelId} className={styles.panel}>
          <CodeBlock
            language={resolvedLanguage}
            showLineNumbers
            className={styles.codeBlock}>
            {displayCode}
          </CodeBlock>
        </div>
      ) : null}
    </div>
  );
}
