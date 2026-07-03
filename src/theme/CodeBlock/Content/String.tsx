import React, {type ReactNode} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {
  CodeBlockContextProvider,
  type CodeBlockMetadata,
  createCodeBlockMetadata,
  parseLanguage,
  useCodeWordWrap,
} from '@docusaurus/theme-common/internal';
import type {Props} from '@theme/CodeBlock/Content/String';
import CodeBlockLayout from '@theme/CodeBlock/Layout';

import {resolveCodeLanguage} from '@site/src/prism/resolve-code-language';

/**
 * Resolve aliases de linguagem (```advpl, ```prw, ```th → tlpp) preservando
 * a indentação original do bloco — classes e métodos TLPP dependem dela.
 */
function useCodeBlockMetadata(props: Props): CodeBlockMetadata {
  const {prism} = useThemeConfig();
  const language = resolveCodeLanguage(
    props.language ?? parseLanguage(props.className),
  );

  return createCodeBlockMetadata({
    code: props.children,
    className: props.className,
    metastring: props.metastring,
    magicComments: prism.magicComments,
    defaultLanguage: prism.defaultLanguage,
    language,
    title: props.title,
    showLineNumbers: props.showLineNumbers,
  });
}

export default function CodeBlockString(props: Props): ReactNode {
  const metadata = useCodeBlockMetadata(props);
  const wordWrap = useCodeWordWrap();
  return (
    <CodeBlockContextProvider metadata={metadata} wordWrap={wordWrap}>
      <CodeBlockLayout />
    </CodeBlockContextProvider>
  );
}
