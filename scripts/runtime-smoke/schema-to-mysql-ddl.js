const fs=require('fs');
const w=require('./node_modules/@prisma/prisma-schema-wasm');
const schema=fs.readFileSync('./prisma/schema.prisma','utf8');
const dmmf=JSON.parse(w.get_dmmf(JSON.stringify({prismaSchema:schema,noColor:true})));

// native types parsed from schema text (this DMMF omits nativeType)
const native={};
{let cur=null;for(const line of schema.split('\n')){const mm=line.match(/^model (\w+) \{/);if(mm){cur=mm[1];native[cur]={};continue}
 if(line.startsWith('}')){cur=null;continue}
 if(!cur)continue;const fm=line.match(/^\s+(\w+)\s+\S+.*?@db\.(\w+)(?:\(([^)]*)\))?/);
 if(fm)native[cur][fm[1]]=[fm[2],fm[3]?fm[3].split(',').map(x=>x.trim()):[]];}}
const enums=Object.fromEntries(dmmf.datamodel.enums.map(e=>[e.name,e]));
const q=n=>'`'+n+'`';
const out=[];
for(const m of dmmf.datamodel.models){
  const table=m.dbName||m.name;
  const cols=[];const pk=[];
  for(const f of m.fields){
    if(f.kind==='object')continue;
    let t;
    const nt=f.nativeType||(native[m.name]&&native[m.name][f.name]);
    if(f.kind==='enum') t='VARCHAR(191)';
    else if(nt){const [n,a]=nt;const args=a&&a.length?`(${a.join(',')})`:'';
      t={Text:'TEXT',LongText:'LONGTEXT',MediumText:'MEDIUMTEXT',VarChar:'VARCHAR',Char:'CHAR',Int:'INT',Decimal:'DECIMAL',Double:'DOUBLE',Float:'FLOAT',TinyInt:'TINYINT',SmallInt:'SMALLINT',BigInt:'BIGINT',DateTime:'DATETIME',Date:'DATE',Timestamp:'TIMESTAMP',Json:'JSON'}[n]?({Text:'TEXT',LongText:'LONGTEXT',MediumText:'MEDIUMTEXT',Json:'JSON'}[n]||({VarChar:'VARCHAR',Char:'CHAR',Int:'INT',Decimal:'DECIMAL',Double:'DOUBLE',Float:'FLOAT',TinyInt:'TINYINT',SmallInt:'SMALLINT',BigInt:'BIGINT',DateTime:'DATETIME',Date:'DATE',Timestamp:'TIMESTAMP'}[n]+args)):n+args;}
    else t={String:'VARCHAR(191)',Int:'INT',Float:'DOUBLE',Boolean:'BOOLEAN',DateTime:'DATETIME(3)',Json:'LONGTEXT',BigInt:'BIGINT',Decimal:'DECIMAL(65,30)',Bytes:'LONGBLOB'}[f.type];
    if(!t) throw new Error('type '+m.name+'.'+f.name+' '+f.type);
    let line=`${q(f.dbName||f.name)} ${t}${f.isRequired?' NOT NULL':' NULL'}`;
    if(f.hasDefaultValue&&f.default!==undefined){
      const d=f.default;
      if(typeof d==='object'&&d!==null){ if(d.name==='autoincrement')line+=' AUTO_INCREMENT'; else if(d.name==='now')line+=' DEFAULT CURRENT_TIMESTAMP(3)'; }
      else if(typeof d==='boolean')line+=` DEFAULT ${d?1:0}`;
      else if(typeof d==='number')line+=` DEFAULT ${d}`;
      else if(typeof d==='string'&&!/TEXT|BLOB|JSON/.test(t))line+=` DEFAULT '${d.replace(/'/g,"''")}'`;
    }
    cols.push(line);
    if(f.isId)pk.push(q(f.dbName||f.name));
  }
  if(m.primaryKey)for(const c of m.primaryKey.fields)pk.push(q(c));
  const cname=(n)=>{const f=m.fields.find(x=>x.name===n);return q(f?(f.dbName||f.name):n)};
  const idx=[];
  for(const f of m.fields)if(f.isUnique&&!f.isId)idx.push(`UNIQUE KEY ${q('u_'+(f.dbName||f.name))} (${cname(f.name)}${/TEXT|BLOB/.test(JSON.stringify(f.nativeType||''))?'(191)':''})`);
  for(const u of m.uniqueFields||[])idx.push(`UNIQUE KEY ${q('u_'+u.join('_'))} (${u.map(cname).join(',')})`);
  for(const i of m.indexes||[]) { if(i.type==='fulltext')continue; idx.push(`KEY ${q('i_'+(i.name||i.fields.map(x=>x.name||x).join('_')).slice(0,50))} (${i.fields.map(x=>cname(x.name||x)).join(',')})`);} 
  const seen=new Set();const idx2=idx.filter(x=>{const k=x.replace(/KEY `[^`]*`/,'KEY');if(seen.has(k))return false;seen.add(k);return true});
  const all=[...cols,...(pk.length?[`PRIMARY KEY (${pk.join(',')})`]:[]),...idx2];
  out.push(`CREATE TABLE ${q(table)} (\n  ${all.join(',\n  ')}\n) DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;`);
}
fs.writeFileSync('./schema.sql',out.join('\n\n'));
console.log('tables',out.length);
