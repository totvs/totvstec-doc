import type PrismNamespace from 'prismjs';

/** INI com seções, chaves e valores mais legíveis. */
export function registerIniTotvs(Prism: typeof PrismNamespace): void {
  Prism.languages.ini = {
    comment: {
      pattern: /(^|\s)[;#].*/m,
      lookbehind: true,
    },
    section: {
      pattern: /^\s*\[[^\]]+\]/m,
      inside: {
        punctuation: /[\[\]]/,
        'section-name': {
          pattern: /[^\[\]]+/,
          alias: 'tag',
        },
      },
    },
    key: {
      pattern: /^[^#;\n\[\]=\s][^=;\n]*(?=\s*=)/m,
      alias: 'property',
    },
    value: {
      pattern: /=.*/,
      inside: {
        punctuation: /^=/,
        string: {
          pattern: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/,
          greedy: true,
        },
        number: /\b\d+\b/,
        boolean: /\b(?:true|false|yes|no|on|off)\b/i,
      },
    },
  };
}
