/** Exemplo OnError — mascaramento de falhas para o cliente */
export const EXEMPLO_ONERROR = `#include "tlpp-core.th"
#include "tlpp-rest.th"

/*
@param oError   Objeto com as propriedades e rastreio da falha de runtime
*/
Function U_onError( oError As Object )

Local cCodeTrace := U_getCodeTrace() As Character
Local cFault     := ''               As Character

// Grava detalhes sensíveis em log interno (não expor ao cliente)
U_TrataErro( cCodeTrace, oError:genCode, oError:description )

// Resposta mascarada para o cliente HTTP
cFault += '{'
cFault += '  "code": "' + cCodeTrace + '",'
cFault += '  "message": "Um erro interno ocorreu, por favor informe o administrador de sistema."'
cFault += '}'

If ( Type('oRest') == 'O' )
  oRest:SetFault( cFault )
EndIf

Return Nil`;
export const EXEMPLO_ONERROR_LANG = 'advpl' as const;
