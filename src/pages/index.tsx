import type {ReactNode} from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Translate from '@docusaurus/Translate';
import SectionCard from '@site/src/components/SectionCard';
import {homeCards} from '@site/src/data/homeCards';

import styles from './index.module.css';

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div className={clsx('container', styles.heroInner)}>
            <p className={styles.platformLabel}>
              <Translate id="home.platform">plataforma</Translate>
            </p>
            <h1 className={styles.title}>
              <Translate id="home.brand">TOTVSTec</Translate>
            </h1>
            <p className={styles.subtitle}>
              <Translate id="home.tagline">
                Documentação, Exemplos e ferramentas
              </Translate>
            </p>
          </div>
        </header>

        <section className={styles.cards} aria-label="Seções">
          <div className="container">
            <div className={styles.cardsInner}>
              <div className={styles.cardGrid}>
                {homeCards.map((card) => (
                  <SectionCard
                    key={card.id}
                    to={card.to}
                    accent={card.accent}
                    title={
                      <Translate id={card.titleId}>{card.titleDefault}</Translate>
                    }
                    frontTeaser={
                      <Translate id={card.descId}>{card.descDefault}</Translate>
                    }
                    backDescription={
                      <Translate id={card.backDescId}>
                        {card.backDescDefault}
                      </Translate>
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
