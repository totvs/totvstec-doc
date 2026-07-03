import type {ReactNode} from 'react';
import CodeBlock from '@theme/CodeBlock';

type Props = {
  tlpp: string;
  yaml: string;
  tlppTitle?: string;
  yamlTitle?: string;
};

export default function CodeToOpenAPI({
  tlpp,
  yaml,
  tlppTitle = 'TLPP',
  yamlTitle = 'OpenAPI (gerado)',
}: Props): ReactNode {
  return (
    <div className="code-to-openapi">
      <div className="code-to-openapi__panel">
        <div className="code-to-openapi__header">{tlppTitle}</div>
        <CodeBlock language="tlpp" showLineNumbers>
          {tlpp.trim()}
        </CodeBlock>
      </div>
      <div className="code-to-openapi__panel code-to-openapi__panel--yaml">
        <div className="code-to-openapi__header">{yamlTitle}</div>
        <CodeBlock language="yaml" showLineNumbers>
          {yaml.trim()}
        </CodeBlock>
      </div>
    </div>
  );
}
