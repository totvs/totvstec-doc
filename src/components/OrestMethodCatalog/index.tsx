import type {ReactNode} from 'react';

import OrestMethodCard from '@site/src/components/OrestMethodCard';
import catalog from '@site/src/data/orest-methods.json';

import styles from './styles.module.css';

type Props = {
  groupId: string;
};

export default function OrestMethodCatalog({groupId}: Props): ReactNode {
  const group = catalog.groups.find((item) => item.id === groupId);

  if (!group) {
    return <p>Grupo de métodos não encontrado.</p>;
  }

  const withExamples = group.methods.filter((method) => method.exampleCode).length;

  return (
    <div>
      <p className={styles.intro}>{group.description}</p>
      <nav className={styles.index} aria-label={`Índice — ${group.title}`}>
        <p className={styles.indexTitle}>Nesta página</p>
        <ul className={styles.indexList}>
          {group.methods.map((method) => (
            <li key={method.id}>
              <a href={`#${method.id}`}>{method.name}</a>
            </li>
          ))}
        </ul>
        <p className={styles.count}>
          {group.methods.length} métodos · {withExamples} com exemplo de código
        </p>
      </nav>
      {group.methods.map((method, index) => (
        <OrestMethodCard
          key={method.id}
          method={method}
          defaultOpen={index === 0}
        />
      ))}
    </div>
  );
}
