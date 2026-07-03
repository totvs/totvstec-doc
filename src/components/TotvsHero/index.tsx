import type {ReactNode} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

type Props = {
  title: string;
  subtitle?: string;
  badge?: string;
};

export default function TotvsHero({title, subtitle, badge}: Props): ReactNode {
  const logoSrc = useBaseUrl('/img/totvs/totvs-logo.svg');

  return (
    <header className="totvs-hero">
      <div className="totvs-hero__inner totvs-hero__inner--split">
        <div className="totvs-hero__content">
          {badge && <div className="totvs-hero__badge">{badge}</div>}
          <h1 className="totvs-hero__title">{title}</h1>
          {subtitle && <p className="totvs-hero__subtitle">{subtitle}</p>}
        </div>
        <div className="totvs-hero__visual" aria-hidden="true">
          <img
            className="totvs-hero__logo"
            src={logoSrc}
            alt=""
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </header>
  );
}
