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

import {normalizeTlppCode} from '@site/src/prism/normalize-tlpp-code';
import {resolveCodeLanguage} from '@site/src/prism/resolve-code-language';

function prepareCode(
  children: Props['children'],
  language?: string,
  className?: string,
): {
  code: Props['children'];
  language?: string;
} {
  const resolved = resolveCodeLanguage(language ?? parseLanguage(className));
  if (typeof children !== 'string' || resolved !== 'tlpp') {
    return {code: children, language: resolved};
  }
  return {
    code: normalizeTlppCode(children),
    language: resolved,
  };
}

function useCodeBlockMetadata(props: Props): CodeBlockMetadata {
  const {prism} = useThemeConfig();
  const {code, language} = prepareCode(
    props.children,
    props.language,
    props.className,
  );

  return createCodeBlockMetadata({
    code,
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
