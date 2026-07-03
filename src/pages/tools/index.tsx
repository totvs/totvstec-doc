import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Translate from '@docusaurus/Translate';
import OpenApiExplorerPromo from '@site/src/components/OpenApiExplorerPromo';

import styles from './tools.module.css';

export default function TlppToolsPage(): ReactNode {
  return (
    <Layout
      title="Tools"
      description="Ferramentas no navegador para desenvolvedores TLPP.">
      <main className={styles.page}>
        <div className={styles.hero}>
          <div className="container">
            <p className={styles.eyebrow}>
              <Translate id="tools.eyebrow">Ferramentas para o ecossistema TLPP</Translate>
            </p>
            <h1 className={styles.title}>
              <Translate id="tools.pageTitle">Tools</Translate>
            </h1>
            <p className={styles.lead}>
              <Translate id="tools.lead">
                Ferramentas no navegador para explorar documentação OpenAPI e acelerar o
                desenvolvimento com TLPP — sem depender do AppServer local.
              </Translate>
            </p>
          </div>
        </div>

        <div className="container">
          <section className={styles.featured} aria-label="Ferramentas disponíveis">
            <OpenApiExplorerPromo />
          </section>

          <p className={styles.back}>
            <Link to="/">
              <Translate id="tools.backHome">← Voltar ao menu principal</Translate>
            </Link>
          </p>
        </div>
      </main>
    </Layout>
  );
}
