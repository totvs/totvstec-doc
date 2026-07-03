/** Auto-generated from content-import/tlpp-rest-tdn.txt */
export const INI_BASIC_AUTH = `[HTTPSERVER]
Enable=1
Servers=HTTP_SRV
; ... outras chaves ...
 
[HTTP_SRV]
; Injeta a configuração de segurança informando o esquema e a função validadora
TlppData='{"Authorization":{"scheme":"basic","OnAuth":"U_onAuthorization"}}'
; ... outras chaves ...`;
export const INI_BASIC_AUTH_LANG = 'ini' as const;
