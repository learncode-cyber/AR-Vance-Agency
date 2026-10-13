import urllib.request,urllib.error,re
B='http://127.0.0.1:3100'
def get(p):
    try:
        r=urllib.request.urlopen(B+p,timeout=170); return r.status,r.read().decode(errors='ignore')
    except urllib.error.HTTPError as e: return e.code,e.read().decode(errors='ignore')
for p,must in [('/', ['application/ld+json']),('/services',['Smoke Svc']),('/blog',['Hello World Post']),('/blog/hello-world',['Hello World Post']),('/portfolio',['Case One']),('/portfolio/case-one',['Case One']),('/about',[]),('/contact',[]),('/team/jane-doe',[]),('/sitemap.xml',['<urlset']),('/robots.txt',['Sitemap']),('/admin/login',[]),('/kali_master/login',[]),('/definitely-not-a-page',[])]:
    c,t=get(p)
    miss=[m for m in must if m not in t]
    ok=(c==200 and not miss) if p!='/definitely-not-a-page' else c==404
    print(('PASS' if ok else 'FAIL'),p,c,('missing '+str(miss)) if miss else '', '' if ok else re.sub(r'\s+',' ',t[:160]))
