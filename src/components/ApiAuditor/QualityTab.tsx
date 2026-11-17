import {useMemo, useState} from 'react';
import type {ReactNode} from 'react';

import {MethodBadge, StatusBadge} from './AuditTab';
import DataTable from './DataTable';
import type {Column} from './DataTable';
import {EMPTY_QUALITY} from './filters';
import type {QualityFilters} from './filters';
import {BANDS, BAND_COLOR, CRITERIA, downloadText, toCsv} from './model';
import type {Row} from './model';
import styles from './styles.module.css';

interface Props {
  rows: Row[];
  filters: QualityFilters;
  onChange: (f: QualityFilters) => void;
}

const SHORT: Record<string, string> = {
  title: 'T',
  description: 'D',
  detail: 'DD',
  params: 'P',
  body: 'B',
  responses: 'R',
};

function Checks({row}: {row: Row}): ReactNode {
  return (
    <span className={styles.checks}>
      {row.quality?.checks.map((c) => (
        <span
          key={c.id}
          className={`${styles.check3} ${!c.applicable ? styles.na : c.pass ? styles.pass : styles.fail}`}
          title={`${c.label}: ${!c.applicable ? 'não se aplica' : c.pass ? 'ok' : (c.detail ?? 'ausente')}`}>
          {SHORT[c.id]}
        </span>
      ))}
    </span>
  );
}

