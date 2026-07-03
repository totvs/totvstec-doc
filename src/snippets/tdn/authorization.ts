/** Callback Basic Auth — validação de usuário e senha */
export const EXEMPLO_ON_AUTH = `#include "tlpp-core.th"
#include "tlpp-rest.th"

/*
Callback de validação da autenticação Basic.
*/
User Function onAuthorization(cUser As Character, cPass As Character) As Logical
    Local lRet := .F. As Logical

    lRet := (cUser == 'test_user' .And. cPass == 'test_pass')

Return lRet`;
export const EXEMPLO_ON_AUTH_LANG = 'tlpp' as const;

/** TlppData Basic Auth via JSON em VdrCtrl():Start() */
export const JSON_BASIC_AUTH = `jConfig['HTTP_SRV'] := JsonObject():New()
// ... demais chaves do servidor ...

jConfig['HTTP_SRV']['TlppData'] := '{"Authorization":{"scheme":"basic","OnAuth":"U_onAuthorization"}}'`;

/** INI completo — servidor OAuth2 com SSL (porta dedicada) */
export const INI_OAUTH2 = `[HTTPSERVER]
Enable=1
Log=0
Servers=HTTPS_OAUTH2_47500

[HTTPS_OAUTH2_47500]
HostName=localhost
Port=47500
Locations=HTTPS_ROOT_OAUTH2
ContentTypes=CT_HTTP
SslCertificate=_certs\\cloud_cert_with_no_chain.pem
SslCertificateKey=_certs\\cloud_key.pem
Charset=UTF-8
TlppData={"Authorization":{"scheme":"oAuth2","onAuth":"","onAuthNoCheckUri":"u_noCheckUri","onAuthparams":"u_paramsProvider"}}

[HTTPS_ROOT_OAUTH2]
Path=/rest
RootPath=root/web
DefaultPage=index.html
AllowMethods=GET, HEAD, POST, PUT, DELETE, PATCH, OPTIONS
ThreadPool=THREAD_POOL_OAUTH2

[THREAD_POOL_OAUTH2]
Environment=TLPPCORE
MinThreads=1
MaxThreads=2
MinFreeThreads=1
GrowthFactor=1
InactiveTimeout=30000
AcceptTimeout=10000`;
export const INI_OAUTH2_LANG = 'ini' as const;

/** White-list de URIs públicas (sem validação de token) */
export const OAUTH2_NO_CHECK_URI = `#include "tlpp-core.th"

Function u_noCheckUri()
    Local aRet := {} As Array

    aAdd(aRet, '/test/oauth2/nocheckeduri')

Return aRet`;

/** Validação customizada de access token (opcional — vazio usa validador nativo) */
export const OAUTH2_VALIDA_TOKEN = `Function u_validaToken(cToken As Character, cPath As Character) As Logical
    Local lRet := .F. As Logical

    // sua lógica de validação do token e da URI

Return lRet`;

/** Params provider — Appserver 20.3.1+ (retorna JsonObject) */
export const OAUTH2_PARAMS_PROVIDER = `#include "tlpp-core.th"

#define _rest_oAuth2_secret_ 'secret_do_cliente'
#define _rest_oAuth2_access_expires 3600
#define _rest_oAuth2_refresh_expires 'Date()+1'
#define _rest_oAuth2_client_id 'id_do_cliente'
#define _rest_oAuth2_user 'nome_do_username'
#define _rest_oAuth2_password 'senha_do_username'

Function u_paramsProvider()
    Local jTlppParams := JsonObject():New()
    Local cTlppParams := '{' + ;
        '"client_id":"' + _rest_oAuth2_client_id + '",' + ;
        '"client_secret":"' + _rest_oAuth2_secret_ + '",' + ;
        '"username":"' + _rest_oAuth2_user + '",' + ;
        '"password":"' + _rest_oAuth2_password + '",' + ;
        '"access_expires":' + cValToChar(_rest_oAuth2_access_expires) + ',' + ;
        '"refresh_expires":"' + _rest_oAuth2_refresh_expires + '",' + ;
        '"grant_type":"password"' + ;
        '}'

    jTlppParams:fromJson(cTlppParams)

Return jTlppParams`;

/** Params provider flexível — múltiplos usuários (20.3.1+) */
export const OAUTH2_FLEXIBLE_PARAMS = `#include "tlpp-core.th"

Function U_flexibleParamsProvider()
    Local jTlppParams := JsonObject():New()
    Local cStringToJson := '{"client":[{"client_id":"7LpPC0r3","client_secret":"TlPp#S3cre7@"}],' + ;
        '"expires":[{"access_expires":3600,"refresh_expires":"Date()+1"}],' + ;
        '"users":[{"username":"ademir_da_guia","password":"F1t3bol"},' + ;
        '{"username":"mark","password":"Met@vers0"}],' + ;
        '"types":[{"grant_type":"password"}],' + ;
        '"username":"josedascouves",' + ;
        '"password":"1234xpto"}'

    jTlppParams:fromJson(cStringToJson)

Return jTlppParams`;
