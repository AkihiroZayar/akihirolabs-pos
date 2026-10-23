/*!
 * AkihiroLabs POS — js/views/pos.js
 * POS screen: product grid, cart, cash numpad, checkout.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── POS ─────────────────────────────────────────────────────
function renderPOS(){
  var lc=div('lcol');var rc=div('rcol');
  var lf=div('lfilters');var sw=div('swrap');
  var ico=icon('search',13,'sico');
  sw.appendChild(ico);
  var si=inp({cls:'sbar',placeholder:t('srch'),value:S.search,type:'text'});
  si.oninput=function(e){S.search=e.target.value;refreshPG();};sw.appendChild(si);lf.appendChild(sw);
  var cr=div('catrow');
  cats().forEach(function(c){var b=btn('catb'+(S.cat===c?' on':''),c,function(){S.cat=c;cr.querySelectorAll('.catb').forEach(function(x){x.classList.toggle('on',x.textContent===c);});refreshPG();});cr.appendChild(b);});
  lf.appendChild(cr);lc.appendChild(lf);
  var pgWrap=div('pgrid-wrap');var pg=div('pgrid');
  var hh=isHH();
  function refreshPG(){
    pg.innerHTML='';var fp=fprods();
    if(!fp.length){pg.appendChild(div('','\u2014','grid-column:1/-1;text-align:center;padding:30px;color:var(--muted);'));return;}
    fp.forEach(function(p){
      var hasSz=p.sizes&&p.sizes.length>0;
      var minStk=p.minStock||0;
      var sc2=p.stock===0?'no':(minStk>0&&p.stock<=minStk?'lo':'');
      var sl=p.stock===0?t('oos'):(minStk>0&&p.stock<=minStk?t('low',{n:p.stock}):t('ins',{n:p.stock}));
      var hhOn=hh&&CFG.happyHourCats&&CFG.happyHourCats.indexOf(p.category)>=0;
      var minP=hasSz?Math.min.apply(null,p.sizes.map(function(s){return effPrice(p,s);})):effPrice(p,null);
      var maxP=hasSz?Math.max.apply(null,p.sizes.map(function(s){return effPrice(p,s);})):effPrice(p,null);
      var priceStr=hasSz?(minP===maxP?ks(minP):ks(minP)+' \u2013 '+ks(maxP)):ks(effPrice(p,null));
      var children=[div('pname',p.name),div('pprice',priceStr),div('pstock '+sc2,sl)];
      if(hasSz)children.push(div('psize-hint',p.sizes.map(function(s){return s.label;}).join(' / ')));
      if(hhOn)children.push(div('hh-badge','\u2212'+hhPct()+'%'));
      var card=div('pcard'+(p.stock===0?' gone':''),children);
      card.onclick=function(){if(p.stock>0)tryAdd(p);};pg.appendChild(card);
    });
  }
  refreshPG();pgWrap.appendChild(pg);lc.appendChild(pgWrap);
  var cartQty=S.cart.reduce(function(a,i){return a+i.qty;},0);
  var cartTitle=S.tabMode&&S.editingTab?il('clipboard',S.editingTab.name):t('cart')+' ('+cartQty+')';
  rc.appendChild(div('ch',[span('ctitle',cartTitle),btn('clrbtn',t('clr'),function(){S.cart=[];S.cashReceived=0;render();})]));
  var cl=div('clist');
  if(!S.cart.length){cl.appendChild(div('cempty','\u2014  '+t('emp')));}
  else{S.cart.forEach(function(item){var qc=div('qctrl',[btn('qbtn',icon('minus',12),function(){chqty(item.key,-1);}),span('qnum',String(item.qty)),btn('qbtn',icon('plus',12),function(){chqty(item.key,1);})]);cl.appendChild(div('citem',[div('ciname',item.name),qc,div('ciprice',ks(item.price*item.qty))]));});}
  rc.appendChild(cl);
  var total=cartTotal();
  var cs=div('csummary');cs.appendChild(div('srow',[span('',t('sub')),span('',ks(total))]));cs.appendChild(div('stotal',[span('',t('tot')),span('tv',ks(total))]));rc.appendChild(cs);
  var cc=div('ccash');cc.appendChild(div('cash-label',t('cashRec')));
  var cd=div('cash-display',S.cashReceived>0?S.cashReceived.toLocaleString()+' Ks':'0 Ks');cd.id='cash-display';
  if(S.cashReceived>0){var ch=S.cashReceived-total;cd.style.color=ch<0?'var(--danger)':ch===0?'var(--success)':'var(--accent2)';}
  cc.appendChild(cd);
  var qb=div('quick-btns');if(total<=0)qb.style.display='none';
  qAmts(total).forEach(function(amt){var isExact=amt===total;var b=btn('qkbtn',isExact?il('check',t('exact'),12):ks(amt),function(){S.cashReceived=amt;doRefresh();});if(isExact)b.style.cssText='border-color:var(--accent);color:var(--accent)';qb.appendChild(b);});
  cc.appendChild(qb);rc.appendChild(cc);
  var cn=div('cnumpad');var np=div('numpad-wrap');
  ['1','2','3','4','5','6','7','8','9','000','0','\u232b'].forEach(function(k){
    var b=btn('np-btn'+(k==='\u232b'?' np-del':k==='000'?' np-triple':''),k==='\u232b'?icon('del',24):k,function(){
      var cur=S.cashReceived===0?'':String(S.cashReceived);
      if(k==='\u232b')cur=cur.slice(0,-1);else if(k==='000')cur=cur+'000';else cur=cur+k;
      S.cashReceived=Math.min(parseInt(cur)||0,9999999);doRefresh();
    });np.appendChild(b);
  });
  cn.appendChild(np);rc.appendChild(cn);
  var cb=div('cbottom');
  var changeBox=div('change-box empty');changeBox.id='change-box';
  changeBox.appendChild(div('change-lbl empty','\u2014'));changeBox.appendChild(div('change-amt empty','0 Ks'));cb.appendChild(changeBox);
  if(S.tabMode){
    cb.appendChild(btn('tab-save-btn',t('saveTab'),function(){saveTab();}));
    var chargeB=btn('pay-btn',t('chargeTab'),function(){chargeTab();});chargeB.id='pay-btn';chargeB.disabled=true;cb.appendChild(chargeB);
  }else{
    var payBtn=btn('pay-btn',t('confirmPay'),function(){checkout();});payBtn.id='pay-btn';payBtn.disabled=true;cb.appendChild(payBtn);
  }
  cb.appendChild(div('pos-footer',['Developed by ',h('b',{},'AkihiroLabs'),' \xb7 v'+APP_VERSION+' \xb7 ',h('a',{cls:'discord-link',href:DISCORD_URL,target:'_blank',rel:'noopener'},il('chat','Discord',11))]));rc.appendChild(cb);
  doRefresh();
  function doRefresh(){
    var ch=S.cashReceived-total;
    var cdEl=document.getElementById('cash-display')||cd;
    cdEl.textContent=S.cashReceived>0?S.cashReceived.toLocaleString()+' Ks':'0 Ks';
    cdEl.style.color=ch<0?'var(--danger)':ch===0?'var(--success)':'var(--accent2)';
    var box=document.getElementById('change-box')||changeBox;
    var cls2=S.cashReceived===0?'empty':ch>0?'ok':ch===0?'zero':'short';
    box.className='change-box '+cls2;box.innerHTML='';
    if(S.cashReceived===0){box.appendChild(div('change-lbl empty',t('enterCash')));box.appendChild(div('change-amt empty','\u2014'));}
    else{box.appendChild(div('change-lbl '+cls2,ch>0?t('change'):ch===0?il('check',t('exact'),12):t('short')));box.appendChild(div('change-amt '+cls2,ks(Math.abs(ch))));}
    var pb=document.getElementById('pay-btn');if(pb)pb.disabled=(S.cart.length===0||ch<0);
  }
  return[lc,rc];
}
