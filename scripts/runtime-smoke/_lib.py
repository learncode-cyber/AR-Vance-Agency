import json,sys,urllib.request,urllib.error,http.cookiejar,subprocess,time
B='http://127.0.0.1:3100'
cj=http.cookiejar.CookieJar()
op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
def call(method,path,body=None,headers=None,raw=False,timeout=120):
    data=json.dumps(body).encode() if body is not None else None
    h={'Content-Type':'application/json'}; h.update(headers or {})
    req=urllib.request.Request(B+path,data=data,method=method,headers=h)
    try:
        r=op.open(req,timeout=timeout); code=r.status; txt=r.read().decode(); hd=dict(r.headers)
    except urllib.error.HTTPError as e:
        code=e.code; txt=e.read().decode(); hd=dict(e.headers)
    try: js=json.loads(txt)
    except Exception: js=txt[:200]
    return code,js,hd
results=[]
def check(name,ok,info=''):
    results.append((name,ok,info)); print(('PASS' if ok else 'FAIL'),name,info if not ok else '')
