/*!
 * AkihiroLabs POS — js/views/dashboard.js
 * Dashboard: KPIs, top sellers, low stock, open tabs.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── Dashboard ───────────────────────────────────────────────
function renderDash(){
  var wrap=div('fullcol');var sc=div('scroll');
  if(isHH()){
    var b=div('hh-banner',[icon('percent',18),div('',[div('hh-title',t('hhActive')+' \u2212'+hhPct()+'%'),div('hh-sub',t('untilT',{t:CFG.happyHourEnd})+' \xb7 '+(CFG.happyHourCats||[]).join(', '))])]);
    sc.appendChild(b);
  }
  sc.appendChild(div('dash-sec-title',t('quickActs')));
  var qa=div('qa-row');
  qa.appendChild(btn('addbtn',t('newSale'),function(){S.tabMode=false;S.editingTab=null;S.cart=[];S.view='pos';render();}));
  qa.appendChild(btn('btn btnpr',t('newTab'),function(){S.modal={type:'newTab'};render();}));
  sc.appendChild(qa);
  var ts=todaySales();var todayRev=ts.reduce(function(a,s){return a+s.total;},0);
  var openTabsN=S.tabs.filter(function(x){return x.status==='open';}).length;
  var lowN=lowStk().length;
  var mg=div('dash-grid');
  [{icon:'wallet',lbl:t('tr'),val:ks(todayRev),cls:'ac'},{icon:'receipt',lbl:t('to'),val:ts.length},
   {icon:'clipboard',lbl:t('openTabs'),val:openTabsN,click:function(){S.view='tabs';render();}},
   {icon:'alert',lbl:t('lowStock'),val:lowN,cls:lowN>0?'warn':'',click:function(){S.view='inv';render();}}
  ].forEach(function(m){
    var c=div('dash-card'+(m.click?' click':''),[span('dash-icon',icon(m.icon,18)),div('dash-lbl',m.lbl),div('dash-val'+(m.cls?' '+m.cls:''),String(m.val))]);
    if(m.click)c.onclick=m.click;mg.appendChild(c);
  });
  sc.appendChild(mg);
  var cols=div('dash-cols');
  var left=div('dash-sec');left.appendChild(div('dash-sec-title',il('chart',t('topItems'),13)));
  var top=topProds();
  if(!top.length){left.appendChild(div('',t('nos'),'color:var(--muted);font-size:13px;'));}
  else{
    var maxR=top[0][1].r||1;var bc=div('bar-chart');
    top.forEach(function(e){
      var pct=Math.round(e[1].r/maxR*100);
      var fill=div('bar-fill');fill.style.width=pct+'%';
      bc.appendChild(div('bar-row',[div('bar-name',e[0]),div('bar-track',[fill]),div('bar-val',ks(e[1].r))]));
    });
    left.appendChild(bc);
  }
  var right=div('dash-sec');right.appendChild(div('dash-sec-title',il('alert',t('lowStock'),13)));
  var ls=lowStk();
  if(!ls.length){right.appendChild(div('',il('checkCircle',t('allOk')),'color:var(--success);font-size:13px;'));}
  else{
    var al=div('alert-list');
    ls.slice(0,8).forEach(function(e){
      var isDanger=e.stock<=0;
      al.appendChild(div('alert-item'+(isDanger?' out':''),[div('alert-nm',e.name),div('alert-st'+(isDanger?' out':''),e.stock<=0?t('oos'):t('left',{n:e.stock}))]));
    });
    right.appendChild(al);
  }
  cols.appendChild(left);cols.appendChild(right);sc.appendChild(cols);
  var openList=S.tabs.filter(function(x){return x.status==='open';});
  if(openList.length){
    sc.appendChild(div('dash-sec-title',il('clipboard',t('openTabs'),13)));
    var tc=div('tab-cards');
    openList.slice(0,4).forEach(function(tab){
      var card=div('tab-card',[div('tab-card-nm',tab.name),div('tab-card-items',tab.items.map(function(i){return i.name+' \xd7'+i.qty;}).join(', ')||t('empty')),div('tab-card-total',ks(tab.total||0)),div('tab-card-meta',hm(tab.createdAt))]);
      card.onclick=function(){loadTab(tab);};card.style.cursor='pointer';tc.appendChild(card);
    });
    sc.appendChild(tc);
  }
  wrap.appendChild(sc);return[wrap];
}
