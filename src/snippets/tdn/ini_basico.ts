/** Auto-generated from content-import/tlpp-rest-tdn.txt */
export const INI_BASICO = `[HTTPSERVER]
Enable=1
Servers=HTTP_REST
 
[HTTP_REST]
hostname=localhost
port=9995
locations=HTTP_ROOT
 
[HTTP_ROOT]
Path=/
RootPath=root/web
ThreadPool=THREAD_POOL
 
[THREAD_POOL]
Environment=ENV
MinThreads=1`;
export const INI_BASICO_LANG = 'ini' as const;
