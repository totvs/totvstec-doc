/** Estrutura mínima do JsonObject passado a VdrCtrl():Start() */
export const JSON_CONFIG_MINIMO = `Local jConfig := JsonObject():New()
Local nResult  := 0

jConfig['HTTPSERVER'] := JsonObject():New()
jConfig['HTTPSERVER']['Enable']  := .T.
jConfig['HTTPSERVER']['Servers'] := {"HTTP_REST"}

jConfig['HTTP_REST'] := JsonObject():New()
jConfig['HTTP_REST']['Port']      := 9995
jConfig['HTTP_REST']['HostName']  := "localhost"
jConfig['HTTP_REST']['Locations'] := {"HTTP_ROOT"}

jConfig['HTTP_ROOT'] := JsonObject():New()
jConfig['HTTP_ROOT']['Path']       := "/"
jConfig['HTTP_ROOT']['RootPath']   := "root/web"
jConfig['HTTP_ROOT']['ThreadPool'] := "THREAD_POOL"

jConfig['THREAD_POOL'] := JsonObject():New()
jConfig['THREAD_POOL']['Environment'] := GetEnvServer()
jConfig['THREAD_POOL']['MinThreads']  := 1

nResult := VdrCtrl():New():Start(jConfig)`;
export const JSON_CONFIG_MINIMO_LANG = 'tlpp' as const;

/** Nó LoadURNs — mapeamento de rota + verbo sem annotation */
export const JSON_LOAD_URNS_MINIMO = `// Dentro do nó do servidor (ex.: jConfig['HTTP_REST'])
jConfig['HTTP_REST']['LoadURNs'] := JsonObject():New()

jConfig['HTTP_REST']['LoadURNs']['/users/:id'] := JsonObject():New()
jConfig['HTTP_REST']['LoadURNs']['/users/:id']['GET'] := JsonObject():New()
jConfig['HTTP_REST']['LoadURNs']['/users/:id']['GET']['ProgramType'] := 0
jConfig['HTTP_REST']['LoadURNs']['/users/:id']['GET']['ClassName']   := ""
jConfig['HTTP_REST']['LoadURNs']['/users/:id']['GET']['Function']    := "U_getUser"
jConfig['HTTP_REST']['LoadURNs']['/users/:id']['GET']['EndPoint']    := {"users", ":id"}`;
