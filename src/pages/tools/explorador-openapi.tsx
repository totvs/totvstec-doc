import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import SwaggerExplorer from '@site/src/components/SwaggerExplorer';

export default function ExploradorOpenApiPage(): ReactNode {
  return (
    <Layout
      title="Explorador OpenAPI"
      description="Cole ou envie YAML/JSON OpenAPI e visualize a documentacao interativa com Swagger UI."
      wrapperClassName="swagger-explorer-layout">
      <SwaggerExplorer />
    </Layout>
  );
}
