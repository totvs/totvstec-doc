import {useCallback, useMemo, useRef, useState} from 'react';
import type {DragEvent, ReactNode} from 'react';

import AuditTab from './AuditTab';
import {EMPTY_AUDIT, EMPTY_QUALITY} from './filters';
import type {AuditFilters, QualityFilters} from './filters';
import {buildRows, decodeBuffer, parseDocs, parseReport} from './model';
import type {DocData, ReportData} from './model';
import QualityTab from './QualityTab';
import SummaryTab from './SummaryTab';
import styles from './styles.module.css';

type Tab = 'resumo' | 'auditoria' | 'qualidade';
type Kind = 'report' | 'docs';

interface SlotProps {
  title: string;
  fileHint: string;
  description: string;
  name?: string;
  info?: string;
  warning?: string;
  error?: string;
  onFile: (file: File) => void;
  onClear: () => void;
}

function FileSlot({title, fileHint, description, name, info, warning, error, onFile, onClear}: SlotProps): ReactNode {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div
      className={`${styles.slot} ${over ? styles.slotOver : ''} ${name ? styles.slotLoaded : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}>
      <div className={styles.slotHead}>
        <strong>{title}</strong>
        <code>{fileHint}</code>
      </div>
      <p className={styles.slotDesc}>{description}</p>
      {name ? (
        <p className={styles.slotFile}>
          ✓ {name}
          {info && <span className={styles.muted}> · {info}</span>}
        </p>
      ) : (
        <p className={styles.slotFile}>Arraste o arquivo aqui ou escolha no computador.</p>
      )}
      {warning && <p className={styles.slotWarn}>⚠ {warning}</p>}
      {error && (
        <p className={styles.slotError} role="alert">
          {error}
        </p>
      )}
      <div className={styles.slotActions}>
        <button type="button" className={styles.btnPrimary} onClick={() => input.current?.click()}>
          {name ? 'Trocar arquivo' : 'Escolher arquivo'}
        </button>
        {name && (
          <button type="button" className={styles.btn} onClick={onClear}>
            Remover
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}

export default function ApiAuditor(): ReactNode {
  const [report, setReport] = useState<ReportData>();
  const [docs, setDocs] = useState<DocData>();
  const [names, setNames] = useState<Partial<Record<Kind, string>>>({});
  const [errors, setErrors] = useState<Partial<Record<Kind, string>>>({});
  const [tab, setTab] = useState<Tab>('resumo');
  const [audit, setAudit] = useState<AuditFilters>(EMPTY_AUDIT);
  const [quality, setQuality] = useState<QualityFilters>(EMPTY_QUALITY);

  const rows = useMemo(() => buildRows(report, docs), [report, docs]);
  const auditRows = useMemo(() => rows.filter((r) => r.inReport || !report), [rows, report]);
  const docRows = useMemo(() => rows.filter((r) => r.inDoc), [rows]);

  const load = useCallback(async (kind: Kind, file: File) => {
    setErrors((e) => ({...e, [kind]: undefined}));
    try {
      const text = decodeBuffer(await file.arrayBuffer());
      if (kind === 'report') {
        setReport(parseReport(text));
        setAudit(EMPTY_AUDIT);
      } else {
        setDocs(parseDocs(text));
        setQuality(EMPTY_QUALITY);
      }
      setNames((n) => ({...n, [kind]: file.name}));
    } catch (err) {
      setErrors((e) => ({...e, [kind]: (err as Error).message}));
    }
  }, []);

  const clear = (kind: Kind) => {
    if (kind === 'report') setReport(undefined);
    else setDocs(undefined);
    setNames((n) => ({...n, [kind]: undefined}));
    setErrors((e) => ({...e, [kind]: undefined}));
  };

  const goAudit = (patch: Partial<AuditFilters>) => {
    setAudit({...EMPTY_AUDIT, ...patch});
    setTab('auditoria');
  };
  const goQuality = (patch: Partial<QualityFilters>) => {
    setQuality({...EMPTY_QUALITY, ...patch});
    setTab('qualidade');
  };

  const tabs: {id: Tab; label: string}[] = [
    {id: 'resumo', label: 'Resumo'},
    {id: 'auditoria', label: `Auditoria${report ? ` (${report.entries.length.toLocaleString('pt-BR')})` : ''}`},
    {id: 'qualidade', label: `Qualidade${docs ? ` (${docs.docs.length.toLocaleString('pt-BR')})` : ''}`},
  ];

  return (
    <div>
      <div className={styles.slots}>
        <FileSlot
          title="Auditoria"
          fileHint="api_doc_report.json"
          description="Lista todos os endpoints com status: documentado, sem documentação, erro de leitura ou de exportação."
          name={names.report}
          info={report ? `${report.entries.length.toLocaleString('pt-BR')} endpoints` : undefined}
          warning={report?.skipped ? `${report.skipped} item(ns) ignorado(s) por formato inválido.` : undefined}
          error={errors.report}
          onFile={(f) => load('report', f)}
          onClear={() => clear('report')}
        />
        <FileSlot
          title="Qualidade"
          fileHint="api_doc.json"
          description="Documentação coletada de cada endpoint. É a base para medir título, descrição, parâmetros, corpo e respostas."
          name={names.docs}
          info={docs ? `${docs.docs.length.toLocaleString('pt-BR')} endpoints` : undefined}
          warning={
            docs?.invalid
              ? `${docs.invalid} registro(s) com JSON inválido foram isolados e contam como score 0.`
              : undefined
          }
          error={errors.docs}
          onFile={(f) => load('docs', f)}
          onClear={() => clear('docs')}
        />
      </div>
      <p className={styles.privacy}>
        Os arquivos são lidos no seu navegador e não são enviados a nenhum servidor. Os dois são independentes, mas o
        cruzamento (inconsistências e score na auditoria) só aparece com ambos carregados.
      </p>

      <div className={styles.tabs} role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.panel} role="tabpanel">
        {tab === 'resumo' && (
          <SummaryTab
            rows={rows}
            hasReport={!!report}
            hasDocs={!!docs}
            onAudit={goAudit}
            onQuality={goQuality}
          />
        )}
        {tab === 'auditoria' &&
          (report ? (
            <AuditTab rows={auditRows} filters={audit} onChange={setAudit} hasDocs={!!docs} />
          ) : (
            <p className={styles.placeholder}>Carregue o api_doc_report.json para usar a auditoria.</p>
          ))}
        {tab === 'qualidade' &&
          (docs ? (
            <QualityTab rows={docRows} filters={quality} onChange={setQuality} />
          ) : (
            <p className={styles.placeholder}>Carregue o api_doc.json para medir a qualidade.</p>
          ))}
      </div>
    </div>
  );
}
