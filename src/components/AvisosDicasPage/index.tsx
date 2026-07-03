import type {ReactNode} from 'react';
import styles from './styles.module.css';

type Props = {
  section: string;
  children?: ReactNode;
};

/** Wrapper leve para páginas de avisos por seção — destaque sem caixas pesadas. */
export default function AvisosDicasPage({section, children}: Props) {
  return (
    <div className={styles.root}>
      <p className={styles.kicker}>
        <span className={styles.badge}>{section}</span>
        Revise estes pontos antes de avançar para a próxima seção.
      </p>
      {children}
    </div>
  );
}
