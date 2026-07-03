import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useColorMode} from '@docusaurus/theme-common';
import Translate from '@docusaurus/Translate';
import type {HomeCardAccent} from '@site/src/data/homeCards';
import styles from './styles.module.css';

export type SectionCardProps = {
  title: ReactNode;
  to: string;
  /** Verso do flip card (home). Sem isso, renderiza card simples (docs). */
  backDescription?: ReactNode;
  backHighlights?: ReactNode[];
  /** Resumo na frente do flip card (home). */
  frontTeaser?: ReactNode;
  /** Frente do card simples (docs). */
  description?: ReactNode;
  accent?: HomeCardAccent;
  badge?: ReactNode;
};

export default function SectionCard({
  title,
  backDescription,
  backHighlights = [],
  frontTeaser,
  description,
  to,
  accent = 'rest',
  badge,
}: SectionCardProps) {
  const {colorMode} = useColorMode();
  const logoWhite = useBaseUrl('/img/totvs/totvs-logo-white.svg');
  const logoColor = useBaseUrl('/img/totvs/totvs-logo.svg');
  const frontLogoSrc = colorMode === 'dark' ? logoWhite : logoColor;
  const isFlip = backDescription != null;

  if (!isFlip) {
    return (
      <Link
        to={to}
        className={clsx(
          styles.card,
          styles.cardSimple,
          styles[`accent_${accent}`],
          'section-card',
        )}>
        <span className={styles.accentBar} aria-hidden />
        <div className={styles.simpleBody}>
          {badge && <span className={styles.badge}>{badge}</span>}
          <h3 className={styles.simpleTitle}>{title}</h3>
          {description && <p className={styles.simpleDescription}>{description}</p>}
          <div className={styles.simpleFooter}>
            <span className={styles.simpleCta}>
              <Translate id="home.card.cta">Acessar seção</Translate>
            </span>
            <span className={styles.arrowBtn} aria-hidden>
              →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={clsx(styles.card, styles[`accent_${accent}`], 'section-card')}>
      <div className={styles.flipInner}>
        <div className={styles.front}>
          <img
            className={styles.frontLogo}
            src={frontLogoSrc}
            alt=""
            aria-hidden
          />
          <div className={styles.frontBody}>
            {badge && <span className={styles.badge}>{badge}</span>}
            <h3 className={styles.frontTitle}>{title}</h3>
            {frontTeaser && <p className={styles.frontTeaser}>{frontTeaser}</p>}
          </div>
        </div>

        <div className={styles.back}>
          <img
            className={clsx(styles.totvsLogo, styles.totvsLogoLight)}
            src={logoWhite}
            alt=""
            aria-hidden
          />
          <img
            className={clsx(styles.totvsLogo, styles.totvsLogoDark)}
            src={logoColor}
            alt=""
            aria-hidden
          />
          <div className={styles.backBody}>
            <h3 className={styles.backTitle}>{title}</h3>
            <p className={styles.backDescription}>{backDescription}</p>
            {backHighlights.length > 0 && (
              <ul className={styles.highlights}>
                {backHighlights.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
            <span className={styles.ctaBtn} aria-hidden>
              <svg
                className={styles.ctaIcon}
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
