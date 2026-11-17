import {useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';

import styles from './styles.module.css';

export interface Column<T> {
  id: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  renderDetail?: (row: T) => ReactNode;
  /** Quando informado, s� as linhas que retornam true podem ser expandidas. */
  hasDetail?: (row: T) => boolean;
  initialSort?: {id: string; dir: 'asc' | 'desc'};
  emptyText?: string;
}

const PAGE_SIZES = [25, 50, 100, 250];

export default function DataTable<T>({
  rows,
  columns,
  rowKey,
  renderDetail,
  hasDetail,
  initialSort,
  emptyText = 'Nenhum registro para os filtros atuais.',
}: Props<T>): ReactNode {
  const [sort, setSort] = useState(initialSort);
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.id === sort?.id);
    if (!col?.sortValue || !sort) return rows;
    const get = col.sortValue;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * factor;
      return String(va).localeCompare(String(vb), 'pt-BR') * factor;
    });
  }, [rows, columns, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));

  useEffect(() => {
    setPage(0);
  }, [rows, pageSize]);

  const current = Math.min(page, pages - 1);
  const slice = sorted.slice(current * pageSize, (current + 1) * pageSize);

  const toggleSort = (id: string) =>
    setSort((s) => (s?.id === id ? {id, dir: s.dir === 'asc' ? 'desc' : 'asc'} : {id, dir: 'asc'}));

  const toggleOpen = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {renderDetail && <th className={styles.thNarrow} aria-label="Detalhes" />}
              {columns.map((c) => (
                <th
                  key={c.id}
                  className={c.className}
                  aria-sort={
                    sort?.id === c.id ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined
                  }>
                  {c.sortValue ? (
                    <button type="button" className={styles.thButton} onClick={() => toggleSort(c.id)}>
                      {c.header}
                      <span className={styles.sortMark} aria-hidden>
                        {sort?.id === c.id ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td colSpan={columns.length + (renderDetail ? 1 : 0)} className={styles.empty}>
                  {emptyText}
                </td>
              </tr>
            )}
            {slice.map((row) => {
              const key = rowKey(row);
              const canOpen = !!renderDetail && (!hasDetail || hasDetail(row));
              const isOpen = canOpen && open.has(key);
              return [
                <tr key={key} className={isOpen ? styles.rowOpen : undefined}>
                  {renderDetail && !canOpen && <td className={styles.thNarrow} />}
                  {canOpen && (
                    <td className={styles.thNarrow}>
                      <button
                        type="button"
                        className={styles.expandBtn}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? 'Recolher detalhes' : 'Expandir detalhes'}
                        onClick={() => toggleOpen(key)}>
                        {isOpen ? '−' : '+'}
                      </button>
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.id} className={c.className}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>,
                isOpen && renderDetail ? (
                  <tr key={`${key}#detail`} className={styles.detailRow}>
                    <td colSpan={columns.length + 1}>{renderDetail(row)}</td>
                  </tr>
                ) : null,
              ];
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.pager}>
        <span>
          {sorted.length === 0
            ? '0 registros'
            : `${current * pageSize + 1}–${Math.min((current + 1) * pageSize, sorted.length)} de ${sorted.length.toLocaleString('pt-BR')}`}
        </span>
        <span className={styles.pagerControls}>
          <label>
            Por página{' '}
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={styles.btn} disabled={current === 0} onClick={() => setPage(current - 1)}>
            Anterior
          </button>
          <span>
            {current + 1} / {pages}
          </span>
          <button
            type="button"
            className={styles.btn}
            disabled={current >= pages - 1}
            onClick={() => setPage(current + 1)}>
            Próxima
          </button>
        </span>
      </div>
    </div>
  );
}
