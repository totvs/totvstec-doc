import type {ReactNode} from 'react';
import Translate from '@docusaurus/Translate';

export default function VirtualBanner(): ReactNode {
  return (
    <div className="virtual-banner">
      <Translate id="components.virtualBanner">
        Documentação virtual — os exemplos .tlpp executam no seu AppServer, não neste site.
      </Translate>
    </div>
  );
}
