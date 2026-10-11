exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__),'_lib.py')).read())
call('POST','/api/auth/login',{'email':'admin@arvance.agency','password':'Adm1n!Test#2026'})
def crud(name,path,body,expect=201,extra=None):
    c,j,h=call('POST',path,body); ok=c==expect; check(f'{name} create ->{expect}',ok,(c,j))
    c2,j2,_=call('GET',path); check(f'{name} list 200',c2==200 and isinstance(j2.get('data'),list),(c2,str(j2)[:200]))
    if ok:
        c3,j3,_=call('POST',path,body); check(f'{name} duplicate handled (409 or 201 w/ generated slug)',c3 in (409,201,400),(c3,j3))
    return j.get('data') if isinstance(j,dict) else None
crud('services','/api/admin/services',{'name':'Smoke Svc','slug':'smoke-svc','description':'Short desc','features':['a','b']})
crud('team','/api/admin/team',{'slug':'jane-doe','email':'jane@example.com','name':'Jane Doe','role':'Designer','bio':'Bio text'})
crud('testimonials','/api/admin/testimonials',{'content':'Great agency, really recommend them','clientName':'Bob Smith','clientCompany':'Acme','clientPosition':'CEO'})
crud('portfolio','/api/admin/portfolio',{'title':'Case One','slug':'case-one','description':'desc','category':'web'})
cl=crud('clients','/api/admin/clients',{'name':'Client Co','email':'client@example.com','companyName':'Client Co Ltd'})
if cl: crud('projects','/api/admin/projects',{'name':'Proj','slug':'proj-1','clientId':cl['id'],'category':'web'})
crud('blog','/api/admin/blog',{'title':'Hello World Post','slug':'hello-world','excerpt':'ex','content':'<p>x</p>','category':'SEO'})
crud('booking-services','/api/admin/booking-services',{'name':'Intro Call','duration':30,'price':0})
crud('email-templates','/api/admin/email-templates',{'name':'Welcome','slug':'welcome','subject':'Welcome aboard','htmlContent':'<p>Hello there</p>'})
crud('email-campaigns','/api/admin/email-campaigns',{'name':'Camp1','subject':'Big news today','htmlContent':'<p>News here</p>'})
crud('reports','/api/admin/reports',{'name':'Weekly Leads','type':'table','dataSource':'leads'})
c,j,h=call('GET','/api/admin/report-templates'); check('report-templates list',c==200,(c,str(j)[:160]))
c,j,h=call('GET','/api/admin/kpi-metrics'); check('kpi-metrics list',c==200,(c,str(j)[:160]))
c,j,h=call('GET','/api/admin/analytics'); check('analytics GET',c in (200,400),(c,str(j)[:160]))
# public pages data
c,j,h=call('GET','/api/team/jane-doe'); check('public team/[slug] 200 (was always 404)',c==200 and 'active' not in j,(c,str(j)[:160]))
c,j,h=call('POST','/api/search',{'query':'Smoke'}); check('search finds the service via DB provider',c==200 and j.get('provider')=='database' and any(r['title']=='Smoke Svc' for r in j['results']),(c,str(j)[:200]))
c,j,h=call('POST','/api/search',{'query':'x'}); check('search short query -> 400',c==400,(c,j))
c,j,h=call('POST','/api/search',{'query':'Hello','types':['post']}); check('search posts',c==200 and any('hello-world' in r['url'] for r in j['results']),(c,str(j)[:200]))
json.dump([r[:2] for r in results],open('/tmp/res2.json','w'))
print('summary',sum(1 for r in results if r[1]),'/',len(results)); 
for r in results:
    if not r[1]: print('FAILED:',r[0],str(r[2])[:300])
