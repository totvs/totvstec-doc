/** INI — User Exits em Thread Pool e Slaves */
export const USER_EXITS_INI = `[THREAD_POOL]
UserExits=TP_UEX
Slaves=SLAVE_01,SLAVE_02

[TP_UEX]
OnBlock=U_OnBlock
;OnAllow=U_OnAllow
OnSelect=U_OnSelect
OnError=U_OnError

[SLAVE_01]
UserExits=SLAVES_UEX

[SLAVE_02]
UserExits=SLAVES_UEX

[SLAVES_UEX]
OnStart=U_OnStart
OnStop=U_OnStop
OnSend=U_OnSend
OnError=U_OnError`;
export const USER_EXITS_INI_LANG = 'ini' as const;
