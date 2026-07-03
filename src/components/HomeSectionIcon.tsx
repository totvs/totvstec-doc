import type {ReactNode} from 'react';
import type {HomeCardAccent} from '@site/src/data/homeCards';

type Props = {
  accent: HomeCardAccent;
};

export default function HomeSectionIcon({accent}: Props): ReactNode {
  const common = {
    width: 26,
    height: 26,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (accent) {
    case 'rest':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M4 7.5h16v9H4z" />
          <path d="M8 7.5V5.5h8v2" />
          <path d="M9 12h6" />
          <path d="M9 15h4" />
        </svg>
      );
    case 'tlpp':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M8 8l-4 4 4 4" />
          <path d="M16 8l4 4-4 4" />
          <path d="M13.5 5l-3 14" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M9 19c-4.3 1.4-4.3-2.1-6-3m12 5v-3.5c0-1 .3-1.7 1-2.3-3.3-.4-6.7-1.6-6.7-7.2 1.6-1.1 1.6-1.1 3.7-1.1 1 0 2.2.4 3.3 1.6 0 0 1.6-.6 3.3-1.1-.3 2.1-1.2 3.3-2.2 4.1 1.9.4 3.7 1.4 3.7 5.6V21" />
        </svg>
      );
    case 'tools':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 2.4-8.4z" />
          <path d="M15 5l4 4" />
        </svg>
      );
  }
}
