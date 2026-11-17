import {useMemo} from 'react';
import type {ReactNode} from 'react';

import type {AuditFilters, QualityFilters} from './filters';
import {BANDS, BAND_COLOR, CRITERIA, STATUS_COLOR, STATUS_LABEL, STATUS_ORDER, bandOf} from './model';
import type {Row} from './model';
import styles from './styles.module.css';

interface Props {
  rows: Row[];
  hasReport: boolean;
  hasDocs: boolean;
  onAudit: (patch: Partial<AuditFilters>) => void;
  onQuality: (patch: Partial<QualityFilters>) => void;
}

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 1000) / 10 : 0);
const fmt = (n: number) => n.toLocaleString('pt-BR');

function Kpi({
  label,
  value,
  hint,
  color,
  onClick,
}: {
  label: string;
  value: string;
  hint?: string;
  color?: string;
  onClick?: () => void;
}): ReactNode {
  const body = (
    <>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiValue} style={color ? {color} : undefined}>
        {value}
      </span>
      {hint && <span className={styles.kpiHint}>{hint}</span>}
    </>
  );
  return onClick ? (
    <button type="button" className={`${styles.kpi} ${styles.kpiClickable}`} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className={styles.kpi}>{body}</div>
  );
}

function Placeholder({text}: {text: string}): ReactNode {
  return <p className={styles.placeholder}>{text}</p>;
}

