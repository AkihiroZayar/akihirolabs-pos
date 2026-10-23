/*!
 * AkihiroLabs POS — js/views/reports.js
 * Reports: date filter, metrics, product breakdown, recent sales.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── Reports ─────────────────────────────────────────────────
function renderRep(){
  var wrap=div('fullcol');var sc=div('scroll');
  var fr=div('frow');
  fr.appendChild(span('flbl',t('fr')));var fi=inp({cls:'dinput',type:'date',value:S.from});fi.onchange=function(e){S.from=e.target.value;render();};fr.appendChild(fi);
  fr.appendChild(span('flbl',t('tw')));var ti=inp({cls:'dinput',type:'date',value:S.to});ti.onchange=function(e){S.to=e.target.value;render();};fr.appendChild(ti);
  fr.appendChild(btn('btn',t('alt'),function(){S.from='';S.to='';render();}));
  fr.appendChild(btn('btn',t('tdy'),function(){var d=new Date().toISOString().split('T')[0];S.from=d;S.to=d;render();}));
  sc.appendChild(fr);
  sc.appendChild(div('dlrow',[btn('dlbtn dlcsv',il('download',t('dcsv')),doCSV),btn('dlbtn dlpdf',il('download',t('dpdf')),function(){doPDF();})]));
  var sales=fsales();var ts=todaySales();
  var mg=div('mgrid');
  [{l:t('tr'),v:ks(ts.reduce(function(a,s){return a+s.total;},0)),ac:true},{l:t('to'),v:ts.length},{l:t('perr'),v:ks(sales.reduce(function(a,s){return a+s.total;},0)),ac:true},{l:t('pero'),v:sales.length}].forEach(function(m){mg.appendChild(div('mcard',[div('mlbl',m.l),div('mval'+(m.ac?' ac':''),String(m.v))]));});
  sc.appendChild(mg);
  sc.appendChild(div('sechd',[span('sectit',t('psal'))],'margin-top:8px'));
  var pm={};sales.forEach(function(s){s.items.forEach(function(i){if(!pm[i.name])pm[i.name]={q:0,r:0};pm[i.name].q+=i.qty;pm[i.name].r+=i.price*i.qty;});});
  var pt=h('table',{cls:'dtable',style:'margin-bottom:14px'});var pth=h('thead');var phr=h('tr');[t('pnm'),t('qty'),t('rv')].forEach(function(v){phr.appendChild(h('th',{},v));});pth.appendChild(phr);pt.appendChild(pth);
  var ptb=h('tbody');var ents=Object.entries(pm).sort(function(a,b){return b[1].r-a[1].r;});
  if(!ents.length){var tr=h('tr');var td=h('td',{colspan:'3',style:'text-align:center;color:var(--muted);padding:16px'},t('nos'));tr.appendChild(td);ptb.appendChild(tr);}
  ents.forEach(function(e){var tr=h('tr');[e[0],e[1].q,ks(e[1].r)].forEach(function(v){tr.appendChild(h('td',{},String(v)));});ptb.appendChild(tr);});
  pt.appendChild(ptb);sc.appendChild(pt);
  sc.appendChild(div('sechd',[span('sectit',t('rec'))]));
  var recent=[].concat(sales).reverse().slice(0,30);
  if(!recent.length)sc.appendChild(div('',t('nos'),'text-align:center;color:var(--muted);font-size:12px;padding:24px;'));
  recent.forEach(function(s){
    var top=div('stop',[div('smeta',['Cash'+(s.staffName?' \xb7 '+s.staffName:'')+(s.tabName?' ['+s.tabName+']':''),h('br'),new Date(s.time).toLocaleString()]),span('samt',ks(s.total))]);
    var card=div('scard',[top,div('sitems',s.items.map(function(i){return i.name+' \xd7'+i.qty;}).join(', '))]);
    card.appendChild(div('','Received: '+ks(s.cashReceived)+'  \xb7  Change: '+ks(s.change||0),'font-size:11px;color:var(--muted);margin-top:3px;'));
    sc.appendChild(card);
  });
  wrap.appendChild(sc);return[wrap];
}
