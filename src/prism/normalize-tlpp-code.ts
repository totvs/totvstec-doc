const INDENT = '    ';

const FUNCTION_DECL =
  /^(?:User\s+Function|Static\s+Function|Function\s+\w)/i;
const ANNOTATION = /^@(Get|Post|Put|Patch|Delete|Rest)\b/i;
const INCLUDE = /^#include\b/i;
/** Return de função — sempre na margem esquerda, alinhado ao `User Function`. */
const RETURN_LINE = /^Return\b/i;

/**
 * Formata exemplos TLPP/ADVPL para o padrão da documentação:
 *
 * User Function hello()
 *     oRest:setResponse('...')
 * Return .T.
 */
export function normalizeTlppCode(code: string): string {
  const lines = code.replace(/\t/g, INDENT).split('\n');
  let inFunction = false;

  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      if (INCLUDE.test(trimmed) || ANNOTATION.test(trimmed)) {
        inFunction = false;
        return trimmed;
      }

      if (FUNCTION_DECL.test(trimmed)) {
        inFunction = true;
        return trimmed;
      }

      if (RETURN_LINE.test(trimmed)) {
        inFunction = false;
        return trimmed;
      }

      if (inFunction) {
        return INDENT + trimmed;
      }

      return trimmed;
    })
    .join('\n');
}
