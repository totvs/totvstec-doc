import type PrismNamespace from 'prismjs';

export function registerTlpp(Prism: typeof PrismNamespace): void {
  if (!Prism.languages.java) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    require('prismjs/components/prism-clike');
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    require('prismjs/components/prism-java');
  }

  Prism.languages.tlpp = Prism.languages.extend('java', {
    comment: [
      {
        pattern: /\/\/.*$/m,
        greedy: true,
      },
      {
        pattern: /\/\*[\s\S]*?\*\//,
        greedy: true,
      },
    ],
    string: [
      {
        pattern: /'(?:[^'\\]|\\.)*'/,
        greedy: true,
      },
      {
        pattern: /"(?:[^"\\]|\\.)*"/,
        greedy: true,
      },
    ],
    keyword: [
      {
        pattern: /@(?:Get|Post|Put|Delete|Patch|Rest)\b/i,
        alias: 'annotation',
      },
      {
        pattern:
          /\b(?:User\s+Function|Static\s+Function|EndClass|EndStruct|JsonObject|Local|Return|Class|Method|Public|Private|Default|Static|Function|If|Else|ElseIf|EndIf|For|Next|While|Do|Case|EndCase|EndDo|Break|Loop|As|And|Or|Not|Nil|Self|End|ConOut|FreeObj|ValType|Empty|Len|Character|Logical|Numeric|Object|Array)\b/i,
      },
    ],
    boolean: /\.[TF]\./,
    builtin: /\b(?:oRest|tlpp)\b/i,
    preprocessor: {
      pattern: /^#(?:include|define)\b[^\n]*/im,
      alias: 'important',
    },
    'class-name': [
      /\b[A-Z][a-zA-Z0-9_]*\b(?=\s*::\s*New\s*\()/,
      /\b[A-Z][a-zA-Z0-9_]*\b(?=\s+class\b)/i,
    ],
  });

  Prism.languages.insertBefore('tlpp', 'string', {
    'rest-annotation': {
      pattern: /@(?:Get|Post|Put|Delete|Patch|Rest)\s*\([^)]*\)/i,
      alias: 'annotation',
    },
  });

  Prism.languages.insertBefore('tlpp', 'comment', {
    'advpl-directive': {
      pattern: /^#(?:include|define)\b[^\n]*/im,
      alias: 'important',
    },
  });

  // Alias usado em fences ```advpl e em snippets legados
  Prism.languages.advpl = Prism.languages.tlpp;
}