function Detail({row}: {row: Row}): ReactNode {
  const q = row.quality!;
  const raw = row.doc?.raw;
  return (
    <div className={styles.detail}>
      <div className={styles.detailCols}>
        <div>
          <h4>Critérios</h4>
          <ul className={styles.checkList}>
            {q.checks.map((c) => (
              <li key={c.id}>
                <span className={!c.applicable ? styles.na : c.pass ? styles.passText : styles.failText}>
                  {!c.applicable ? '–' : c.pass ? '✓' : '✗'}
                </span>{' '}
                {c.label} <small>({c.weight} pts)</small>
                {c.detail && <small className={styles.muted}> · {c.detail}</small>}
              </li>
            ))}
          </ul>
          {q.issues.length > 0 && (
            <>
              <h4>Problemas encontrados</h4>
              <ul>
                {q.issues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </>
          )}
          {row.reason && (
            <>
              <h4>Motivo no report</h4>
              <p>{row.reason}</p>
            </>
          )}
        </div>
        <div>
          <h4>Descrição</h4>
          <pre className={styles.pre}>{row.doc?.description || '(vazia)'}</pre>
          <h4>JSON original</h4>
          <pre className={styles.pre}>
            {typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function QualityTab({rows, filters, onChange}: Props): ReactNode {
  const set = (patch: Partial<QualityFilters>) => onChange({...filters, ...patch});

  const methods = useMemo(() => [...new Set(rows.map((r) => r.method))].sort(), [rows]);
  const groups = useMemo(() => [...new Set(rows.map((r) => r.group))].sort(), [rows]);
  const bandCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows) c[r.quality!.band] = (c[r.quality!.band] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return rows.filter((r) => {
      const ql = r.quality!;
      if (filters.bands.length && !filters.bands.includes(ql.band)) return false;
      if (filters.method && r.method !== filters.method) return false;
      if (filters.group && r.group !== filters.group) return false;
      if (ql.score < filters.min || ql.score > filters.max) return false;
      if (filters.onlyInvalid && !r.doc?.parseError) return false;
      for (const [id, mode] of Object.entries(filters.criteria)) {
        const c = ql.checks.find((x) => x.id === id);
        if (!c || !c.applicable) return false;
        if (mode === 'with' && !c.pass) return false;
        if (mode === 'without' && c.pass) return false;
      }
      if (q && !`${r.endpoint} ${r.doc?.title ?? ''} ${r.doc?.description ?? ''}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [rows, filters]);

  const columns: Column<Row>[] = [
    {
      id: 'score',
      header: 'Score',
      render: (r) => (
        <span className={styles.scoreCell}>
          <span className={styles.scoreTrack}>
            <span
              className={styles.scoreFill}
              style={{width: `${r.quality!.score}%`, background: BAND_COLOR[r.quality!.band]}}
            />
          </span>
          <strong>{r.quality!.score}</strong>
        </span>
      ),
      sortValue: (r) => r.quality!.score,
    },
    {
      id: 'band',
      header: 'Faixa',
      render: (r) => (
        <span className={styles.badge} style={{background: BAND_COLOR[r.quality!.band]}}>
          {r.quality!.band}
        </span>
      ),
      sortValue: (r) => r.quality!.score,
    },
    {id: 'method', header: 'Método', render: (r) => <MethodBadge method={r.method} />, sortValue: (r) => r.method},
    {
      id: 'endpoint',
      header: 'Endpoint',
      render: (r) => <code className={styles.endpoint}>{r.endpoint}</code>,
      sortValue: (r) => r.endpoint,
    },
    {id: 'title', header: 'Título', render: (r) => r.doc?.title || '—', sortValue: (r) => r.doc?.title ?? ''},
    {id: 'checks', header: 'Critérios', render: (r) => <Checks row={r} />},
    {
      id: 'status',
      header: 'Report',
      render: (r) => <StatusBadge status={r.status} />,
      sortValue: (r) => r.status,
    },
  ];

  const exportCsv = () =>
    downloadText(
      'qualidade-endpoints.csv',
      toCsv(
        ['Score', 'Faixa', 'Método', 'Endpoint', 'Grupo', 'Título', 'Descrição', ...CRITERIA.map((c) => c.label), 'Problemas'],
        filtered.map((r) => [
          r.quality!.score,
          r.quality!.band,
          r.method,
          r.endpoint,
          r.group,
          r.doc?.title ?? '',
          (r.doc?.description ?? '').replace(/\s*\n\s*/g, ' '),
          ...CRITERIA.map((c) => {
            const k = r.quality!.checks.find((x) => x.id === c.id)!;
            return !k.applicable ? 'n/a' : k.pass ? 'sim' : 'não';
          }),
          r.quality!.issues.join(' | '),
        ]),
      ),
    );

  const [showMore, setShowMore] = useState(false);
  const moreCount = (filters.min > 0 || filters.max < 100 ? 1 : 0) + (filters.onlyInvalid ? 1 : 0);
  const hasActive = JSON.stringify(filters) !== JSON.stringify(EMPTY_QUALITY);

  const cycleCriterion = (id: string) => {
    const cur = filters.criteria[id];
    setCriterion(id, cur === 'with' ? 'without' : cur === 'without' ? '' : 'with');
  };

  const setCriterion = (id: string, mode: string) => {
    const next = {...filters.criteria};
    if (mode === 'with' || mode === 'without') next[id] = mode;
    else delete next[id];
    set({criteria: next});
  };

  const toggleBand = (b: string) =>
    set({bands: filters.bands.includes(b) ? filters.bands.filter((x) => x !== b) : [...filters.bands, b]});

  return (
    <div>
      <details className={styles.howto}>
        <summary>Como o score é calculado</summary>
        <p>
          Cada endpoint recebe de 0 a 100 pontos pelos critérios abaixo. O corpo da requisição só conta para POST,
          PUT e PATCH; nos demais métodos o score é recalculado sobre os critérios restantes. Endpoints com JSON
          inválido no <code>api_doc.json</code> recebem 0.
        </p>
        <ul>
          {CRITERIA.map((c) => (
            <li key={c.id}>
              <strong>{SHORT[c.id]}</strong> · {c.label} ({c.weight} pts)
            </li>
          ))}
        </ul>
        <p>
          Parâmetros só contam se todos os path params do endpoint (<code>:id</code>) estiverem documentados.
          Faixas: Excelente ≥ 85, Boa ≥ 60, Regular ≥ 35, Crítica abaixo disso.
        </p>
      </details>

      <div className={styles.chips} role="group" aria-label="Filtrar por faixa">
        {BANDS.map((b) => {
          const active = filters.bands.includes(b);
          return (
            <button
              key={b}
              type="button"
              className={`${styles.chip} ${active ? styles.chipActive : ''}`}
              style={active ? {borderColor: BAND_COLOR[b], boxShadow: `inset 0 0 0 1px ${BAND_COLOR[b]}`} : undefined}
              aria-pressed={active}
              onClick={() => toggleBand(b)}>
              <span className={styles.dot} style={{background: BAND_COLOR[b]}} />
              {b} <strong>{(bandCounts[b] ?? 0).toLocaleString('pt-BR')}</strong>
            </button>
          );
        })}
      </div>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Buscar endpoint, título ou descrição…"
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
        <button
          type="button"
          className={styles.btn}
          aria-expanded={showMore}
          onClick={() => setShowMore((v) => !v)}>
          Mais filtros{moreCount > 0 ? ` (${moreCount})` : ''} {showMore ? '▴' : '▾'}
        </button>
        <span className={styles.spacer} />
        {hasActive && (
          <button type="button" className={styles.linkBtn} onClick={() => onChange(EMPTY_QUALITY)}>
            Limpar filtros
          </button>
        )}
        <button type="button" className={styles.btnPrimary} onClick={exportCsv} disabled={!filtered.length}>
          Exportar CSV ({filtered.length.toLocaleString('pt-BR')})
        </button>
      </div>

      {showMore && (
        <div className={styles.morePanel}>
          <label className={styles.check}>
            Score de
            <input
              type="number"
              min={0}
              max={100}
              value={filters.min}
              onChange={(e) => set({min: Math.max(0, Math.min(100, Number(e.target.value) || 0))})}
              aria-label="Score mínimo"
              className={styles.num}
            />
            a
            <input
              type="number"
              min={0}
              max={100}
              value={filters.max}
              onChange={(e) => set({max: Math.max(0, Math.min(100, Number(e.target.value) || 0))})}
              aria-label="Score máximo"
              className={styles.num}
            />
          </label>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={filters.onlyInvalid}
              onChange={(e) => set({onlyInvalid: e.target.checked})}
            />
            Só JSON inválido
          </label>
        </div>
      )}

      <div className={styles.critRow} role="group" aria-label="Filtrar por critérios">
        <span className={styles.critTitle}>Critérios</span>
        {CRITERIA.map((c) => {
          const cur = filters.criteria[c.id];
          return (
            <button
              key={c.id}
              type="button"
              className={`${styles.critChip} ${cur === 'with' ? styles.critWith : cur === 'without' ? styles.critWithout : ''}`}
              title="Clique para alternar: qualquer, com, sem"
              aria-label={`${c.label}: ${cur === 'with' ? 'com' : cur === 'without' ? 'sem' : 'qualquer'}`}
              onClick={() => cycleCriterion(c.id)}>
              {c.label}
            </button>
          );
        })}
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        rowKey={(r) => r.key}
        renderDetail={(r) => <Detail row={r} />}
        initialSort={{id: 'score', dir: 'asc'}}
      />
    </div>
  );
}
