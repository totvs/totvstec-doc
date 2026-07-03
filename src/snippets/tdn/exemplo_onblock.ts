/** Exemplo OnBlock — bloqueio/ocultação de endpoints na subida do REST */
export const EXEMPLO_ONBLOCK = `Function U_onBlock( oList )

  Local cEndpoint       := ''
  Local cServiceName    := oList:getServiceName()
  Local nServicePort    := oList:getServicePort()
  Local cThreadPoolName := oList:getThreadPoolName()
  Local cUserData       := oList:getUserData()
  Local jApis           := oList:getApiList()

  // Bloqueia ou oculta endpoint + método (use conforme necessidade)
  cEndpoint := '/exemplo1/urn'
    oList:block( cEndpoint, 'get'  )
    oList:block( cEndpoint, 'post' )
    oList:hide(  cEndpoint, 'put'  )

  cEndpoint := '/exemplo2/urn'
    oList:block( cEndpoint, 'get' )

Return Nil`;
export const EXEMPLO_ONBLOCK_LANG = 'advpl' as const;
