export interface AuditFilters {
  q: string;
  statuses: string[];
  method: string;
  group: string;
  reason: string;
  onlyInconsistent: boolean;
}

export const EMPTY_AUDIT: AuditFilters = {
  q: '',
  statuses: [],
  method: '',
  group: '',
  reason: '',
  onlyInconsistent: false,
};

export interface QualityFilters {
  q: string;
  bands: string[];
  method: string;
  group: string;
  /** por critério: 'with' = só quem tem, 'without' = só quem não tem */
  criteria: Record<string, 'with' | 'without'>;
  min: number;
  max: number;
  onlyInvalid: boolean;
}

export const EMPTY_QUALITY: QualityFilters = {
  q: '',
  bands: [],
  method: '',
  group: '',
  criteria: {},
  min: 0,
  max: 100,
  onlyInvalid: false,
};
