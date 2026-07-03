import {resolveCodeLanguage} from './resolve-code-language';

/** Infere a linguagem Prism a partir do nome do arquivo de exemplo. */
export function detectCodeLanguage(
  path: string,
  override?: string,
): string {
  if (override) return resolveCodeLanguage(override) ?? 'tlpp';

  const ext = path.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'ini') return 'ini';
  if (ext === 'yaml' || ext === 'yml') return 'yaml';
  if (ext === 'json') return 'json';

  return 'tlpp';
}
