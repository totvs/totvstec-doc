/** Annotation com metadados OpenAPI opcionais (title, description, responses) */
export const EXEMPLO_ANNOTATION_METADADOS = `#include "tlpp-core.th"
#include "tlpp-rest.th"

@Get(;
    endpoint = "users/:id",;
    title = "Busca usuário",;
    description = "Retorna um usuário pelo ID informado na URL",;
    responses = '[{"statusCode":200,"description":"OK"},{"statusCode":404,"description":"Não encontrado"}]';
)
User Function getUser()
    Local jParams := oRest:getPathParamsRequest()
    // implementação...
Return .T.`;
export const EXEMPLO_ANNOTATION_METADADOS_LANG = 'tlpp' as const;
