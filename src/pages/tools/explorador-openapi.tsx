import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import YamlViewer from '@site/src/components/YamlViewer';

export default function ExploradorOpenApiPage(): ReactNode {
  return (
    <Layout
      title="Explorador OpenAPI"
      description="Cole ou envie YAML OpenAPI e navegue pelos endpoints da sua API.">
      <YamlViewer />
    </Layout>
  );
}
