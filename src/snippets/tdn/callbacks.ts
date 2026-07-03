/** OnAllow — lista branca de endpoints (inverso do OnBlock) */
export const EXEMPLO_ONALLOW = `Function U_onAllow(oList)
    Local cEndpoint       := ''
    Local cServiceName    := oList:getServiceName()
    Local nServicePort    := oList:getServicePort()
    Local cThreadPoolName := oList:getThreadPoolName()
    Local cUserData       := oList:getUserData()
    Local jApis           := oList:getApiList()

    cEndpoint := '/exemplo1/urn'
    oList:allow(cEndpoint, 'get')
    oList:allow(cEndpoint, 'post')
    oList:hide(cEndpoint, 'put')

    cEndpoint := '/exemplo2/urn'
    oList:allow(cEndpoint, 'get')

Return Nil`;

/** OnSelect — escolha de slave para atender a requisição */
export const EXEMPLO_ONSELECT = `#include "tlpp-core.th"
#include "tlpp-rest.th"

Function u_restGrader(cClassName As Character, cFunctionName As Character, cProgramType As Character) As Integer
    Local nIndex  := -1 As Integer
    Local aSlaves := oRest:GetThreadPoolSlaves() As Array
    Local nA      := 0 As Integer

    For nA := 1 To Len(aSlaves)
        If (aSlaves[nA]:ID == 6)
            nIndex := nA
            Exit
        EndIf
    Next

Return nIndex`;

/** OnStart — preparação ao criar thread */
export const EXEMPLO_ONSTART = `#include "tlpp-core.th"
#include "tlpp-rest.th"

User Function onStart() As Logical
    Local lOK := .T. As Logical

    lOK := U_preparaAmbiente()

Return lOK`;

/** OnStop — limpeza ao encerrar thread */
export const EXEMPLO_ONSTOP = `#include "tlpp-core.th"
#include "tlpp-rest.th"

User Function onStop() As Logical
    Local lOK := .T. As Logical

    lOK := U_fechaAmbiente()

Return lOK`;

/** OnSend — ajuste final antes de enviar resposta ao cliente */
export const EXEMPLO_ONSEND = `#include "tlpp-core.th"
#include "tlpp-rest.th"

Function U_OnSend()
    Local cMsgSend := oRest:getBodyResponse()
    Local jValue   := JsonObject():New()
    Local uRet     := Nil

    If (!Empty(cMsgSend))
        uRet := jValue:FromJson(cMsgSend)

        If (ValType(uRet) == "U")
            oRest:updateKeyHeaderResponse("Content-Type", "application/json")
        Else
            oRest:updateKeyHeaderResponse("Content-Type", "text/plain")
        EndIf

        FreeObj(jValue)
    EndIf

Return Nil`;

/** User Exits via JSON — mesmo modelo do INI */
export const USER_EXITS_JSON = `jConfig['THREAD_POOL']['UserExits'] := "TP_UEX"

jConfig['TP_UEX'] := JsonObject():New()
jConfig['TP_UEX']['OnBlock']  := "U_OnBlock"
jConfig['TP_UEX']['OnSelect'] := "U_OnSelect"
jConfig['TP_UEX']['OnError']  := "U_OnError"

jConfig['SLAVE_01']['UserExits'] := "SLAVES_UEX"

jConfig['SLAVES_UEX'] := JsonObject():New()
jConfig['SLAVES_UEX']['OnStart'] := "U_OnStart"
jConfig['SLAVES_UEX']['OnStop']  := "U_OnStop"
jConfig['SLAVES_UEX']['OnSend']  := "U_OnSend"
jConfig['SLAVES_UEX']['OnError']  := "U_OnError"`;
