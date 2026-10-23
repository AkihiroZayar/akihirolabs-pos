/*!
 * AkihiroLabs POS — js/views/inventory.js
 * Inventory table with stock adjust.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── Inventory ───────────────────────────────────────────────
function renderInv(){
  var wrap=div('fullcol');wrap.appendChild(mkTopbar());var sc=div('scroll');
  var hd=div('sechd',[span('sectit',t('inv'))]);
  if(S.user&&S.user.role==='admin'){hd.appendChild(btn('addbtn','+ '+t('aprod'),function(){S.modal={type:'aprod',data:{name:'',price:'',stock:'',category:'',minStock:'5',hasSizes:false,sizes:[]}};render();}));}
  sc.appendChild(hd);
  var tbl=h('table',{cls:'dtable'});var thead=h('thead');var hr=h('tr');
  [t('nm'),t('cat'),t('pr'),t('sizes'),t('st')+'  \xb1','Status',''].forEach(function(lbl,i){var th=h('th',{},lbl);if(i===0)th.style.width='24%';if(i===3)th.style.width='14%';if(i===4)th.style.width='110px';if(i===6)th.style.width='60px';hr.appendChild(th);});
  thead.appendChild(hr);tbl.appendChild(thead);
  var tbody=h('tbody');
  var sorted=[].concat(S.products).sort(function(a,b){return a.name.localeCompare(b.name);});
  sorted.forEach(function(p){
    var tr=h('tr');
    tr.appendChild(h('td',{style:'font-weight:600'},p.name));
    tr.appendChild(h('td',{style:'color:var(--muted)'},p.category));
    tr.appendChild(h('td',{},ks(p.price)));
    tr.appendChild(h('td',{style:'color:var(--accent2);font-size:11px'},p.sizes&&p.sizes.length?p.sizes.map(function(s){return s.label+'('+ks(s.price)+')';}).join(', '):'\u2014'));
    var sc2=div('stock-ctrl');
    var dm=btn('stock-btn',icon('minus',12),function(){adjStock(p.id,-1);});
    var sv=span('stock-val',String(p.stock));
    var dp=btn('stock-btn','+',function(){adjStock(p.id,1);});
    sc2.appendChild(dm);sc2.appendChild(sv);sc2.appendChild(dp);
    var std=h('td');std.appendChild(sc2);tr.appendChild(std);
    var minStk=p.minStock||0;
    var st2=p.stock===0?'bout':(minStk>0&&p.stock<=minStk?'blow':'bok');
    var sl=p.stock===0?t('oos'):(minStk>0&&p.stock<=minStk?t('low',{n:p.stock}):'OK');
    var std2=h('td');std2.appendChild(span('badge '+st2,sl));tr.appendChild(std2);
    var atd=h('td');
    if(S.user&&S.user.role==='admin'){var eb=btn('btn','Edit',function(){S.modal={type:'eprod',data:Object.assign({},p,{hasSizes:!!(p.sizes&&p.sizes.length),sizes:p.sizes?p.sizes.map(function(s){return Object.assign({},s);}):[]})};render();});eb.style.cssText='padding:4px 9px;font-size:11px';atd.appendChild(eb);}
    tr.appendChild(atd);tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);sc.appendChild(tbl);wrap.appendChild(sc);return[wrap];
}
