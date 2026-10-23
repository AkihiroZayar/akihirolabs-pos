/*!
 * AkihiroLabs POS — js/views/tabs.js
 * Open customer tabs list.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── Tabs view ───────────────────────────────────────────────
function renderTabs(){
  var wrap=div('fullcol');var sc=div('scroll');
  var hd=div('sechd',[span('sectit',t('openTabs')),btn('addbtn','+ '+t('newTab'),function(){S.modal={type:'newTab'};render();})]);sc.appendChild(hd);
  var open=S.tabs.filter(function(x){return x.status==='open';});
  if(!open.length){sc.appendChild(div('',t('noTabs'),'text-align:center;color:var(--muted);padding:40px;font-size:13px;'));}
  else{
    var tc=div('tab-cards');
    open.forEach(function(tab){
      var card=div('tab-card',[div('tab-card-nm',tab.name),div('tab-card-items',tab.items.map(function(i){return i.name+' \xd7'+i.qty;}).join(', ')||'Empty'),div('tab-card-total',ks(tab.total||0)),div('tab-card-meta','Opened: '+new Date(tab.createdAt).toLocaleString())]);
      var acts=div('tab-card-acts');
      var ob=btn('btn btnpr',t('openTab'),function(){loadTab(tab);});ob.style.fontSize='11px';
      var db=btn('btn btndg','Delete',function(){delTab(tab.id);});db.style.fontSize='11px';
      acts.appendChild(ob);acts.appendChild(db);card.appendChild(acts);tc.appendChild(card);
    });
    sc.appendChild(tc);
  }
  wrap.appendChild(sc);return[wrap];
}
