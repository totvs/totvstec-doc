/** Auto-generated from content-import/tlpp-rest-tdn.txt */
export const LOAD_URNS_NO_ANNOTATION = `// Static Function responsável por criar o nó contendo o vínculo entre as URNs e as APIs (funções) no objeto JSON recebido como parâmetro.
Static Function sLoadURNs(jEndpoints)
Local cDelPath      := "/documentation/noannotation/delete"
Local cGetPath      := "/documentation/noannotation/get"
Local cGetParamPath := "/documentation/noannotation/get/*"
Local cGetClassPath := "/documentation/noannotation/get/class"
Local cPatchPath    := "/documentation/noannotation/patch"
Local cPostPath     := "/documentation/noannotation/post"
Local cPutPath      := "/documentation/noannotation/put"
 
if (ValType(jEndpoints) == 'U' .Or. ValType(jEndpoints) != 'J')
    jEndpoints := jsonObject():New()
endIf
 
// Exemplo de mapeamento de verbo GET para Função
jEndpoints[cGetPath]                            := JsonObject():new()
jEndpoints[cGetPath]['GET']                     := JsonObject():new()
jEndpoints[cGetPath]['GET']['ProgramType']      := 0
jEndpoints[cGetPath]['GET']['ClassName']        := ""
jEndpoints[cGetPath]['GET']['Function']         := "U_getExampleNoAnnotation"
jEndpoints[cGetPath]['GET']['EndPoint']         := {"documentation", "noannotation", "get"}
 
// Exemplo de múltiplos verbos sob a mesma URL (Adicionando o verbo POST à rota cGetPath)
jEndpoints[cGetPath]['POST']                    := JsonObject():new()
jEndpoints[cGetPath]['POST']['ProgramType']     := 0
jEndpoints[cGetPath]['POST']['ClassName']       := ""
jEndpoints[cGetPath]['POST']['Function']        := "U_getExampleNoAnnotation"
jEndpoints[cGetPath]['POST']['EndPoint']        := {"documentation", "noannotation", "get"}
 
// Exemplo de mapeamento de rota contendo Parâmetro (Path Param)
jEndpoints[cGetParamPath]                       := JsonObject():new()
jEndpoints[cGetParamPath]['GET']                := JsonObject():new()
jEndpoints[cGetParamPath]['GET']['ProgramType'] := 0
jEndpoints[cGetParamPath]['GET']['ClassName']   := ""
jEndpoints[cGetParamPath]['GET']['Function']    := "U_getParamExampleNoAnnotation"
jEndpoints[cGetParamPath]['GET']['EndPoint']    := {"documentation", "noannotation", "get", ":myparam"}
 
// Exemplo de mapeamento apontando para Classe e Método, em vez de Função
jEndpoints[cGetClassPath]                       := JsonObject():new()
jEndpoints[cGetClassPath]['GET']                := JsonObject():new()
// Define ProgramType como 1 para indicar execução via Classe/Método
jEndpoints[cGetClassPath]['GET']['ProgramType'] := 1
jEndpoints[cGetClassPath]['GET']['ClassName']   := "getClassExampleNoAnnotation"
jEndpoints[cGetClassPath]['GET']['Function']    := "method_get"
jEndpoints[cGetClassPath]['GET']['EndPoint']    := {"documentation", "noannotation", "get", "class"}
 
// Exemplo de mapeamento de verbo DELETE
jEndpoints[cDelPath]                            := JsonObject():new()
jEndpoints[cDelPath]['DELETE']                  := JsonObject():new()
jEndpoints[cDelPath]['DELETE']['ProgramType']   := 0
jEndpoints[cDelPath]['DELETE']['ClassName']     := ""
jEndpoints[cDelPath]['DELETE']['Function']      := "U_deleteExampleNoAnnotation"
jEndpoints[cDelPath]['DELETE']['EndPoint']      := {"documentation", "noannotation", "delete"}
 
// Exemplo de mapeamento de verbo PATCH
jEndpoints[cPatchPath]                          := JsonObject():new()
jEndpoints[cPatchPath]['PATCH']                 := JsonObject():new()
jEndpoints[cPatchPath]['PATCH']['ProgramType']  := 0
jEndpoints[cPatchPath]['PATCH']['ClassName']    := ""
jEndpoints[cPatchPath]['PATCH']['Function']     := "U_patchExampleNoAnnotation"
jEndpoints[cPatchPath]['PATCH']['EndPoint']     := {"documentation", "noannotation", "patch"}
 
// Exemplo de mapeamento de verbo POST
jEndpoints[cPostPath]                           := JsonObject():new()
jEndpoints[cPostPath]['POST']                   := JsonObject():new()
jEndpoints[cPostPath]['POST']['ProgramType']    := 0
jEndpoints[cPostPath]['POST']['ClassName']      := ""
jEndpoints[cPostPath]['POST']['Function']       := "U_postExampleNoAnnotation"
jEndpoints[cPostPath]['POST']['EndPoint']       := {"documentation", "noannotation", "post"}
 
// Exemplo de mapeamento de verbo PUT
jEndpoints[cPutPath]                            := JsonObject():new()
jEndpoints[cPutPath]['PUT']                     := JsonObject():new()
jEndpoints[cPutPath]['PUT']['ProgramType']      := 0
jEndpoints[cPutPath]['PUT']['ClassName']        := ""
jEndpoints[cPutPath]['PUT']['Function']         := "U_putExampleNoAnnotation"
jEndpoints[cPutPath]['PUT']['EndPoint']         := {"documentation", "noannotation", "put"}
 
 
Return .T.
 
/* --------------------------------------------------------------------- /
/ Implementações físicas dos Endpoints referenciados no mapeamento     /
/ --------------------------------------------------------------------- */
 
function U_getExampleNoAnnotation() as logical
oRest:updateKeyHeaderResponse("Content-Type", "application/json;charset=utf-8")
return oRest:setStatusResponse(200, '{"tlpp_test":"get"}')
 
function U_getParamExampleNoAnnotation() as logical
Local jParam := oRest:getPathParamsRequest() as Json
Local cParam := "no_param" as character
if (ValType(jParam) == 'J')
cParam := jParam["myparam"]
if (ValType(cParam) != 'C')
cParam := "invalid_param"
endif
endif
oRest:updateKeyHeaderResponse("Content-Type", "application/json;charset=utf-8")
return oRest:setStatusResponse(200, '{"tlpp_test":"get with param: ' + cValToChar(cParam) + '"}')
 
function U_deleteExampleNoAnnotation() as logical
oRest:updateKeyHeaderResponse("Content-Type", "application/json;charset=utf-8")
return oRest:setStatusResponse(200, '{"tlpp_test":"delete"}')
 
function U_patchExampleNoAnnotation() as logical
oRest:updateKeyHeaderResponse("Content-Type", "application/json;charset=utf-8")
return oRest:setStatusResponse(200, '{"tlpp_test":"patch"}')
 
function U_postExampleNoAnnotation() as logical
oRest:updateKeyHeaderResponse("Content-Type", "application/json;charset=utf-8")
return oRest:setStatusResponse(200, '{"tlpp_test":"post"}')
 
function U_putExampleNoAnnotation() as logical
oRest:updateKeyHeaderResponse("Content-Type", "application/json;charset=utf-8")
return oRest:setStatusResponse(200, '{"tlpp_test":"put"}')
 
/* --------------------------------------------------------------------- /
/ Declaração e Implementação de Classe de Endpoint de Teste             /
/ --------------------------------------------------------------------- */
 
class getClassExampleNoAnnotation
public method new() as object
public method method_get() as logical
endclass
 
method new() as object class getClassExampleNoAnnotation
ConOut("### Creating class: " + "getClassExampleNoAnnotation")
return self
 
method method_get() as logical class getClassExampleNoAnnotation
oRest:updateKeyHeaderResponse("Content-Type", "application/json;charset=utf-8")
return oRest:setStatusResponse(200, '{"tlpp_test_class":"getClassExampleNoAnnotation"}')`;
export const LOAD_URNS_NO_ANNOTATION_LANG = 'advpl' as const;
