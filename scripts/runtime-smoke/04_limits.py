exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__),'_lib.py')).read())
import hmac,hashlib,struct,base64
def totp(secret,t=None):
    key=base64.b32decode(secret+'='*((8-len(secret)%8)%8)); step=int((t or time.time())//30)
    h=hmac.new(key,struct.pack('>Q',step),hashlib.sha1).digest(); o=h[-1]&15
    return str((struct.unpack('>I',h[o:o+4])[0]&0x7fffffff)%10**6).zfill(6)
c,j,h=call('POST','/api/auth/login',{'email':'admin@arvance.agency','password':'Adm1n!Test#2026'}); check('login',c==200,(c,j))
# rate limit exactly: limit 3 -> calls 1-3 ok, 4th 429
c,j,h=call('POST','/api/admin/api-keys',{'name':'RL key','scopes':['services:read'],'rateLimitPerHour':3}); raw=j['key']
def ext(key):
    req=urllib.request.Request(B+'/api/external/v1/services',headers={'Authorization':'Bearer '+key})
    try: r=urllib.request.urlopen(req,timeout=60); return r.status
    except urllib.error.HTTPError as e: return e.code
codes=[ext(raw) for _ in range(4)]; check('per-key limit 3: [200,200,200,429]',codes==[200,200,200,429],codes)
# 2FA backup code single-use (fresh limiter)
c,j,h=call('POST','/api/admin/2fa/setup'); sec=j['secret']
c,j,h=call('POST','/api/admin/2fa/enable',{'code':totp(sec)}); b=j['backupCodes']
cj2=http.cookiejar.CookieJar(); op2=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj2))
def login2(body):
    req=urllib.request.Request(B+'/api/auth/login',data=json.dumps(body).encode(),method='POST',headers={'Content-Type':'application/json'})
    try: r=op2.open(req,timeout=60); return r.status,json.loads(r.read())
    except urllib.error.HTTPError as e: return e.code,json.loads(e.read())
pw={'email':'admin@arvance.agency','password':'Adm1n!Test#2026'}
c1,_=login2({**pw,'totp':b[0]}); c2,j2=login2({**pw,'totp':b[0]})
check('backup code works once then is rejected',c1==200 and c2==401,(c1,c2,j2))
# brute-force protection: >5 attempts per account in window -> 429
res=[login2({**pw,'password':'bad'+str(i)})[0] for i in range(8)]
check('login brute-force limit reached (429 appears)',429 in res,res)
print('summary',sum(1 for r in results if r[1]),'/',len(results))
for r in results:
    if not r[1]: print('FAILED:',r[0],str(r[2])[:300])
