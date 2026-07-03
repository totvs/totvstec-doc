/** Auto-generated from content-import/tlpp-rest-tdn.txt */
export const INI_COMPLETO_SSL_SLAVES = `[HTTPSERVER]

Enable=1
Log=0
Servers=HTTP_SSL_SERVER
​
[HTTP_SSL_SERVER]
HostName=localhost
Port=443
Charset=UTF-8
Locations=HTTP_ROOT
ContentTypes=ContentTypes
SslCertificate=SSL_certificate.crt
SslCertificateKey=SSL_certificate_key.pem
TlppData='{"Authorization":{"scheme":"basic","OnAuth":"userRestAuthorization"}}'
UserData='{"chave":"valor"}'
​
[HTTP_ROOT]
Path=/
RootPath=root/web
DefaultPage=index.html
AllowMethods=GET, HEAD, POST, PUT, DELETE, PATCH, OPTIONS
ThreadPool=THREAD_POOL
​
[THREAD_POOL]
Environment=ENV
MinThreads=1
MaxThreads=4
MinFreeThreads=1
GrowthFactor=1
InactiveTimeout=30000
AcceptTimeout=10000
Slaves=SLAVE_01,SLAVE_02
UserExits=THREAD_POOL_UEX
​
[THREAD_POOL_UEX]
OnBlock=userRestBlockURNs
OnStart=userRestEnvironment
OnStop=userRestStop
OnSelect=userRestGrader
OnError=userRestError
OnSend=userRestSendBeforeMessages
​
[SLAVE_01]
Environment=ENV
MinThreads=1
MaxThreads=2
MinFreeThreads=1
GrowthFactor=1
InactiveTimeout=30000
AcceptTimeout=10000
UserExits=THREAD_POOL_SLAVES_UEX
​
[SLAVE_02]
Environment=TLPPCORE
MinThreads=2
MaxThreads=4
MinFreeThreads=2
GrowthFactor=1
InactiveTimeout=30000
AcceptTimeout=10000
UserExits=THREAD_POOL_SLAVES_UEX
​
[THREAD_POOL_SLAVES_UEX]
OnStart=userRestEnvironmentSlave
OnStop=userRestStopSlave
OnSelect=restGraderSlave
OnError=userRestErrorSlave
OnSend=userRestSendBeforeMessagesSalve
​
[ContentTypes]
json = text/plain;charset=UTF-8
xml = text/xml;charset=UTF-8
htm = text/html;charset=UTF-8
html = text/html;charset=UTF-8
txt = text/plain;charset=UTF-8`;
export const INI_COMPLETO_SSL_SLAVES_LANG = 'ini' as const;
