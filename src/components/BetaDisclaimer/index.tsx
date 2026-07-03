import type {ReactNode} from 'react';
import Translate from '@docusaurus/Translate';

export default function BetaDisclaimer(): ReactNode {
  return (
    <aside className="beta-disclaimer">
      <svg
        className="beta-disclaimer__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div>
        <p className="beta-disclaimer__title">
          <Translate id="components.betaDisclaimer.title">Aviso — REST-DOC em evolução</Translate>
        </p>
        <p className="beta-disclaimer__body">
          <Translate id="components.betaDisclaimer.body">
            O módulo REST-DOC é recente no tlppCore e ainda está em implementação. O motor de
            geração é propriedade da TOTVS S.A. e não está sob licença MIT. Para dúvidas, abra
            uma issue no repositório.
          </Translate>
        </p>
      </div>
    </aside>
  );
}
