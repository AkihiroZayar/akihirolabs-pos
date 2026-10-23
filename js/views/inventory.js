/*!
 * AkihiroLabs POS — js/views/inventory.js
 * Inventory table with stock adjust.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── Inventory ───────────────────────────────────────────────
function renderInv(){
  var wrap=div('fullcol');var sc=div('scroll');
  var hd=div('sechd',[span('sectit',t('inv'))]);
  if(S.user&&S.user.role==='admin'){hd.appendChild(btn('addbtn','+ '+t('aprod'),function(){S.modal={type:'aprod',data:{name:'',price:'',stock:'',category:'',minStock:'5',hasSizes:false,sizes:[]}};render();}));}
  sc.appendChild(hd);
  var nc=S.products.filter(function(p){return p.needsCount;}).length;
  if(nc)sc.appendChild(div('count-banner',[icon('alert',16),span('',t('needCount',{n:nc}))]));
  var tbl=h('table',{cls:'dtable'});var thead=h('thead');var hr=h('tr');
  [t('nm'),t('cat'),t('pr'),t('sizes'),t('st')+'  \xb1',t('status'),''].forEach(function(lbl,i){var th=h('th',{},lbl);if(i===0)th.style.width='24%';if(i===3)th.style.width='14%';if(i===4)th.style.width='170px';if(i===6)th.style.width='80px';hr.appendChild(th);});
  thead.appendChild(hr);tbl.appendChild(thead);
  var tbody=h('tbody');
  var sorted=[].concat(S.products).sort(function(a,b){return a.name.localeCompare(b.name);});
  sorted.forEach(function(p){
    var tr=h('tr');
    tr.appendChild(h('td',{style:'font-weight:600'},p.name));
    tr.appendChild(h('td',{style:'color:var(--muted)'},p.category));
    tr.appendChild(h('td',{},ks(p.price)));
    tr.appendChild(h('td',{style:'color:var(--accent2);font-size:11px'},p.sizes&&p.sizes.length?p.sizes.map(function(s){return s.label+' '+ks(s.price);}).join(', '):'\u2014'));
    var std=h('td');
    function stockCtrl(val,size,lbl){var c=div('stock-ctrl');if(lbl)c.appendChild(span('stock-sz',lbl));
      c.appendChild(btn('stock-btn',icon('minus',12),function(){adjStock(p.id,-1,size);}));c.appendChild(span('stock-val',String(val)));
      c.appendChild(btn('stock-btn',icon('plus',12),function(){adjStock(p.id,1,size);}));return c;}
    if(hasSz(p)){var sw=div('stock-sizes');p.sizes.forEach(function(s){sw.appendChild(stockCtrl(Number(s.stock)||0,s.label,s.label));});std.appendChild(sw);}
    else std.appendChild(stockCtrl(p.stock,null,null));
    tr.appendChild(std);
    var lowE=lowStk().filter(function(e){return e.prod.id===p.id;});
    var st2=p.stock<=0?'bout':(lowE.length?'blow':'bok');
    var sl=p.stock<=0?t('oos'):(lowE.length?(hasSz(p)?lowE.map(function(e){return e.size;}).join(', ')+' '+t('lowStock').toLowerCase():t('low',{n:p.stock})):'OK');
    var std2=h('td');std2.appendChild(span('badge '+st2,sl));if(p.needsCount){std2.appendChild(h('br'));std2.appendChild(span('badge bcount',t('setCounts')));}tr.appendChild(std2);
    var atd=h('td');
    if(S.user&&S.user.role==='admin'){var eb=btn('btn',t('edit'),function(){S.modal={type:'eprod',data:Object.assign({},p,{hasSizes:!!(p.sizes&&p.sizes.length),sizes:p.sizes?p.sizes.map(function(s){return Object.assign({},s);}):[]})};render();});eb.style.cssText='padding:4px 9px;font-size:11px';atd.appendChild(eb);}
    tr.appendChild(atd);tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);sc.appendChild(tbl);wrap.appendChild(sc);return[wrap];
}
