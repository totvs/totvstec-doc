/**
 * Catálogo dos motivos de erro que aparecem no api_doc_report.json.
 *
 * Cada entrada casa com o texto de `reason` (o AppServer pode variar espaços,
 * por isso o uso de regex) e com o status em que o motivo faz sentido.
 * Trechos entre crases são exibidos como código.
 */

export interface ErrorInfo {
  id: string;
  status: 'generate_error' | 'read_error';
  match: RegExp;
  why: string;
  fix: string;
}

export const STATUS_INTRO: Record<string, string> = {
  generate_error:
    'A documentação foi lida, mas algum campo veio ausente ou com o tipo errado e quebrou a exportação para o YAML.',
  read_error:
    'Vêm do lado do dev: a função de documentação falhou ou o JSON não é válido. O motor já trata esses casos e devolve uma mensagem própria.',
};

export const ERROR_CATALOG: ErrorInfo[] = [
  /* ── Erros de exportação ── */
  {
    id: 'mismatch-plus',
    status: 'generate_error',
    match: /type mismatch on \+/i,
    why: 'O motor concatena `name`, `in` ou `required` direto na string do YAML. Se o campo falta, ou se `required` é número e não lógico, a soma de texto com Nil ou número quebra.',
    fix: 'Todo item de `params` precisa ter `name` e `in` como texto, e `required` como `true`/`false`.',
  },
  {
    id: 'left-nil',
    status: 'generate_error',
    match: /expected C->U,\s*function left/i,
    why: '`getStringRestDOC` faz `Left(cDesc,10)` sem checar se `description` existe. Falta o `description` da doc ou de um item de `values`.',
    fix: 'Informar `description` na doc e em cada item de `values`.',
  },
  {
    id: 'mismatch-compare',
    status: 'generate_error',
    match: /type mismatch on compare/i,
    why: 'O motor compara `statusCode == 200`, e `"200"` como texto não pode ser comparado com número.',
    fix: '`statusCode` tem que ser número: `200`, não `"200"`.',
  },
  {
    id: 'not-object',
    status: 'generate_error',
    match: /variable is not an object/i,
    why: 'O motor espera que cada item de `Content-Type` seja um objeto (`{"json":{...}}`) e chama `:GetNames()` nele. Um texto como `"application/json"` quebra essa chamada.',
    fix: 'Usar `[{"json":{"type":"component","component":"X"}}]`.',
  },
  {
    id: 'lower-number',
    status: 'generate_error',
    match: /expected C->N,\s*function lower/i,
    why: '`getTypesYAML` faz `lower(cType)`, e o `type` veio como número.',
    fix: '`type` tem que ser texto: `"character"`, `"numeric"` etc.',
  },

  /* ── Erros de leitura ── */
  {
    id: 'invalid-json',
    status: 'read_error',
    match: /JSON de documentacao invalido/i,
    why: 'O texto do i18n ou da função não passa no `fromJson`: falta vírgula, chave sem aspas ou colchete aberto.',
    fix: 'Validar o JSON antes, num validador comum.',
  },
  {
    id: 'out-of-bounds',
    status: 'read_error',
    match: /array out of bounds/i,
    why: 'A função `_DOC` lançou uma exceção, que o motor capturou e repassou.',
    fix: 'Corrigir o bug dentro da função de documentação.',
  },
  {
    id: 'empty-odoc',
    status: 'read_error',
    match: /nao foi possivel extrair o JSON do objeto de DOC/i,
    why: 'A função usou o `oDoc`, mas nenhuma chamada foi aceita (por exemplo, `setTitle("")`), então o `toJson` voltou vazio.',
    fix: 'Chamar os métodos do `oDoc` com valores válidos.',
  },
  {
    id: 'invalid-signature',
    status: 'read_error',
    match: /invalid signature/i,
    why: 'A função destruiu ou trocou o `oDoc` recebido, e o motor não reconhece mais o objeto que entregou.',
    fix: 'Não chamar `destroy()` nem reatribuir o `oDoc` recebido.',
  },
];

export function explainError(status: string, reason: string): ErrorInfo | undefined {
  if (!reason) return undefined;
  return ERROR_CATALOG.find((e) => e.status === status && e.match.test(reason));
}

/** Versão em texto puro, para o CSV. */
export function plainText(s: string): string {
  return s.replace(/`/g, '');
}
