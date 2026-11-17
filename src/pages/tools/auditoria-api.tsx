import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import ApiAuditor from '@site/src/components/ApiAuditor';

import styles from './tools.module.css';

export default function AuditoriaApiPage(): ReactNode {
  return (
    <Layout
      title="Auditor de documentação de APIs"
      description="Audite a cobertura e meça a qualidade da documentação dos endpoints REST a partir do api_doc_report.json e do api_doc.json.">
      <main className={styles.page}>
        <div className={styles.hero}>
          <div className="container">
            <p className={styles.eyebrow}>Ferramentas para o ecossistema TLPP</p>
            <h1 className={styles.title}>Auditor de documentação de APIs</h1>
            <p className={styles.lead}>
              Carregue o api_doc_report.json para auditar quais endpoints estão documentados, sem documentação ou
              com erro, e o api_doc.json para medir a qualidade do que foi documentado.
            </p>
          </div>
        </div>

        <div className="container">
          <ApiAuditor />
          <p className={styles.back}>
            <Link to="/tools">← Voltar para Tools</Link>
          </p>
        </div>
      </main>
    </Layout>
  );
}