export default function SummaryTab({rows, hasReport, hasDocs, onAudit, onQuality}: Props): ReactNode {
  const audit = useMemo(() => rows.filter((r) => r.inReport), [rows]);
  const docs = useMemo(() => rows.filter((r) => r.inDoc), [rows]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of audit) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [audit]);

  const groups = useMemo(() => {
    const m = new Map<string, Record<string, number>>();
    for (const r of audit) {
      const g = m.get(r.group) ?? {};
      g[r.status] = (g[r.status] ?? 0) + 1;
      m.set(r.group, g);
    }
    return [...m.entries()]
      .map(([name, c]) => ({name, c, total: Object.values(c).reduce((a, b) => a + b, 0)}))
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);
  }, [audit]);

  const reasons = useMemo(() => {
    const m = new Map<string, {n: number; status: string}>();
    for (const r of audit) {
      if (!r.reason) continue;
      const cur = m.get(r.reason);
      m.set(r.reason, {n: (cur?.n ?? 0) + 1, status: r.status});
    }
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 10);
  }, [audit]);

  const valid = useMemo(() => docs.filter((r) => !r.doc?.parseError), [docs]);
  const avg = valid.length ? Math.round(valid.reduce((s, r) => s + r.quality!.score, 0) / valid.length) : 0;
  const invalid = docs.length - valid.length;

  const bandCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of docs) c[r.quality!.band] = (c[r.quality!.band] ?? 0) + 1;
    return c;
  }, [docs]);

  const criteria = useMemo(
    () =>
      CRITERIA.map((c) => {
        let applicable = 0;
        let pass = 0;
        for (const r of valid) {
          const k = r.quality!.checks.find((x) => x.id === c.id);
          if (k?.applicable) {
            applicable++;
            if (k.pass) pass++;
          }
        }
        return {...c, applicable, pass};
      }),
    [valid],
  );

  const methods = useMemo(() => {
    const m = new Map<string, {total: number; ok: number; sum: number; docs: number}>();
    for (const r of rows) {
      const e = m.get(r.method) ?? {total: 0, ok: 0, sum: 0, docs: 0};
      if (r.inReport) {
        e.total++;
        if (r.status === 'ok') e.ok++;
      }
      if (r.quality && !r.doc?.parseError) {
        e.sum += r.quality.score;
        e.docs++;
      }
      m.set(r.method, e);
    }
    return [...m.entries()].sort((a, b) => b[1].total + b[1].docs - (a[1].total + a[1].docs));
  }, [rows]);

  const inconsistent = rows.filter((r) => r.inconsistency).length;
  const total = audit.length;
  const okCount = statusCounts.ok ?? 0;

  return (
    <div>
      <h3 className={styles.sectionTitle}>Auditoria · api_doc_report.json</h3>
      {!hasReport ? (
        <Placeholder text="Carregue o api_doc_report.json para ver a cobertura e os erros." />
      ) : (
        <>
          <div className={styles.kpis}>
            <Kpi label="Endpoints no report" value={fmt(total)} onClick={() => onAudit({statuses: []})} />
            <Kpi
              label="Cobertura de documentação"
              value={`${pct(okCount, total)}%`}
              hint={`${fmt(okCount)} de ${fmt(total)} documentados`}
              color={STATUS_COLOR.ok}
              onClick={() => onAudit({statuses: ['ok']})}
            />
            {STATUS_ORDER.filter((s) => s !== 'ok').map((s) => (
              <Kpi
                key={s}
                label={STATUS_LABEL[s]}
                value={fmt(statusCounts[s] ?? 0)}
                hint={`${pct(statusCounts[s] ?? 0, total)}% do total`}
                color={STATUS_COLOR[s]}
                onClick={() => onAudit({statuses: [s]})}
              />
            ))}
          </div>

          <div className={styles.grid2}>
            <section className={styles.card}>
              <h4>Cobertura por grupo (15 maiores)</h4>
              <div className={styles.legend}>
                {STATUS_ORDER.map((s) => (
                  <span key={s}>
                    <span className={styles.dot} style={{background: STATUS_COLOR[s]}} /> {STATUS_LABEL[s]}
                  </span>
                ))}
              </div>
              {groups.map((g) => (
                <button
                  key={g.name}
                  type="button"
                  className={styles.barRow}
                  title={`Filtrar auditoria por ${g.name}`}
                  onClick={() => onAudit({group: g.name, statuses: []})}>
                  <span className={styles.barLabel}>{g.name}</span>
                  <span className={styles.stack}>
                    {STATUS_ORDER.map((s) =>
                      g.c[s] ? (
                        <span
                          key={s}
                          style={{width: `${(g.c[s] / groups[0].total) * 100}%`, background: STATUS_COLOR[s]}}
                          title={`${STATUS_LABEL[s]}: ${g.c[s]}`}
                        />
                      ) : null,
                    )}
                  </span>
                  <span className={styles.barValue}>{fmt(g.total)}</span>
                </button>
              ))}
            </section>

            <section className={styles.card}>
              <h4>Principais motivos de falha e ausência</h4>
              {reasons.length === 0 ? (
                <Placeholder text="Nenhum motivo registrado." />
              ) : (
                <ul className={styles.reasonList}>
                  {reasons.map(([reason, info]) => (
                    <li key={reason}>
                      <button type="button" onClick={() => onAudit({reason, statuses: []})}>
                        <span className={styles.dot} style={{background: STATUS_COLOR[info.status] ?? '#6f7bd9'}} />
                        <span className={styles.reasonText}>{reason}</span>
                        <strong>{fmt(info.n)}</strong>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}

      <h3 className={styles.sectionTitle}>Qualidade · api_doc.json</h3>
      {!hasDocs ? (
        <Placeholder text="Carregue o api_doc.json para medir a qualidade da documentação." />
      ) : (
        <>
          <div className={styles.kpis}>
            <Kpi label="Endpoints no api_doc" value={fmt(docs.length)} onClick={() => onQuality({bands: []})} />
            <Kpi
              label="Score médio"
              value={`${avg}`}
              hint="somente docs com JSON válido"
              color={BAND_COLOR[bandOf(avg)]}
            />
            {BANDS.map((b) => (
              <Kpi
                key={b}
                label={`Faixa ${b}`}
                value={fmt(bandCounts[b] ?? 0)}
                hint={`${pct(bandCounts[b] ?? 0, docs.length)}%`}
                color={BAND_COLOR[b]}
                onClick={() => onQuality({bands: [b]})}
              />
            ))}
            <Kpi
              label="JSON inválido"
              value={fmt(invalid)}
              color={invalid ? STATUS_COLOR.generate_error : undefined}
              onClick={() => onQuality({onlyInvalid: true})}
            />
          </div>

          <div className={styles.grid2}>
            <section className={styles.card}>
              <h4>Itens documentados, por critério</h4>
              {criteria.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={styles.barRow}
                  title={`Ver endpoints sem ${c.label.toLowerCase()}`}
                  onClick={() => onQuality({criteria: {[c.id]: 'without'}})}>
                  <span className={styles.barLabel}>{c.label}</span>
                  <span className={styles.stack}>
                    <span
                      style={{width: `${pct(c.pass, c.applicable)}%`, background: STATUS_COLOR.ok}}
                    />
                  </span>
                  <span className={styles.barValue}>
                    {pct(c.pass, c.applicable)}% <small>({fmt(c.pass)}/{fmt(c.applicable)})</small>
                  </span>
                </button>
              ))}
            </section>

            <section className={styles.card}>
              <h4>Por método HTTP</h4>
              <table className={styles.miniTable}>
                <thead>
                  <tr>
                    <th>Método</th>
                    <th>Endpoints</th>
                    <th>Cobertura</th>
                    <th>Score médio</th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map(([m, e]) => (
                    <tr key={m}>
                      <td>
                        <span className={styles.method}>{m}</span>
                      </td>
                      <td>{hasReport ? fmt(e.total) : '—'}</td>
                      <td>{hasReport ? `${pct(e.ok, e.total)}%` : '—'}</td>
                      <td>{e.docs ? Math.round(e.sum / e.docs) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </>
      )}

      {hasReport && hasDocs && (
        <>
          <h3 className={styles.sectionTitle}>Cruzamento</h3>
          <div className={styles.kpis}>
            <Kpi
              label="Inconsistências entre os arquivos"
              value={fmt(inconsistent)}
              hint="report e api_doc divergem"
              color={inconsistent ? STATUS_COLOR.read_error : STATUS_COLOR.ok}
              onClick={() => onAudit({onlyInconsistent: true, statuses: []})}
            />
          </div>
        </>
      )}
    </div>
  );
}
