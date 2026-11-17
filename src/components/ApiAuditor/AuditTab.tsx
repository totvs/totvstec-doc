import {useMemo} from 'react';
import type {ReactNode} from 'react';

import DataTable from './DataTable';
import type {Column} from './DataTable';
import {EMPTY_AUDIT} from './filters';
import type {AuditFilters} from './filters';
import {BAND_COLOR, STATUS_COLOR, STATUS_LABEL, STATUS_ORDER, downloadText, toCsv} from './model';
import type {Row} from './model';
import ErrorHelp from './ErrorHelp';
import {explainError, plainText} from './errorCatalog';
import styles from './styles.module.css';

interface Props {
  rows: Row[];
  filters: AuditFilters;
  onChange: (f: AuditFilters) => void;
  hasDocs: boolean;
}

export function StatusBadge({status}: {status: string}): ReactNode {
  return (
    <span className={styles.badge} style={{background: STATUS_COLOR[status] ?? '#6f7bd9'}}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function MethodBadge({method}: {method: string}): ReactNode {
  return <span className={styles.method}>{method}</span>;
}

export default function AuditTab({rows, filters, onChange, hasDocs}: Props): ReactNode {
  const set = (patch: Partial<AuditFilters>) => onChange({...filters, ...patch});

  const methods = useMemo(() => [...new Set(rows.map((r) => r.method))].sort(), [rows]);
  const groups = useMemo(() => [...new Set(rows.map((r) => r.group))].sort(), [rows]);
  const reasons = useMemo(
    () => [...new Set(rows.map((r) => r.reason).filter(Boolean))].sort(),
    [rows],
  );
  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);
  const statuses = useMemo(
    () => [
      ...STATUS_ORDER.filter((s) => statusCounts[s]),
      ...Object.keys(statusCounts).filter((s) => !(STATUS_ORDER as readonly string[]).includes(s)),
    ],
    [statusCounts],
  );

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filters.statuses.length && !filters.statuses.includes(r.status)) return false;
      if (filters.method && r.method !== filters.method) return false;
      if (filters.group && r.group !== filters.group) return false;
      if (filters.reason && r.reason !== filters.reason) return false;
      if (filters.onlyInconsistent && !r.inconsistency) return false;
      if (q && !`${r.endpoint} ${r.reason} ${r.doc?.title ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, filters]);

  const columns: Column<Row>[] = [
    {
      id: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
      sortValue: (r) => {
        const i = (STATUS_ORDER as readonly string[]).indexOf(r.status);
        return i < 0 ? STATUS_ORDER.length : i;
      },
    },
    {id: 'method', header: 'Método', render: (r) => <MethodBadge method={r.method} />, sortValue: (r) => r.method},
    {
      id: 'endpoint',
      header: 'Endpoint',
      render: (r) => <code className={styles.endpoint}>{r.endpoint}</code>,
      sortValue: (r) => r.endpoint,
    },
    {id: 'group', header: 'Grupo', render: (r) => r.group, sortValue: (r) => r.group},
    {id: 'reason', header: 'Motivo', render: (r) => r.reason || '—', sortValue: (r) => r.reason},
  ];
  if (hasDocs) {
    columns.push(
      {
        id: 'score',
        header: 'Score',
        render: (r) =>
          r.quality ? (
            <span className={styles.badge} style={{background: BAND_COLOR[r.quality.band]}}>
              {r.quality.score}
            </span>
          ) : (
            '—'
          ),
        sortValue: (r) => r.quality?.score ?? -1,
      },
      {
        id: 'inconsistency',
        header: 'Cruzamento',
        render: (r) =>
          r.inconsistency ? (
            <span className={styles.warn} title={r.inconsistency}>
              ⚠ {r.inconsistency}
            </span>
          ) : (
            '—'
          ),
        sortValue: (r) => (r.inconsistency ? 1 : 0),
      },
    );
  }

  const exportCsv = () =>
    downloadText(
      'auditoria-endpoints.csv',
      toCsv(
        ['Status', 'Método', 'Endpoint', 'Grupo', 'Porta', 'Motivo', 'Como corrigir', 'Score', 'Cruzamento'],
        filtered.map((r) => [
          STATUS_LABEL[r.status] ?? r.status,
          r.method,
          r.endpoint,
          r.group,
          r.port ?? '',
          r.reason,
          plainText(explainError(r.status, r.reason)?.fix ?? ''),
          r.quality?.score ?? '',
          r.inconsistency ?? '',
        ]),
      ),
    );

  const reasonHelp = useMemo(() => {
    if (!filters.reason) return undefined;
    const sample = rows.find((r) => r.reason === filters.reason);
    const info = sample && explainError(sample.status, sample.reason);
    if (!info) return undefined;
    return {info, count: rows.filter((r) => r.reason === filters.reason).length};
  }, [rows, filters.reason]);

  const toggleStatus = (s: string) =>
    set({statuses: filters.statuses.includes(s) ? filters.statuses.filter((x) => x !== s) : [...filters.statuses, s]});

  return (
    <div>
      <div className={styles.chips} role="group" aria-label="Filtrar por status">
        {statuses.map((s) => {
          const active = filters.statuses.includes(s);
          return (
            <button
              key={s}
              type="button"
              className={`${styles.chip} ${active ? styles.chipActive : ''}`}
              style={active ? {borderColor: STATUS_COLOR[s], boxShadow: `inset 0 0 0 1px ${STATUS_COLOR[s]}`} : undefined}
              aria-pressed={active}
              onClick={() => toggleStatus(s)}>
              <span className={styles.dot} style={{background: STATUS_COLOR[s] ?? '#6f7bd9'}} />
              {STATUS_LABEL[s] ?? s} <strong>{statusCounts[s].toLocaleString('pt-BR')}</strong>
            </button>
          );
        })}
      </div>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Buscar endpoint, motivo ou título…"
          value={filters.q}
          onChange={(e) => set({q: e.target.value})}
          aria-label="Buscar"
        />
        <select value={filters.method} onChange={(e) => set({method: e.target.value})} aria-label="Método">
          <option value="">Todos os métodos</option>
          {methods.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select value={filters.group} onChange={(e) => set({group: e.target.value})} aria-label="Grupo">
          <option value="">Todos os grupos</option>
          {groups.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <select value={filters.reason} onChange={(e) => set({reason: e.target.value})} aria-label="Motivo">
          <option value="">Todos os motivos</option>
          {reasons.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        {hasDocs && (
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={filters.onlyInconsistent}
              onChange={(e) => set({onlyInconsistent: e.target.checked})}
            />
            Só inconsistências
          </label>
        )}
        <button type="button" className={styles.btn} onClick={() => onChange(EMPTY_AUDIT)}>
          Limpar filtros
        </button>
        <button type="button" className={styles.btnPrimary} onClick={exportCsv} disabled={!filtered.length}>
          Exportar CSV ({filtered.length.toLocaleString('pt-BR')})
        </button>
      </div>

      {reasonHelp && (
        <ErrorHelp info={reasonHelp.info} reason={filters.reason} count={reasonHelp.count} showIntro />
      )}

      <DataTable
        rows={filtered}
        columns={columns}
        rowKey={(r) => r.key}
        initialSort={{id: 'status', dir: 'desc'}}
        hasDetail={(r) => !!explainError(r.status, r.reason)}
        renderDetail={(r) => {
          const info = explainError(r.status, r.reason);
          return info ? <ErrorHelp info={info} reason={r.reason} /> : null;
        }}
      />
    </div>
  );
}
