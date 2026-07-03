import type {ReactNode} from 'react';
import Translate from '@docusaurus/Translate';

type Props = {
  label?: string;
};

export default function TotvsDivider({label}: Props): ReactNode {
  return (
    <div className="totvs-divider" role="presentation">
      <span className="totvs-divider__line" aria-hidden="true" />
      <span className="totvs-divider__label">
        {label ?? (
          <Translate id="components.totvsDivider.default">TOTVS</Translate>
        )}
      </span>
      <span className="totvs-divider__line" aria-hidden="true" />
    </div>
  );
}
