const TLPP_ALIASES = new Set(['tlpp', 'advpl', 'prw', 'prx', 'th']);

/** Normaliza identificador de linguagem para o Prism. */
export function resolveCodeLanguage(language?: string): string | undefined {
  if (!language) return language;
  const id = language.toLowerCase();
  if (TLPP_ALIASES.has(id)) return 'tlpp';
  return language;
}

/** Indica se o bloco deve passar pela formatação TLPP/ADVPL. */
export function isTlppLanguage(language?: string): boolean {
  return resolveCodeLanguage(language) === 'tlpp';
}
